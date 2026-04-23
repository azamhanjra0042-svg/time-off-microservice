import { Injectable } from '@nestjs/common';
import { BalancesService } from '../balances/balances.service';

@Injectable()
export class SyncService {
  constructor(private readonly balancesService: BalancesService) {}

  async applyBatch(
    balances: Array<{
      employeeId: string;
      locationId: string;
      balanceAmount: number;
    }>,
  ) {
    const results: any[] = [];

    for (const item of balances) {
      const updated = await this.balancesService.upsertFromBatch(
        item.employeeId,
        item.locationId,
        item.balanceAmount,
      );
      results.push(updated);
    }

    return {
      success: true,
      count: results.length,
    };
  }
}