import { z, ZodError, type ZodTypeAny } from 'zod';

import { AppError } from '../lib/errors';

export type RequestSchemas = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
  response?: ZodTypeAny;
};

export function parseOrThrow<T extends ZodTypeAny>(schema: T, value: unknown) {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new AppError('VALIDATION_ERROR', 'Request validation failed', 400, error.flatten());
    }
    throw error;
  }
}

export { z };
