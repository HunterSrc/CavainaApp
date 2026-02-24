-- Extensions enabled for future backend needs (search, UUID helpers, crypto).
-- Current Prisma schema does not strictly require them, but they are safe defaults.
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pg_trgm;

