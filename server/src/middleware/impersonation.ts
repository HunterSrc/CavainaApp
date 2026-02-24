import type { FastifyRequest } from 'fastify';

import { env } from '../config/env';
import { AppError } from '../lib/errors';
import { container } from '../lib/container';

export async function applyAdminImpersonation(request: FastifyRequest) {
  const headerName = env.ADMIN_IMPERSONATION_HEADER.toLowerCase();
  const headerValue = request.headers[headerName];
  const targetUserId = typeof headerValue === 'string' ? headerValue : undefined;

  if (request.auth?.impersonatedBy) {
    const actor = await container.services.usersService.getByIdOrThrow(request.auth.impersonatedBy);
    request.actorUser = actor;
    request.impersonating = true;
    return;
  }

  if (!targetUserId) return;
  if (request.currentUser?.role !== 'ADMIN') {
    throw new AppError('FORBIDDEN', 'Only admin can impersonate', 403);
  }

  const target = await container.services.usersService.getByIdOrThrow(targetUserId);
  request.actorUser = request.currentUser;
  request.currentUser = target;
  request.impersonating = true;
}
