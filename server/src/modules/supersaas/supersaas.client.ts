import axios, { type AxiosInstance, type AxiosRequestConfig } from 'axios';

import { env } from '../../config/env';
import { logger } from '../../lib/logger';
import { mapSupersaasError } from './supersaas.errors';
import type {
  SupersaasAppointment,
  SupersaasAvailabilitySlot,
  SupersaasCreateAppointmentInput,
  SupersaasUserPayload,
} from './supersaas.types';

export class SupersaasClient {
  private readonly http: AxiosInstance;

  constructor() {
    this.http = axios.create({
      baseURL: env.SUPERSAAS_BASE_URL,
      timeout: env.SUPERSAAS_TIMEOUT_MS,
      auth: {
        username: env.SUPERSAAS_ACCOUNT,
        password: env.SUPERSAAS_API_KEY,
      },
      headers: { Accept: 'application/json' },
    });
  }

  private async requestWithRetry<T>(config: AxiosRequestConfig, attempt = 0): Promise<T> {
    try {
      const response = await this.http.request<T>(config);
      return response.data;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const transient = !status || status >= 500 || status === 429;
      if (transient && attempt < env.SUPERSAAS_RETRY_COUNT) {
        const backoff = 200 * (attempt + 1);
        logger.warn({ attempt, backoff, url: config.url }, 'SuperSaaS transient error, retrying');
        await new Promise((r) => setTimeout(r, backoff));
        return this.requestWithRetry<T>(config, attempt + 1);
      }
      mapSupersaasError(error);
    }
  }

  // TODO verify exact SuperSaaS endpoints/params against account docs. This wrapper isolates any path differences.
  upsertUser(user: SupersaasUserPayload) {
    return this.requestWithRetry<{ user?: SupersaasUserPayload }>({
      method: 'POST',
      url: '/users',
      data: { user },
    });
  }

  listUsers() {
    return this.requestWithRetry<{ users: SupersaasUserPayload[] }>({ method: 'GET', url: '/users' });
  }

  getUser(userKeyOrId: string) {
    return this.requestWithRetry<{ user: SupersaasUserPayload }>({ method: 'GET', url: `/users/${encodeURIComponent(userKeyOrId)}` });
  }

  listAppointments(params: { scheduleId?: number; from?: string; to?: string; userKey?: string }) {
    return this.requestWithRetry<{ appointments: SupersaasAppointment[] }>({
      method: 'GET',
      url: `/schedules/${params.scheduleId ?? env.SUPERSAAS_SCHEDULE_ID}/appointments`,
      params: {
        from: params.from,
        to: params.to,
        user_id: params.userKey,
      },
    });
  }

  getAppointment(bookingId: string | number, scheduleId = env.SUPERSAAS_SCHEDULE_ID) {
    return this.requestWithRetry<{ appointment: SupersaasAppointment }>({
      method: 'GET',
      url: `/schedules/${scheduleId}/appointments/${bookingId}`,
    });
  }

  createAppointment(input: SupersaasCreateAppointmentInput) {
    return this.requestWithRetry<{ appointment?: SupersaasAppointment }>({
      method: 'POST',
      url: `/schedules/${input.scheduleId}/appointments`,
      data: {
        appointment: {
          start: input.start,
          finish: input.finish,
          user_id: input.userKey,
          resource_id: input.resourceId,
          ...input.fields,
        },
      },
    });
  }

  updateAppointment(args: {
    bookingId: string | number;
    scheduleId?: number;
    start: string;
    finish: string;
    userKey?: string;
    fields?: Record<string, unknown>;
  }) {
    return this.requestWithRetry<{ appointment?: SupersaasAppointment }>({
      method: 'PUT',
      url: `/schedules/${args.scheduleId ?? env.SUPERSAAS_SCHEDULE_ID}/appointments/${args.bookingId}`,
      data: {
        appointment: {
          start: args.start,
          finish: args.finish,
          ...(args.userKey ? { user_id: args.userKey } : {}),
          ...(args.fields ?? {}),
        },
      },
    });
  }

  deleteAppointment(bookingId: string | number, scheduleId = env.SUPERSAAS_SCHEDULE_ID) {
    return this.requestWithRetry<void>({
      method: 'DELETE',
      url: `/schedules/${scheduleId}/appointments/${bookingId}`,
    });
  }

  getAvailability(params: { scheduleId?: number; from: string; to: string }) {
    return this.requestWithRetry<{ slots: SupersaasAvailabilitySlot[] }>({
      method: 'GET',
      url: `/schedules/${params.scheduleId ?? env.SUPERSAAS_SCHEDULE_ID}/availability`,
      params: { from: params.from, to: params.to },
    });
  }
}
