import { describe, expect, it } from 'vitest';

import { mapBusySlotAnonymous } from '../../src/modules/supersaas/supersaas.mapper';

describe('privacy busy slots', () => {
  it('returns only start/end/status occupied', () => {
    const out = mapBusySlotAnonymous({
      start: '2030-01-10T18:00:00Z',
      finish: '2030-01-10T20:00:00Z',
      user: { email: 'hidden@example.com', name: 'Hidden' },
      phone: '123',
      note: 'secret',
    } as any);

    expect(out).toEqual({
      start: '2030-01-10T18:00:00Z',
      end: '2030-01-10T20:00:00Z',
      status: 'occupied',
    });
    expect((out as any).user).toBeUndefined();
    expect((out as any).note).toBeUndefined();
    expect(Object.keys(out)).toEqual(['start', 'end', 'status']);
  });
});
