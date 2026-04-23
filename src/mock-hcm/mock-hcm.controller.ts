import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MockHcmService } from './mock-hcm.service';

@Controller('mock-hcm')
export class MockHcmController {
  constructor(private readonly mockHcmService: MockHcmService) {}

  @Get('balances/:employeeId/:locationId')
  getBalance(
    @Param('employeeId') employeeId: string,
    @Param('locationId') locationId: string,
  ) {
    return this.mockHcmService.getBalance(employeeId, locationId);
  }

  @Post('time-off/validate')
  validate(
    @Body() body: { employeeId: string; locationId: string; amount: number },
  ) {
    return this.mockHcmService.validate(
      body.employeeId,
      body.locationId,
      body.amount,
    );
  }

  @Post('time-off/commit')
  commit(
    @Body()
    body: {
      requestId: string;
      employeeId: string;
      locationId: string;
      amount: number;
    },
  ) {
    return this.mockHcmService.commit(
      body.requestId,
      body.employeeId,
      body.locationId,
      body.amount,
    );
  }

  @Post('time-off/cancel')
  cancel(
    @Body()
    body: {
      requestId: string;
      employeeId: string;
      locationId: string;
      amount: number;
    },
  ) {
    return this.mockHcmService.cancel(
      body.requestId,
      body.employeeId,
      body.locationId,
      body.amount,
    );
  }

  @Post('batch/balances')
  batchBalances(
    @Body()
    body: {
      balances: Array<{
        employeeId: string;
        locationId: string;
        balanceAmount: number;
      }>;
    },
  ) {
    return this.mockHcmService.batchUpsert(body.balances);
  }

  @Post('test-controls/set-balance')
  setBalance(
    @Body()
    body: {
      employeeId: string;
      locationId: string;
      balanceAmount: number;
    },
  ) {
    return this.mockHcmService.setBalance(
      body.employeeId,
      body.locationId,
      body.balanceAmount,
    );
  }
}