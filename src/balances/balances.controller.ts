import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { BalancesService } from './balances.service';
import { HcmService } from '../hcm/hcm.service';

@Controller('balances')
export class BalancesController {
  constructor(
    private readonly balancesService: BalancesService,
    private readonly hcmService: HcmService,
  ) {}

  @Get(':employeeId/:locationId')
  getBalance(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.balancesService.getByEmployeeAndLocation(employeeId, locationId);
  }

  @Post('sync/realtime')
  async realtimeSync(
    @Body() body: { employeeId: string; locationId: string },
  ) {
    const hcm = this.hcmService.getBalance(body.employeeId, body.locationId);

    return this.balancesService.upsertFromRealtime(
      body.employeeId,
      body.locationId,
      hcm.balanceAmount,
    );
  }
}