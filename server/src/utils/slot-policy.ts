import { DateTime } from 'luxon';

import { AppError } from '../lib/errors';
import { appZone, nowInAppZone, parseIsoInAppZone, toIsoUtc } from './date';

export const ALLOWED_START_HOURS = [17, 19, 21] as const;
export const SLOT_DURATION_MINUTES = 120;
export const MODIFY_CANCEL_CUTOFF_HOURS = 48;

export type SlotValidationResult = {
  startLocal: DateTime;
  endLocal: DateTime;
  startUtcIso: string;
  endUtcIso: string;
};

export function validateAndNormalizeSlot(startIso: string): SlotValidationResult {
  const start = parseIsoInAppZone(startIso);
  if (!start.isValid) {
    throw new AppError('VALIDATION_ERROR', 'Invalid start datetime', 400, { startIso });
  }
  if (start.minute !== 0 || start.second !== 0 || start.millisecond !== 0) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Start must be on the hour with 00 minutes/seconds', 422);
  }
  if (!ALLOWED_START_HOURS.includes(start.hour as (typeof ALLOWED_START_HOURS)[number])) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Start hour not allowed. Allowed: 17:00, 19:00, 21:00', 422, { allowedHours: ALLOWED_START_HOURS });
  }
  const end = start.plus({ minutes: SLOT_DURATION_MINUTES });
  if (end.setZone(appZone).day !== start.day && start.hour !== 21) {
    throw new AppError('BUSINESS_RULE_VIOLATION', 'Invalid slot duration crossing day boundary', 422);
  }
  return {
    startLocal: start,
    endLocal: end,
    startUtcIso: toIsoUtc(start),
    endUtcIso: toIsoUtc(end),
  };
}

export function assertCanModifyOrCancelBy48h(startIso: string, isAdmin = false): void {
  if (isAdmin) return;
  const start = parseIsoInAppZone(startIso);
  if (!start.isValid) {
    throw new AppError('VALIDATION_ERROR', 'Invalid booking start datetime', 400);
  }
  const diffHours = start.diff(nowInAppZone(), 'hours').hours;
  if (diffHours < MODIFY_CANCEL_CUTOFF_HOURS) {
    throw new AppError(
      'BUSINESS_RULE_VIOLATION',
      'Modification or cancellation allowed only up to 48 hours before appointment start',
      422,
      { cutoffHours: MODIFY_CANCEL_CUTOFF_HOURS },
    );
  }
}
