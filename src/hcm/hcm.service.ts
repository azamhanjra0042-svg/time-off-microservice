import { Injectable } from '@nestjs/common';
import { MockHcmService } from '../mock-hcm/mock-hcm.service';

@Injectable()
export class HcmService {
  constructor(private readonly mockHcmService: MockHcmService) {}

  getBalance(employeeId: string, locationId: string) {
    return this.mockHcmService.getBalance(employeeId, locationId);
  }

  validateTimeOff(employeeId: string, locationId: string, amount: number) {
    return this.mockHcmService.validate(employeeId, locationId, amount);
  }

  commitTimeOff(
    requestId: string,
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    return this.mockHcmService.commit(
      requestId,
      employeeId,
      locationId,
      amount,
    );
  }

  cancelTimeOff(
    requestId: string,
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    return this.mockHcmService.cancel(
      requestId,
      employeeId,
      locationId,
      amount,
    );
  }

  batchSync(
    balances: Array<{
      employeeId: string;
      locationId: string;
      balanceAmount: number;
    }>,
  ) {
    return this.mockHcmService.batchUpsert(balances);
  }
}