import type { FastifyRequest } from 'fastify';

import { container } from '../../lib/container';
import { ok } from '../../lib/response';

export const usersController = {
  meProfile: async (request: FastifyRequest) => {
    const profile = await container.services.usersService.getProfile(request.currentUser!.id);
    return ok({ profile, serverTime: new Date().toISOString() });
  },

  patchMeProfile: async (request: FastifyRequest) => {
    const body = request.body as any;
    const profile = await container.services.usersService.updateProfile(request.currentUser!.id, body);
    return ok({ profile, serverTime: new Date().toISOString() });
  },

  meBootstrap: async (request: FastifyRequest) => {
    const query = request.query as any;
    const [profile, bookings, freeSlots, busySlots] = await Promise.all([
      container.services.usersService.getProfile(request.currentUser!.id),
      container.services.bookingsService.listForUser(request.currentUser!, query),
      container.services.availabilityService.getFreeSlots(query),
      container.services.availabilityService.getBusySlotsAnonymous(query),
    ]);
    return ok({
      profile,
      bookings,
      freeSlots,
      busySlots,
      serverTime: new Date().toISOString(),
    });
  },
};
