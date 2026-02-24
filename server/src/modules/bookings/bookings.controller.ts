import type { FastifyRequest } from 'fastify';

import { container } from '../../lib/container';
import { ok } from '../../lib/response';

export const bookingsController = {
  listMine: async (request: FastifyRequest) => {
    const query = request.query as any;
    const items = await container.services.bookingsService.listForUser(request.currentUser!, query);
    return ok({ items, serverTime: new Date().toISOString() });
  },

  createMine: async (request: FastifyRequest) => {
    const body = request.body as any;
    const booking = await container.services.bookingsService.createForUser(request.currentUser!, request.currentUser!, body);
    return ok({ booking, serverTime: new Date().toISOString() });
  },

  updateMine: async (request: FastifyRequest) => {
    const body = request.body as any;
    const params = request.params as any;
    const booking = await container.services.bookingsService.updateBooking(request.currentUser!, params.bookingId, body);
    return ok({ booking, serverTime: new Date().toISOString() });
  },

  deleteMine: async (request: FastifyRequest) => {
    const params = request.params as any;
    const result = await container.services.bookingsService.deleteBooking(request.currentUser!, params.bookingId);
    return ok({ ...result, serverTime: new Date().toISOString() });
  },
};
