import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../../middleware/auth';
import { loadCurrentUser } from '../../middleware/current-user';
import { applyAdminImpersonation } from '../../middleware/impersonation';
import { validateRequest } from '../../middleware/validation';
import { authController } from './auth.controller';
import {
  forgotPasswordBodySchema,
  loginBodySchema,
  logoutBodySchema,
  refreshBodySchema,
  registerBodySchema,
  resetPasswordBodySchema,
} from './auth.schemas';

export async function authRoutes(app: FastifyInstance) {
  app.post('/auth/register', { preHandler: validateRequest({ body: registerBodySchema }) }, authController.register);
  app.post('/auth/login', { preHandler: validateRequest({ body: loginBodySchema }) }, authController.login);
  app.post('/auth/refresh', { preHandler: validateRequest({ body: refreshBodySchema }) }, authController.refresh);
  app.post('/auth/logout', { preHandler: [requireAuth, loadCurrentUser, applyAdminImpersonation, validateRequest({ body: logoutBodySchema })] }, authController.logout);
  app.post('/auth/forgot-password', { preHandler: validateRequest({ body: forgotPasswordBodySchema }) }, authController.forgotPassword);
  app.post('/auth/reset-password', { preHandler: validateRequest({ body: resetPasswordBodySchema }) }, authController.resetPassword);
  app.get('/auth/me', { preHandler: [requireAuth, loadCurrentUser, applyAdminImpersonation] }, authController.me);
}
