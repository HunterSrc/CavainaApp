import { UserRole } from '@prisma/client';

export type JwtAuthContext = {
  sub: string;
  role: UserRole;
  type: 'access' | 'refresh';
  sessionId?: string;
  impersonatedBy?: string;
};

export type AccessTokenPayload = JwtAuthContext;
