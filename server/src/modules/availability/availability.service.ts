import { DateTime } from 'luxon';

import { SupersaasService } from '../supersaas/supersaas.service';

export class AvailabilityService {
  constructor(private readonly supersaasService: SupersaasService) {}

  private normalizeRange(input: { from?: string; to?: string }) {
    const from = input.from ? DateTime.fromISO(input.from) : DateTime.now().startOf('day');
    const to = input.to ? DateTime.fromISO(input.to) : from.plus({ days: 14 }).endOf('day');
    return { from: from.toUTC().toISO()!, to: to.toUTC().toISO()! };
  }

  async getFreeSlots(query: { from?: string; to?: string }) {
    const range = this.normalizeRange(query);
    return this.supersaasService.freeSlots(range.from, range.to);
  }

  async getBusySlotsAnonymous(query: { from?: string; to?: string }) {
    const range = this.normalizeRange(query);
    return this.supersaasService.busySlotsAnonymous(range.from, range.to);
  }
}
