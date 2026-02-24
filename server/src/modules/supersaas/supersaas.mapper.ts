import type { UserEntity } from '../users/users.types';
import type { SupersaasAppointment, SupersaasAvailabilitySlot, SupersaasUserPayload } from './supersaas.types';

export type NormalizedBooking = {
  bookingId: string;
  start: string;
  end: string;
  status: string;
  userKey?: string | null;
  raw?: unknown;
};

export const toSupersaasUserKey = (user: Pick<UserEntity, 'id'>) => `${user.id}fk`;

export function mapLocalUserToSupersaasUser(user: UserEntity): SupersaasUserPayload {
  return {
    user_id: user.supersaasUserKey ?? toSupersaasUserKey(user),
    name: `${user.firstName} ${user.lastName}`.trim(),
    full_name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.email,
    phone: user.phone ?? undefined,
  };
}

export function mapSupersaasAppointment(item: SupersaasAppointment): NormalizedBooking {
  return {
    bookingId: String(item.id),
    start: String(item.start),
    end: String(item.finish),
    status: typeof item.status === 'string' ? item.status : 'booked',
    userKey: (item.user_id as string | undefined) ?? (item.user?.id as string | undefined) ?? null,
    raw: item,
  };
}

export function mapBusySlotAnonymous(item: SupersaasAppointment | SupersaasAvailabilitySlot) {
  return {
    start: String((item as SupersaasAppointment).start),
    end: String((item as SupersaasAppointment).finish),
    status: 'occupied' as const,
  };
}
