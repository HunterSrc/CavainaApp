import { env } from '../../config/env';
import type { UserEntity } from '../users/users.types';
import {
  mapBusySlotAnonymous,
  mapLocalUserToSupersaasUser,
  mapSupersaasAppointment,
  toSupersaasUserKey,
  type NormalizedBooking,
} from './supersaas.mapper';
import { SupersaasClient } from './supersaas.client';

export class SupersaasService {
  constructor(private readonly client = new SupersaasClient()) {}

  userKeyFor(user: Pick<UserEntity, 'id'>) {
    return toSupersaasUserKey(user);
  }

  async upsertUser(user: UserEntity) {
    return this.client.upsertUser(mapLocalUserToSupersaasUser(user));
  }

  listUsers() {
    return this.client.listUsers();
  }

  async listBookings(args: { from?: string; to?: string; userKey?: string }): Promise<NormalizedBooking[]> {
    const res = await this.client.listAppointments({
      scheduleId: env.SUPERSAAS_SCHEDULE_ID,
      from: args.from,
      to: args.to,
      userKey: args.userKey,
    });
    return (res.appointments ?? []).map(mapSupersaasAppointment).sort((a, b) => a.start.localeCompare(b.start));
  }

  async getBooking(bookingId: string): Promise<NormalizedBooking> {
    const res = await this.client.getAppointment(bookingId, env.SUPERSAAS_SCHEDULE_ID);
    return mapSupersaasAppointment(res.appointment);
  }

  async createBooking(input: { start: string; end: string; userKey: string; fields?: Record<string, unknown> }) {
    const res = await this.client.createAppointment({
      scheduleId: env.SUPERSAAS_SCHEDULE_ID,
      start: input.start,
      finish: input.end,
      userKey: input.userKey,
      fields: input.fields,
    });
    if (res.appointment) return mapSupersaasAppointment(res.appointment);
    // TODO parse Location header if SuperSaaS omits body and exposes created resource via Location.
    return { bookingId: 'unknown', start: input.start, end: input.end, status: 'booked', userKey: input.userKey };
  }

  async updateBooking(input: { bookingId: string; start: string; end: string; userKey?: string; fields?: Record<string, unknown> }) {
    const res = await this.client.updateAppointment({
      bookingId: input.bookingId,
      scheduleId: env.SUPERSAAS_SCHEDULE_ID,
      start: input.start,
      finish: input.end,
      userKey: input.userKey,
      fields: input.fields,
    });
    return res.appointment ? mapSupersaasAppointment(res.appointment) : this.getBooking(input.bookingId);
  }

  deleteBooking(bookingId: string) {
    return this.client.deleteAppointment(bookingId, env.SUPERSAAS_SCHEDULE_ID);
  }

  async freeSlots(from: string, to: string) {
    const res = await this.client.getAvailability({ scheduleId: env.SUPERSAAS_SCHEDULE_ID, from, to });
    return (res.slots ?? [])
      .filter((s) => s.available !== false && s.status !== 'occupied')
      .map((s) => ({ start: String(s.start), end: String(s.finish), status: 'free' as const }))
      .sort((a, b) => a.start.localeCompare(b.start));
  }

  async busySlotsAnonymous(from: string, to: string) {
    const bookings = await this.listBookings({ from, to });
    return bookings.map((b) => mapBusySlotAnonymous({ start: b.start, finish: b.end }));
  }
}
