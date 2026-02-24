import { describe, expect, it } from 'vitest';

import { assertOwnershipOrAdmin } from '../../src/utils/ownership';
import { requireRoles } from '../../src/middleware/rbac';

describe('ownership and rbac', () => {
  it('allows owner and admin', () => {
    expect(() =>
      assertOwnershipOrAdmin({ requesterRole: 'USER', requesterUserId: 'u1', targetLocalUserId: 'u1' }),
    ).not.toThrow();
    expect(() =>
      assertOwnershipOrAdmin({ requesterRole: 'ADMIN', requesterUserId: 'a1', targetLocalUserId: 'u1' }),
    ).not.toThrow();
  });

  it('blocks non-owner user', () => {
    expect(() =>
      assertOwnershipOrAdmin({ requesterRole: 'USER', requesterUserId: 'u1', targetLocalUserId: 'u2' }),
    ).toThrow();
  });

  it('rbac middleware enforces roles', async () => {
    const guard = requireRoles('ADMIN');
    await expect(guard({ currentUser: { role: 'ADMIN' } } as any)).resolves.toBeUndefined();
    await expect(guard({ currentUser: { role: 'USER' } } as any)).rejects.toThrow();
  });
});
