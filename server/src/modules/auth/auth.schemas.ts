import { z } from '../../utils/zod';

export const registerBodySchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(3).optional(),
  password: z.string().min(8),
});

export const loginBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const refreshBodySchema = z.object({
  refreshToken: z.string().min(1),
});

export const logoutBodySchema = z.object({
  refreshToken: z.string().min(1).optional(),
  allSessions: z.boolean().optional(),
}).default({});

export const forgotPasswordBodySchema = z.object({ email: z.string().email() });
export const resetPasswordBodySchema = z.object({ token: z.string().min(1), newPassword: z.string().min(8) });
