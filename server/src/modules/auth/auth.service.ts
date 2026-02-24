import bcrypt from 'bcrypt';
import type { UserRole } from '@prisma/client';

import { AppError } from '../../lib/errors';
import { sha256, randomToken } from '../../utils/crypto';
import { AuthRepository } from './auth.repository';
import { UsersRepository } from '../users/users.repository';
import { SupersaasService } from '../supersaas/supersaas.service';
import { AuditRepository } from '../admin/audit.repository';
import { env } from '../../config/env';
import { toPublicUserDto } from '../users/users.types';

export class AuthService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly authRepository: AuthRepository,
    private readonly supersaasService: SupersaasService,
    private readonly auditRepository: AuditRepository,
  ) {}

  async register(input: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    password: string;
    role?: UserRole;
  }) {
    const email = input.email.toLowerCase();
    const existing = await this.usersRepository.findByEmail(email);
    if (existing) throw new AppError('CONFLICT', 'Email already registered', 409);

    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await this.usersRepository.create({
      firstName: input.firstName,
      lastName: input.lastName,
      email,
      phone: input.phone ?? null,
      passwordHash,
      role: input.role,
      supersaasUserKey: null,
    });

    const key = this.supersaasService.userKeyFor(user);
    const updated = await this.usersRepository.update(user.id, { supersaasUserKey: key });
    await this.supersaasService.upsertUser(updated).catch(() => undefined);
    return updated;
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.usersRepository.findByEmail(email.toLowerCase());
    if (!user || !user.isActive) throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new AppError('UNAUTHORIZED', 'Invalid credentials', 401);
    if (!user.supersaasUserKey) {
      const key = this.supersaasService.userKeyFor(user);
      await this.usersRepository.update(user.id, { supersaasUserKey: key });
      user.supersaasUserKey = key;
    }
    await this.supersaasService.upsertUser(user).catch(() => undefined);
    return user;
  }

  async createRefreshSession(args: { userId: string; refreshToken: string; userAgent?: string | null; ipAddress?: string | null; expiresAt: Date }) {
    return this.authRepository.createRefreshToken({
      userId: args.userId,
      tokenHash: sha256(args.refreshToken),
      userAgent: args.userAgent,
      ipAddress: args.ipAddress,
      expiresAt: args.expiresAt,
    });
  }

  async rotateRefreshSession(refreshToken: string, nextRefreshToken: string, nextExpiresAt: Date, requestMeta: { userAgent?: string | null; ipAddress?: string | null }) {
    const tokenHash = sha256(refreshToken);
    const session = await this.authRepository.findRefreshTokenByHash(tokenHash);
    if (!session || session.revokedAt || session.expiresAt < new Date()) {
      throw new AppError('UNAUTHORIZED', 'Invalid refresh token', 401);
    }
    await this.authRepository.revokeRefreshToken(tokenHash);
    await this.authRepository.createRefreshToken({
      userId: session.userId,
      tokenHash: sha256(nextRefreshToken),
      expiresAt: nextExpiresAt,
      userAgent: requestMeta.userAgent,
      ipAddress: requestMeta.ipAddress,
    });
    const user = await this.usersRepository.findById(session.userId);
    if (!user) throw new AppError('UNAUTHORIZED', 'User not found', 401);
    return user;
  }

  async logout(refreshToken?: string, userId?: string, allSessions?: boolean) {
    if (allSessions && userId) {
      await this.authRepository.revokeRefreshTokensForUser(userId);
      return;
    }
    if (refreshToken) {
      await this.authRepository.revokeRefreshToken(sha256(refreshToken));
    }
  }

  async createPasswordReset(email: string) {
    const user = await this.usersRepository.findByEmail(email.toLowerCase());
    if (!user) return { delivered: true };
    const token = randomToken(24);
    await this.authRepository.createPasswordResetToken({
      userId: user.id,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 1000 * 60 * 30),
    });
    return { delivered: true, tokenPreview: env.NODE_ENV !== 'production' ? token : undefined };
  }

  async resetPassword(token: string, newPassword: string) {
    const row = await this.authRepository.findPasswordResetTokenByHash(sha256(token));
    if (!row || row.usedAt || row.expiresAt < new Date()) {
      throw new AppError('UNAUTHORIZED', 'Invalid or expired reset token', 401);
    }
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.update(row.userId, { passwordHash });
    await this.authRepository.markPasswordResetUsed(row.id);
    await this.authRepository.revokeRefreshTokensForUser(row.userId);
  }

  async adminResetPassword(actorUserId: string, targetUserId: string, newPassword: string) {
    const target = await this.usersRepository.findById(targetUserId);
    if (!target) throw new AppError('NOT_FOUND', 'User not found', 404);
    const passwordHash = await bcrypt.hash(newPassword, 12);
    await this.usersRepository.update(targetUserId, { passwordHash });
    await this.authRepository.revokeRefreshTokensForUser(targetUserId);
    await this.auditRepository.create({ actorUserId, targetUserId, action: 'ADMIN_RESET_PASSWORD' });
    return { user: toPublicUserDto(target) };
  }
}
