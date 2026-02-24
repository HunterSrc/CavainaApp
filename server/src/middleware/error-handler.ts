import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { AppError } from '../lib/errors';

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error: unknown, request: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof AppError) {
      request.log.warn({ err: error, code: error.code }, 'AppError');
      return reply.code(error.statusCode).send({
        ok: false,
        error: { code: error.code, message: error.message, details: error.details },
      });
    }

    if (error instanceof ZodError) {
      return reply.code(400).send({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details: error.flatten() },
      });
    }

    request.log.error({ err: error }, 'Unhandled error');
    return reply.code(500).send({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: 'Internal server error' },
    });
  });
}
