import type { FastifyRequest } from 'fastify';

import { parseOrThrow, type RequestSchemas } from '../utils/zod';

export function validateRequest(schemas: RequestSchemas) {
  return async (request: FastifyRequest) => {
    if (schemas.params) request.params = parseOrThrow(schemas.params, request.params) as never;
    if (schemas.query) request.query = parseOrThrow(schemas.query, request.query) as never;
    if (schemas.body) request.body = parseOrThrow(schemas.body, request.body) as never;
  };
}
