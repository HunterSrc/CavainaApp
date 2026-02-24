import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../../middleware/auth';
import { loadCurrentUser } from '../../middleware/current-user';
import { applyAdminImpersonation } from '../../middleware/impersonation';
import { requireRoles } from '../../middleware/rbac';
import { validateRequest } from '../../middleware/validation';
import { adminController } from './admin.controller';
import {
  adminBookingsQuerySchema,
  adminCreateBookingBodySchema,
  adminResetPasswordBodySchema,
  adminUserPatchBodySchema,
  adminUsersQuerySchema,
  bookingBodySchema,
  bookingParamsSchema,
  impersonationStartBodySchema,
  userIdParamsSchema,
} from './admin.schemas';

const adminGuards = [requireAuth, loadCurrentUser, requireRoles('ADMIN'), applyAdminImpersonation] as const;

export async function adminRoutes(app: FastifyInstance) {
  app.get('/admin/users', { preHandler: [...adminGuards, validateRequest({ query: adminUsersQuerySchema })] }, adminController.listUsers);
  app.get('/admin/users/:id', { preHandler: [...adminGuards, validateRequest({ params: userIdParamsSchema })] }, adminController.getUser);
  app.patch('/admin/users/:id', { preHandler: [...adminGuards, validateRequest({ params: userIdParamsSchema, body: adminUserPatchBodySchema })] }, adminController.patchUser);
  app.post('/admin/users/:id/reset-password', { preHandler: [...adminGuards, validateRequest({ params: userIdParamsSchema, body: adminResetPasswordBodySchema })] }, adminController.resetPassword);

  app.get('/admin/bookings', { preHandler: [...adminGuards, validateRequest({ query: adminBookingsQuerySchema })] }, adminController.listBookings);
  app.post('/admin/bookings', { preHandler: [...adminGuards, validateRequest({ body: adminCreateBookingBodySchema })] }, adminController.createBooking);
  app.put('/admin/bookings/:bookingId', { preHandler: [...adminGuards, validateRequest({ params: bookingParamsSchema, body: bookingBodySchema })] }, adminController.updateBooking);
  app.delete('/admin/bookings/:bookingId', { preHandler: [...adminGuards, validateRequest({ params: bookingParamsSchema })] }, adminController.deleteBooking);

  app.post('/admin/impersonation/start', { preHandler: [...adminGuards, validateRequest({ body: impersonationStartBodySchema })] }, adminController.startImpersonation);
  app.post('/admin/impersonation/stop', { preHandler: [...adminGuards] }, adminController.stopImpersonation);
}
