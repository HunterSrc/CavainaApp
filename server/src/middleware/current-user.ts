import type { FastifyRequest } from 'fastify';

import { AppError } from '../lib/errors';
import { container } from '../lib/container';

export async function loadCurrentUser(request: FastifyRequest) {
  const auth = request.auth;
  if (!auth?.sub) throw new AppError('UNAUTHORIZED', 'Authentication required', 401);
  const user = await container.services.usersService.getByIdOrThrow(auth.sub);
  if (!user.isActive) throw new AppError('FORBIDDEN', 'User account is inactive', 403);
  request.currentUser = user;
  request.actorUser = user;
}
