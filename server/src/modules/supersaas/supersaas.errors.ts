import { AxiosError } from 'axios';

import { AppError } from '../../lib/errors';

export function mapSupersaasError(error: unknown): never {
  if (error instanceof AppError) throw error;
  if (error instanceof AxiosError) {
    const status = error.response?.status ?? 502;
    const data = error.response?.data;
    if (status === 404) {
      throw new AppError('NOT_FOUND', 'SuperSaaS resource not found', 404, data);
    }
    if (status === 401 || status === 403) {
      throw new AppError('SUPER_SAAS_ERROR', 'SuperSaaS authentication/authorization error', 502, data);
    }
    if (status === 422) {
      throw new AppError('BUSINESS_RULE_VIOLATION', 'SuperSaaS validation failed', 422, data);
    }
    throw new AppError('SUPER_SAAS_ERROR', 'SuperSaaS request failed', 502, {
      status,
      data,
      url: error.config?.url,
      method: error.config?.method,
    });
  }
  throw new AppError('SUPER_SAAS_ERROR', 'Unexpected SuperSaaS error', 502);
}
