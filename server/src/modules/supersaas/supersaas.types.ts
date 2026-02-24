export type SupersaasUserPayload = {
  id?: number;
  user_id?: string;
  name: string;
  email: string;
  phone?: string;
  full_name?: string;
};

export type SupersaasAppointment = {
  id: number | string;
  start: string;
  finish: string;
  user_id?: string;
  user?: { id?: string; email?: string; name?: string };
  status?: string;
  resource_id?: number | string;
  [key: string]: unknown;
};

export type SupersaasAvailabilitySlot = {
  start: string;
  finish: string;
  available?: boolean;
  status?: string;
  [key: string]: unknown;
};

export type SupersaasCreateAppointmentInput = {
  scheduleId: number;
  start: string;
  finish: string;
  resourceId?: string | number;
  userKey: string;
  fields?: Record<string, unknown>;
};
