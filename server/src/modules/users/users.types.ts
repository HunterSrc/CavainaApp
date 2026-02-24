import { UserRole } from '@prisma/client';

export type UserEntity = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  supersaasUserKey: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type PublicUserDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  role: UserRole;
  isActive: boolean;
  supersaasUserKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export const toPublicUserDto = (user: UserEntity): PublicUserDto => ({
  id: user.id,
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  phone: user.phone,
  role: user.role,
  isActive: user.isActive,
  supersaasUserKey: user.supersaasUserKey,
  createdAt: user.createdAt.toISOString(),
  updatedAt: user.updatedAt.toISOString(),
});
