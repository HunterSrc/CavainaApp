import { Prisma } from '@prisma/client';

import { prisma } from '../../lib/prisma';

export class AuditRepository {
  async create(entry: {
    actorUserId?: string | null;
    action: string;
    targetUserId?: string | null;
    bookingId?: string | null;
    metadata?: unknown;
  }) {
    const data: Prisma.AuditLogUncheckedCreateInput = {
      actorUserId: entry.actorUserId ?? null,
      action: entry.action,
      targetUserId: entry.targetUserId ?? null,
      bookingId: entry.bookingId ?? null,
      metadata: (entry.metadata as Prisma.InputJsonValue | undefined) ?? Prisma.JsonNull,
    };
    return prisma.auditLog.create({ data });
  }
}
