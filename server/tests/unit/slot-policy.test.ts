import { describe, expect, it } from 'vitest';

import { assertCanModifyOrCancelBy48h, validateAndNormalizeSlot } from '../../src/utils/slot-policy';

describe('slot policy', () => {
  it('accepts only 17:00 / 19:00 / 21:00 and builds 2h duration', () => {
    const slot = validateAndNormalizeSlot('2030-01-10T19:00:00+01:00');
    expect(slot.startLocal.hour).toBe(19);
    expect(slot.endLocal.hour).toBe(21);
    expect(slot.endLocal.diff(slot.startLocal, 'minutes').minutes).toBe(120);
  });

  it('rejects invalid start minutes', () => {
    expect(() => validateAndNormalizeSlot('2030-01-10T19:30:00+01:00')).toThrow();
  });

  it('rejects invalid start hour', () => {
    expect(() => validateAndNormalizeSlot('2030-01-10T18:00:00+01:00')).toThrow();
  });

  it('enforces 48h rule for user', () => {
    expect(() => assertCanModifyOrCancelBy48h('2030-01-10T19:00:00+01:00', false)).not.toThrow();
    expect(() => assertCanModifyOrCancelBy48h('2000-01-10T19:00:00+01:00', false)).toThrow();
  });

  it('allows admin to bypass 48h rule', () => {
    expect(() => assertCanModifyOrCancelBy48h('2000-01-10T19:00:00+01:00', true)).not.toThrow();
  });
});
