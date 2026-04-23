import { Body, Controller, Post } from '@nestjs/common';
import { SyncService } from './sync.service';

@Controller('sync')
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @Post('balances/batch')
  async applyBatch(
    @Body()
    body: {
      balances: Array<{
        employeeId: string;
        locationId: string;
        balanceAmount: number;
      }>;
    },
  ) {
    return this.syncService.applyBatch(body.balances || []);
  }
}