import type { FastifyRequest } from 'fastify';

import { container } from '../../lib/container';
import { ok } from '../../lib/response';

export const availabilityController = {
  freeSlots: async (request: FastifyRequest) => {
    const query = request.query as any;
    const items = await container.services.availabilityService.getFreeSlots(query);
    return ok({ items, serverTime: new Date().toISOString() });
  },
  busySlotsForUser: async (request: FastifyRequest) => {
    const query = request.query as any;
    const items = await container.services.availabilityService.getBusySlotsAnonymous(query);
    return ok({ items, serverTime: new Date().toISOString() });
  },
};
