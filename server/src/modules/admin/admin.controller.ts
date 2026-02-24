import type { FastifyRequest } from 'fastify';

import { container } from '../../lib/container';
import { ok } from '../../lib/response';

export const adminController = {
  listUsers: async (request: FastifyRequest) => ok(await container.services.adminService.listUsers(request.query as any)),
  getUser: async (request: FastifyRequest) => ok({ user: await container.services.adminService.getUser((request.params as any).id) }),
  patchUser: async (request: FastifyRequest) => ok({ user: await container.services.adminService.updateUser((request.params as any).id, request.body as any) }),
  resetPassword: async (request: FastifyRequest) => ok(await container.services.adminService.resetPassword(request.actorUser!.id, (request.params as any).id, (request.body as any).newPassword)),
  createBooking: async (request: FastifyRequest) => ok({ booking: await container.services.adminService.createBookingForUser(request.actorUser!.id, request.body as any), serverTime: new Date().toISOString() }),
  updateBooking: async (request: FastifyRequest) => ok({ booking: await container.services.adminService.updateBooking(request.actorUser!.id, (request.params as any).bookingId, request.body as any), serverTime: new Date().toISOString() }),
  deleteBooking: async (request: FastifyRequest) => ok({ ...(await container.services.adminService.deleteBooking(request.actorUser!.id, (request.params as any).bookingId)), serverTime: new Date().toISOString() }),
  listBookings: async (request: FastifyRequest) => ok({ items: await container.services.adminService.listBookings(request.query as any), serverTime: new Date().toISOString() }),
  startImpersonation: async (request: FastifyRequest) => ok({ ...(await container.services.adminService.startImpersonation(request, (request.body as any).targetUserId)), serverTime: new Date().toISOString() }),
  stopImpersonation: async (request: FastifyRequest) => ok({ ...(await container.services.adminService.stopImpersonation(request.actorUser!.id, request.currentUser?.id)), serverTime: new Date().toISOString() }),
};
