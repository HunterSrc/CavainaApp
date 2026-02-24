import { Prisma, UserRole } from '@prisma/client';

import { prisma } from '../../lib/prisma';
import type { UserEntity } from './users.types';

export class UsersRepository {
  async create(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string | null;
    passwordHash: string;
    role?: UserRole;
    isActive?: boolean;
    supersaasUserKey?: string | null;
  }): Promise<UserEntity> {
    return prisma.user.create({ data });
  }

  async findById(id: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { id } });
  }

  async findByEmail(email: string): Promise<UserEntity | null> {
    return prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  }

  async list(params: { skip?: number; take?: number; role?: UserRole; search?: string }) {
    const where: Prisma.UserWhereInput = {
      ...(params.role ? { role: params.role } : {}),
      ...(params.search
        ? {
            OR: [
              { firstName: { contains: params.search, mode: 'insensitive' } },
              { lastName: { contains: params.search, mode: 'insensitive' } },
              { email: { contains: params.search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.user.findMany({ where, skip: params.skip, take: params.take, orderBy: { createdAt: 'desc' } }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  }

  async update(id: string, data: Prisma.UserUpdateInput): Promise<UserEntity> {
    return prisma.user.update({ where: { id }, data });
  }
}
