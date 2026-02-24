import type { FastifyInstance } from 'fastify';

import { requireAuth } from '../../middleware/auth';
import { loadCurrentUser } from '../../middleware/current-user';
import { cacheIdempotentResponse, idempotencyPreHandler } from '../../middleware/idempotency';
import { applyAdminImpersonation } from '../../middleware/impersonation';
import { validateRequest } from '../../middleware/validation';
import { availabilityController } from '../availability/availability.controller';
import { availabilityQuerySchema } from '../availability/availability.schemas';
import { bookingsController } from '../bookings/bookings.controller';
import { bookingBodySchema, bookingParamsSchema, dateRangeQuerySchema } from '../bookings/bookings.schemas';
import { usersController } from './users.controller';
import { updateMeProfileBodySchema } from './users.schemas';

const meGuards = [requireAuth, loadCurrentUser, applyAdminImpersonation] as const;

export async function usersRoutes(app: FastifyInstance) {
  app.get('/me/profile', { preHandler: [...meGuards] }, usersController.meProfile);
  app.patch('/me/profile', { preHandler: [...meGuards, validateRequest({ body: updateMeProfileBodySchema })] }, usersController.patchMeProfile);
  app.get('/me/bootstrap', { preHandler: [...meGuards, validateRequest({ query: dateRangeQuerySchema })] }, usersController.meBootstrap);

  app.get('/me/bookings', { preHandler: [...meGuards, validateRequest({ query: dateRangeQuerySchema })] }, bookingsController.listMine);
  app.post(
    '/me/bookings',
    {
      preHandler: [...meGuards, idempotencyPreHandler, validateRequest({ body: bookingBodySchema })],
      onSend: async (request, reply, payload) => {
        try {
          cacheIdempotentResponse(request, reply, JSON.parse(String(payload)));
        } catch {
          // no-op for non-JSON payloads
        }
        return payload;
      },
    },
    bookingsController.createMine,
  );
  app.put('/me/bookings/:bookingId', { preHandler: [...meGuards, validateRequest({ params: bookingParamsSchema, body: bookingBodySchema })] }, bookingsController.updateMine);
  app.delete('/me/bookings/:bookingId', { preHandler: [...meGuards, validateRequest({ params: bookingParamsSchema })] }, bookingsController.deleteMine);

  app.get('/me/free-slots', { preHandler: [...meGuards, validateRequest({ query: availabilityQuerySchema })] }, availabilityController.freeSlots);
  app.get('/me/busy-slots', { preHandler: [...meGuards, validateRequest({ query: availabilityQuerySchema })] }, availabilityController.busySlotsForUser);
}
