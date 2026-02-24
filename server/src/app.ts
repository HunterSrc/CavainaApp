import crypto from 'node:crypto';

import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import jwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';

import { env, corsOrigins } from './config/env';
import { logger } from './lib/logger';
import { prisma } from './lib/prisma';
import { registerErrorHandler } from './middleware/error-handler';
import { authRoutes } from './modules/auth/auth.routes';
import { usersRoutes } from './modules/users/users.routes';
import { adminRoutes } from './modules/admin/admin.routes';
import { ok } from './lib/response';

export async function buildApp() {
  const app = Fastify({
    logger,
    genReqId: () => crypto.randomUUID(),
    trustProxy: true,
  });

  await app.register(cors, { origin: corsOrigins, credentials: true });
  await app.register(helmet);
  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW,
  });
  await app.register(jwt, { secret: env.JWT_ACCESS_SECRET });

  app.addHook('onRequest', async (request) => {
    request.log.info({ reqId: request.id, method: request.method, url: request.url }, 'request:start');
  });
  app.addHook('onResponse', async (request, reply) => {
    request.log.info({ reqId: request.id, statusCode: reply.statusCode }, 'request:end');
  });

  registerErrorHandler(app);

  app.get('/health', async () => ok({ status: 'ok', serverTime: new Date().toISOString() }));

  await app.register(authRoutes);
  await app.register(usersRoutes);
  await app.register(adminRoutes);

  app.addHook('onClose', async () => {
    await prisma.$disconnect();
  });

  return app;
}
