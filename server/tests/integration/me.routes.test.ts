import Fastify from 'fastify';
import jwt from '@fastify/jwt';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { env } from '../../src/config/env';
import { container } from '../../src/lib/container';
import { registerErrorHandler } from '../../src/middleware/error-handler';
import { usersRoutes } from '../../src/modules/users/users.routes';

describe('me routes integration', () => {
  const app = Fastify();
  let accessToken: string;

  beforeEach(async () => {
    if (!app.hasDecorator('jwt')) {
      await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });
      registerErrorHandler(app);
      await app.register(usersRoutes);
      await app.ready();
    }

    accessToken = app.jwt.sign({ sub: 'u1', role: 'USER', type: 'access' });

    vi.spyOn(container.services.usersService, 'getByIdOrThrow').mockResolvedValue({
      id: 'u1',
      firstName: 'Mario',
      lastName: 'Rossi',
      email: 'mario@example.com',
      phone: '+39 333',
      role: 'USER',
      isActive: true,
      supersaasUserKey: 'u1fk',
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);
  });

  afterEach(() => vi.restoreAllMocks());

  it('GET /me/busy-slots returns anonymized slots', async () => {
    vi.spyOn(container.services.availabilityService, 'getBusySlotsAnonymous').mockResolvedValue([
      { start: '2030-01-01T16:00:00Z', end: '2030-01-01T18:00:00Z', status: 'occupied' },
    ] as any);

    const res = await app.inject({
      method: 'GET',
      url: '/me/busy-slots?from=2030-01-01',
      headers: { authorization: `Bearer ${accessToken}` },
    });

    expect(res.statusCode).toBe(200);
    const payload = res.json();
    expect(payload.ok).toBe(true);
    expect(payload.data.items[0]).toEqual({
      start: '2030-01-01T16:00:00Z',
      end: '2030-01-01T18:00:00Z',
      status: 'occupied',
    });
    expect(payload.data.items[0].email).toBeUndefined();
  });

  it('POST /me/bookings returns normalized booking', async () => {
    vi.spyOn(container.services.bookingsService, 'createForUser').mockResolvedValue({
      id: 'b1',
      start: '2030-01-10T18:00:00Z',
      end: '2030-01-10T20:00:00Z',
      status: 'booked',
      owner: { localUserId: 'u1', supersaasUserKey: 'u1fk' },
    } as any);

    const res = await app.inject({
      method: 'POST',
      url: '/me/bookings',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'idempotency-key': 'test-key-1',
      },
      payload: { start: '2030-01-10T19:00:00+01:00' },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.ok).toBe(true);
    expect(body.data.booking.id).toBe('b1');
  });
});
