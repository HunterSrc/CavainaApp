import { z } from '../../utils/zod';
import { adminBookingsQuerySchema, adminCreateBookingBodySchema, bookingBodySchema, bookingParamsSchema } from '../bookings/bookings.schemas';
import { adminUserPatchBodySchema, adminUsersQuerySchema, userIdParamsSchema } from '../users/users.schemas';

export { adminBookingsQuerySchema, adminCreateBookingBodySchema, bookingBodySchema, bookingParamsSchema, adminUserPatchBodySchema, adminUsersQuerySchema, userIdParamsSchema };

export const adminResetPasswordBodySchema = z.object({ newPassword: z.string().min(8) });
export const impersonationStartBodySchema = z.object({ targetUserId: z.string().uuid() });
