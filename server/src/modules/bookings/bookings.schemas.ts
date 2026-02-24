import { z } from '../../utils/zod';

export const dateRangeQuerySchema = z.object({
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
});

export const bookingBodySchema = z.object({
  start: z.string().min(1),
});

export const bookingParamsSchema = z.object({
  bookingId: z.string().min(1),
});

export const adminCreateBookingBodySchema = z.object({
  userId: z.string().uuid(),
  start: z.string().min(1),
});

export const adminBookingsQuerySchema = dateRangeQuerySchema.extend({
  userId: z.string().uuid().optional(),
});
