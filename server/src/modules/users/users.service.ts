import { AppError } from '../../lib/errors';
import { SupersaasService } from '../supersaas/supersaas.service';
import { UsersRepository } from './users.repository';
import { toPublicUserDto } from './users.types';

export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly supersaasService: SupersaasService,
  ) {}

  async getByIdOrThrow(id: string) {
    const user = await this.usersRepository.findById(id);
    if (!user) throw new AppError('NOT_FOUND', 'User not found', 404);
    return user;
  }

  async getProfile(userId: string) {
    return toPublicUserDto(await this.getByIdOrThrow(userId));
  }

  async updateProfile(userId: string, patch: { firstName?: string; lastName?: string; email?: string; phone?: string | null }) {
    const existing = await this.getByIdOrThrow(userId);
    if (patch.email && patch.email.toLowerCase() !== existing.email.toLowerCase()) {
      const conflict = await this.usersRepository.findByEmail(patch.email.toLowerCase());
      if (conflict && conflict.id !== userId) {
        throw new AppError('CONFLICT', 'Email already in use', 409);
      }
    }
    const updated = await this.usersRepository.update(userId, {
      ...(patch.firstName ? { firstName: patch.firstName } : {}),
      ...(patch.lastName ? { lastName: patch.lastName } : {}),
      ...(patch.email ? { email: patch.email.toLowerCase() } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
    });
    await this.supersaasService.upsertUser(updated).catch(() => undefined);
    return toPublicUserDto(updated);
  }

  async adminUpdateUser(id: string, patch: any) {
    const user = await this.getByIdOrThrow(id);
    if (patch.email && patch.email.toLowerCase() !== user.email.toLowerCase()) {
      const conflict = await this.usersRepository.findByEmail(patch.email.toLowerCase());
      if (conflict && conflict.id !== id) throw new AppError('CONFLICT', 'Email already in use', 409);
    }
    const updated = await this.usersRepository.update(id, {
      ...(patch.firstName !== undefined ? { firstName: patch.firstName } : {}),
      ...(patch.lastName !== undefined ? { lastName: patch.lastName } : {}),
      ...(patch.email !== undefined ? { email: patch.email.toLowerCase() } : {}),
      ...(patch.phone !== undefined ? { phone: patch.phone } : {}),
      ...(patch.role !== undefined ? { role: patch.role } : {}),
      ...(patch.isActive !== undefined ? { isActive: patch.isActive } : {}),
    });
    await this.supersaasService.upsertUser(updated).catch(() => undefined);
    return toPublicUserDto(updated);
  }

  async listUsers(query: { page: number; pageSize: number; role?: any; search?: string }) {
    const skip = (query.page - 1) * query.pageSize;
    const result = await this.usersRepository.list({ skip, take: query.pageSize, role: query.role, search: query.search });
    return {
      items: result.items.map(toPublicUserDto),
      total: result.total,
      page: query.page,
      pageSize: query.pageSize,
    };
  }
}
