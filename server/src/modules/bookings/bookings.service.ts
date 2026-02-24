import type { UserEntity } from '../users/users.types';
import { SupersaasService } from '../supersaas/supersaas.service';
import { AuditRepository } from '../admin/audit.repository';
import { UsersRepository } from '../users/users.repository';
import { AppError } from '../../lib/errors';
import { assertOwnershipOrAdmin } from '../../utils/ownership';
import { assertCanModifyOrCancelBy48h, validateAndNormalizeSlot } from '../../utils/slot-policy';
import type { BookingDto } from './bookings.types';

export class BookingsService {
  constructor(
    private readonly supersaasService: SupersaasService,
    private readonly auditRepository: AuditRepository,
    private readonly usersRepository: UsersRepository,
  ) {}

  private toDto(normalized: Awaited<ReturnType<SupersaasService['getBooking']>>): BookingDto {
    const userKey = normalized.userKey ?? null;
    const localUserId = userKey?.endsWith('fk') ? userKey.slice(0, -2) : null;
    return {
      id: normalized.bookingId,
      start: normalized.start,
      end: normalized.end,
      status: normalized.status,
      owner: { localUserId, supersaasUserKey: userKey },
    };
  }

  async listForUser(user: UserEntity, query: { from?: string; to?: string }) {
    const bookings = await this.supersaasService.listBookings({
      from: query.from,
      to: query.to,
      userKey: user.supersaasUserKey ?? this.supersaasService.userKeyFor(user),
    });
    return bookings.map((b) => this.toDto(b));
  }

  async listForAdmin(query: { from?: string; to?: string; userId?: string }) {
    let userKey: string | undefined;
    if (query.userId) {
      const user = await this.usersRepository.findById(query.userId);
      if (!user) throw new AppError('NOT_FOUND', 'Target user not found', 404);
      userKey = user.supersaasUserKey ?? this.supersaasService.userKeyFor(user);
    }
    const bookings = await this.supersaasService.listBookings({ from: query.from, to: query.to, userKey });
    return bookings.map((b) => this.toDto(b));
  }

  async createForUser(actor: UserEntity, target: UserEntity, input: { start: string }, opts?: { bypass48h?: boolean; auditAction?: string }) {
    const slot = validateAndNormalizeSlot(input.start);
    const userKey = target.supersaasUserKey ?? this.supersaasService.userKeyFor(target);
    const created = await this.supersaasService.createBooking({
      start: slot.startUtcIso,
      end: slot.endUtcIso,
      userKey,
      fields: {
        name: `${target.firstName} ${target.lastName}`,
        email: target.email,
        phone: target.phone,
      },
    });

    if (actor.role === 'ADMIN' && actor.id !== target.id) {
      await this.auditRepository.create({
        actorUserId: actor.id,
        targetUserId: target.id,
        bookingId: created.bookingId,
        action: opts?.auditAction ?? 'ADMIN_CREATE_BOOKING_FOR_USER',
        metadata: { start: created.start, end: created.end },
      });
    }
    return this.toDto(created);
  }

  async getBookingForOperation(requester: UserEntity, bookingId: string) {
    const booking = await this.supersaasService.getBooking(bookingId);
    const dto = this.toDto(booking);
    assertOwnershipOrAdmin({
      requesterRole: requester.role,
      requesterUserId: requester.id,
      targetLocalUserId: dto.owner.localUserId,
    });
    return dto;
  }

  async updateBooking(requester: UserEntity, bookingId: string, input: { start: string }, opts?: { targetUserIdForAdmin?: string }) {
    const existing = await this.getBookingForOperation(requester, bookingId);
    assertCanModifyOrCancelBy48h(existing.start, requester.role === 'ADMIN');

    const slot = validateAndNormalizeSlot(input.start);
    let userKey: string | undefined;
    if (requester.role === 'ADMIN' && opts?.targetUserIdForAdmin) {
      const target = await this.usersRepository.findById(opts.targetUserIdForAdmin);
      if (!target) throw new AppError('NOT_FOUND', 'Target user not found', 404);
      userKey = target.supersaasUserKey ?? this.supersaasService.userKeyFor(target);
    }
    const updated = await this.supersaasService.updateBooking({ bookingId, start: slot.startUtcIso, end: slot.endUtcIso, userKey });
    if (requester.role === 'ADMIN' && existing.owner.localUserId && existing.owner.localUserId !== requester.id) {
      await this.auditRepository.create({
        actorUserId: requester.id,
        targetUserId: existing.owner.localUserId,
        bookingId,
        action: 'ADMIN_UPDATE_BOOKING_FOR_USER',
        metadata: { from: existing.start, to: updated.start },
      });
    }
    return this.toDto(updated);
  }

  async deleteBooking(requester: UserEntity, bookingId: string) {
    const existing = await this.getBookingForOperation(requester, bookingId);
    assertCanModifyOrCancelBy48h(existing.start, requester.role === 'ADMIN');
    await this.supersaasService.deleteBooking(bookingId);
    if (requester.role === 'ADMIN' && existing.owner.localUserId && existing.owner.localUserId !== requester.id) {
      await this.auditRepository.create({
        actorUserId: requester.id,
        targetUserId: existing.owner.localUserId,
        bookingId,
        action: 'ADMIN_DELETE_BOOKING_FOR_USER',
        metadata: { start: existing.start },
      });
    }
    return { deleted: true, bookingId };
  }
}
