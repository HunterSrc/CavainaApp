import { z } from '../../utils/zod';

export const availabilityQuerySchema = z.object({
  from: z.string().min(1).optional(),
  to: z.string().min(1).optional(),
});
