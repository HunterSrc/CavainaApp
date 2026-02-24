import { DateTime } from 'luxon';

import { env } from '../config/env';

export const appZone = env.APP_TIMEZONE;

export const nowInAppZone = () => DateTime.now().setZone(appZone);
export const parseIsoInAppZone = (iso: string) => DateTime.fromISO(iso, { zone: appZone });
export const toIsoUtc = (dt: DateTime) => dt.toUTC().toISO({ suppressMilliseconds: true })!;
export const toAppZone = (value: string | Date) =>
  (typeof value === 'string' ? DateTime.fromISO(value, { zone: 'utc' }) : DateTime.fromJSDate(value, { zone: 'utc' })).setZone(appZone);
