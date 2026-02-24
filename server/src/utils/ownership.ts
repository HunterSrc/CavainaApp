import { AppError } from '../lib/errors';

export type OwnershipContext = {
  requesterRole: 'ADMIN' | 'USER';
  requesterUserId: string;
  targetLocalUserId?: string | null;
};

export function assertOwnershipOrAdmin(ctx: OwnershipContext): void {
  if (ctx.requesterRole === 'ADMIN') return;
  if (!ctx.targetLocalUserId || ctx.targetLocalUserId !== ctx.requesterUserId) {
    throw new AppError('FORBIDDEN', 'You can only operate on your own bookings', 403);
  }
}
