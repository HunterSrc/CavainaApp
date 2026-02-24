import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors';
import { getIdempotencyKey, readIdempotentResponse, sendIdempotent, writeIdempotentResponse } from '../utils/idempotency';

export async function idempotencyPreHandler(request: FastifyRequest, reply: FastifyReply) {
  const key = getIdempotencyKey(request);
  if (!key) return;
  const cached = readIdempotentResponse(key);
  if (cached) {
    request.idempotencyCache = { hit: true, payload: cached.payload };
    return sendIdempotent(reply, cached);
  }
  request.idempotencyCache = { hit: false };
}

export function cacheIdempotentResponse(request: FastifyRequest, reply: FastifyReply, payload: unknown) {
  const key = getIdempotencyKey(request);
  if (!key) return;
  if (reply.statusCode < 200 || reply.statusCode >= 300) return;
  if (!payload || typeof payload !== 'object') return;
  writeIdempotentResponse(key, reply.statusCode, payload);
}

export function requireIdempotencyKeyForClientRetries(request: FastifyRequest) {
  const key = getIdempotencyKey(request);
  if (!key) {
    throw new AppError('VALIDATION_ERROR', 'Missing Idempotency-Key header for this operation', 400);
  }
}
