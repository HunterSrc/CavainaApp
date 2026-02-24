import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(3001),
  HOST: z.string().default('0.0.0.0'),
  LOG_LEVEL: z.string().default('info'),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  JWT_REFRESH_SECRET: z.string().min(16),
  JWT_ACCESS_TTL: z.string().default('15m'),
  JWT_REFRESH_TTL: z.string().default('30d'),
  CORS_ORIGIN: z.string().default('*'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW: z.string().default('1 minute'),
  APP_TIMEZONE: z.string().default('Europe/Rome'),
  SUPERSAAS_TIMEZONE: z.string().default('Europe/Rome'),
  SUPERSAAS_ACCOUNT: z.string().min(1),
  SUPERSAAS_API_KEY: z.string().min(1),
  SUPERSAAS_SCHEDULE_ID: z.coerce.number().default(584424),
  SUPERSAAS_BASE_URL: z.string().url().default('https://www.supersaas.com/api'),
  SUPERSAAS_TIMEOUT_MS: z.coerce.number().default(10000),
  SUPERSAAS_RETRY_COUNT: z.coerce.number().default(2),
  SUPERSAAS_ENABLE_PASSWORD_SYNC: z.coerce.boolean().default(false),
  ADMIN_IMPERSONATION_HEADER: z.string().default('x-impersonate-user-id'),
});

export type AppEnv = z.infer<typeof envSchema>;

export const env: AppEnv = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGIN === '*' ? true : env.CORS_ORIGIN.split(',').map((v) => v.trim());
