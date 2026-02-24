import type { FastifyReply, FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors';
import type { JwtAuthContext } from '../modules/auth/auth.types';

export async function requireAuth(request: FastifyRequest, _reply: FastifyReply) {
  try {
    const payload = (await request.jwtVerify()) as JwtAuthContext;
    if (payload.type !== 'access') {
      throw new AppError('UNAUTHORIZED', 'Invalid token type', 401);
    }
    request.auth = payload;
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  }
}
