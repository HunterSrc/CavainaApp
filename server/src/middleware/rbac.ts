import type { FastifyRequest } from 'fastify';
import type { UserRole } from '@prisma/client';

import { AppError } from '../lib/errors';

export const requireRoles = (...roles: UserRole[]) => {
  return async (request: FastifyRequest) => {
    const role = request.currentUser?.role ?? request.auth?.role;
    if (!role || !roles.includes(role)) {
      throw new AppError('FORBIDDEN', 'Insufficient permissions', 403, { required: roles });
    }
  };
};
