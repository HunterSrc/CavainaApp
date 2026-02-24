import { FastifyReply, FastifyRequest } from 'fastify';

const cache = new Map<string, { statusCode: number; payload: unknown; expiresAt: number }>();
const TTL_MS = 60_000;

export function getIdempotencyKey(request: FastifyRequest): string | undefined {
  const key = request.headers['idempotency-key'];
  return typeof key === 'string' && key.trim() ? key.trim() : undefined;
}

export function readIdempotentResponse(key: string) {
  const hit = cache.get(key);
  if (!hit) return null;
  if (Date.now() > hit.expiresAt) {
    cache.delete(key);
    return null;
  }
  return hit;
}

export function writeIdempotentResponse(key: string, statusCode: number, payload: unknown) {
  cache.set(key, { statusCode, payload, expiresAt: Date.now() + TTL_MS });
}

export function sendIdempotent(reply: FastifyReply, cached: { statusCode: number; payload: unknown }) {
  return reply.code(cached.statusCode).send(cached.payload);
}
