import 'fastify';

import type { JwtAuthContext } from '../modules/auth/auth.types';
import type { UserEntity } from '../modules/users/users.types';

declare module 'fastify' {
  interface FastifyRequest {
    auth?: JwtAuthContext;
    currentUser?: UserEntity;
    actorUser?: UserEntity;
    impersonating?: boolean;
    idempotencyCache?: { hit: boolean; payload?: unknown };
  }
}
