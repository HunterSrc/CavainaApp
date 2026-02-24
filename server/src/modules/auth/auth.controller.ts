import type { FastifyReply, FastifyRequest } from 'fastify';
import { DateTime } from 'luxon';

import { env } from '../../config/env';
import { AppError } from '../../lib/errors';
import { ok } from '../../lib/response';
import { container } from '../../lib/container';
import { toPublicUserDto } from '../users/users.types';
import type { JwtAuthContext } from './auth.types';

function parseTtlToSeconds(ttl: string): number {
  const match = ttl.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const value = Number(match[1]);
  const unit = match[2];
  return value * ({ s: 1, m: 60, h: 3600, d: 86400 }[unit] ?? 1);
}

async function issueTokens(request: FastifyRequest, user: { id: string; role: 'ADMIN' | 'USER' }) {
  const refreshTtlSec = parseTtlToSeconds(env.JWT_REFRESH_TTL);
  const accessToken = await request.server.jwt.sign({ sub: user.id, role: user.role, type: 'access' } satisfies JwtAuthContext, {
    key: env.JWT_ACCESS_SECRET,
    expiresIn: env.JWT_ACCESS_TTL,
  });
  const refreshToken = await request.server.jwt.sign({ sub: user.id, role: user.role, type: 'refresh' } satisfies JwtAuthContext, {
    key: env.JWT_REFRESH_SECRET,
    expiresIn: env.JWT_REFRESH_TTL,
  });
  const refreshExpiresAt = DateTime.now().plus({ seconds: refreshTtlSec }).toJSDate();
  return { accessToken, refreshToken, refreshExpiresAt };
}

export const authController = {
  register: async (request: FastifyRequest, reply: FastifyReply) => {
    const body = request.body as any;
    const user = await container.services.authService.register(body);
    const tokens = await issueTokens(request, { id: user.id, role: user.role });
    await container.services.authService.createRefreshSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.refreshExpiresAt,
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip,
    });
    return reply.code(201).send(ok({ user: toPublicUserDto(user), tokens, serverTime: new Date().toISOString() }));
  },

  login: async (request: FastifyRequest) => {
    const body = request.body as any;
    const user = await container.services.authService.validateCredentials(body.email, body.password);
    const tokens = await issueTokens(request, { id: user.id, role: user.role });
    await container.services.authService.createRefreshSession({
      userId: user.id,
      refreshToken: tokens.refreshToken,
      expiresAt: tokens.refreshExpiresAt,
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip,
    });
    return ok({ user: toPublicUserDto(user), tokens, serverTime: new Date().toISOString() });
  },

  refresh: async (request: FastifyRequest) => {
    const body = request.body as any;
    let refreshPayload: JwtAuthContext;
    try {
      refreshPayload = (await request.server.jwt.verify(body.refreshToken, {
        key: env.JWT_REFRESH_SECRET,
      })) as JwtAuthContext;
    } catch {
      throw new AppError('UNAUTHORIZED', 'Invalid refresh token', 401);
    }
    if (refreshPayload.type !== 'refresh') {
      throw new AppError('UNAUTHORIZED', 'Invalid refresh token type', 401);
    }
    const next = await issueTokens(request, { id: refreshPayload.sub, role: refreshPayload.role as any });
    const user = await container.services.authService.rotateRefreshSession(body.refreshToken, next.refreshToken, next.refreshExpiresAt, {
      userAgent: request.headers['user-agent'] ?? null,
      ipAddress: request.ip,
    });
    return ok({ user: toPublicUserDto(user), tokens: next, serverTime: new Date().toISOString() });
  },

  logout: async (request: FastifyRequest) => {
    const body = (request.body ?? {}) as any;
    await container.services.authService.logout(body.refreshToken, request.currentUser?.id, body.allSessions);
    return ok({ loggedOut: true, serverTime: new Date().toISOString() });
  },

  forgotPassword: async (request: FastifyRequest) => {
    const body = request.body as any;
    const result = await container.services.authService.createPasswordReset(body.email);
    return ok({ ...result, serverTime: new Date().toISOString() });
  },

  resetPassword: async (request: FastifyRequest) => {
    const body = request.body as any;
    await container.services.authService.resetPassword(body.token, body.newPassword);
    return ok({ reset: true, serverTime: new Date().toISOString() });
  },

  me: async (request: FastifyRequest) => {
    return ok({ user: toPublicUserDto(request.currentUser!), actingAs: request.impersonating ? request.currentUser!.id : null });
  },
};
