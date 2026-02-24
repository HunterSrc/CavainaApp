import type { FastifyRequest } from 'fastify';

import { AuditRepository } from './audit.repository';
import { AuthService } from '../auth/auth.service';
import { BookingsService } from '../bookings/bookings.service';
import { UsersRepository } from '../users/users.repository';
import { UsersService } from '../users/users.service';
import { AppError } from '../../lib/errors';
import { SupersaasService } from '../supersaas/supersaas.service';
import { toPublicUserDto } from '../users/users.types';
import { env } from '../../config/env';

export class AdminService {
  private readonly usersService: UsersService;

  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authService: AuthService,
    private readonly bookingsService: BookingsService,
    private readonly auditRepository: AuditRepository,
    private readonly supersaasService: SupersaasService,
  ) {
    this.usersService = new UsersService(usersRepository, supersaasService);
  }

  listUsers(query: any) {
    return this.usersService.listUsers(query);
  }

  async getUser(id: string) {
    return toPublicUserDto(await this.usersService.getByIdOrThrow(id));
  }

  updateUser(id: string, patch: any) {
    return this.usersService.adminUpdateUser(id, patch);
  }

  resetPassword(actorUserId: string, targetUserId: string, newPassword: string) {
    return this.authService.adminResetPassword(actorUserId, targetUserId, newPassword);
  }

  async createBookingForUser(actorUserId: string, body: { userId: string; start: string }) {
    const actor = await this.usersService.getByIdOrThrow(actorUserId);
    const target = await this.usersService.getByIdOrThrow(body.userId);
    return this.bookingsService.createForUser(actor, target, { start: body.start }, { bypass48h: true, auditAction: 'ADMIN_CREATE_BOOKING_FOR_USER' });
  }

  async updateBooking(actorUserId: string, bookingId: string, body: { start: string }) {
    const actor = await this.usersService.getByIdOrThrow(actorUserId);
    return this.bookingsService.updateBooking(actor, bookingId, { start: body.start });
  }

  async deleteBooking(actorUserId: string, bookingId: string) {
    const actor = await this.usersService.getByIdOrThrow(actorUserId);
    return this.bookingsService.deleteBooking(actor, bookingId);
  }

  listBookings(query: any) {
    return this.bookingsService.listForAdmin(query);
  }

  async startImpersonation(request: FastifyRequest, targetUserId: string) {
    const actor = request.currentUser;
    if (!actor || actor.role !== 'ADMIN') throw new AppError('FORBIDDEN', 'Admin only', 403);
    const target = await this.usersService.getByIdOrThrow(targetUserId);
    const token = await request.server.jwt.sign(
      { sub: target.id, role: target.role, type: 'access', impersonatedBy: actor.id },
      { key: env.JWT_ACCESS_SECRET, expiresIn: env.JWT_ACCESS_TTL },
    );
    await this.auditRepository.create({ actorUserId: actor.id, targetUserId: target.id, action: 'ADMIN_IMPERSONATION_START' });
    return { accessToken: token, targetUser: toPublicUserDto(target) };
  }

  async stopImpersonation(actorUserId: string, targetUserId?: string | null) {
    await this.auditRepository.create({ actorUserId, targetUserId: targetUserId ?? null, action: 'ADMIN_IMPERSONATION_STOP' });
    return { stopped: true };
  }
}
