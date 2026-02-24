import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { registerErrorHandler } from '../../src/middleware/error-handler';
import { authRoutes } from '../../src/modules/auth/auth.routes';
import { container } from '../../src/lib/container';
import { env } from '../../src/config/env';

describe('auth routes', () => {
  const app = Fastify();

  beforeEach(async () => {
    if (!app.hasDecorator('jwt')) {
      await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
      registerErrorHandler(app);
      await app.register(authRoutes);
      await app.ready();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('POST /auth/login returns tokens and user', async () => {
    vi.spyOn(container.services.authService, 'validateCredentials').mockResolvedValue({
      id: 'u1',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario@example.com',
      phone: null,
      role: 'USER',
      isActive: true,
      supersaasUserKey: 'u1fk',
      createdAt: new Date('2030-01-01T00:00:00Z'),
      updatedAt: new Date('2030-01-01T00:00:00Z'),
      passwordHash: 'hash',
    } as any);
    vi.spyOn(container.services.authService, 'createRefreshSession').mockResolvedValue({} as any);

    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
      payload: { email: 'mario@example.com', password: 'password123' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.data.user.email).toBe('mario@example.com');
    expect(body.data.tokens.accessToken).toBeTypeOf('string');
    expect(body.data.tokens.refreshToken).toBeTypeOf('string');
  });
});
