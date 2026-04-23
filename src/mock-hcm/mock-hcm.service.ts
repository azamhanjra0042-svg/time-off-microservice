import { Injectable } from '@nestjs/common';

type BalanceKey = string;

@Injectable()
export class MockHcmService {
  private balances = new Map<BalanceKey, number>();

  private key(employeeId: string, locationId: string) {
    return `${employeeId}:${locationId}`;
  }

  setBalance(employeeId: string, locationId: string, amount: number) {
    this.balances.set(this.key(employeeId, locationId), amount);
    return { employeeId, locationId, balanceAmount: amount };
  }

  getBalance(employeeId: string, locationId: string) {
    const balanceAmount =
      this.balances.get(this.key(employeeId, locationId)) ?? 0;

    return {
      employeeId,
      locationId,
      balanceAmount,
      updatedAt: new Date().toISOString(),
    };
  }

  validate(employeeId: string, locationId: string, amount: number) {
    const balance = this.balances.get(this.key(employeeId, locationId));

    if (balance === undefined) {
      return { allowed: false, reason: 'INVALID_DIMENSIONS' };
    }

    if (balance < amount) {
      return { allowed: false, reason: 'INSUFFICIENT_BALANCE' };
    }

    return { allowed: true, reason: null };
  }

  commit(
    requestId: string,
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    const validation = this.validate(employeeId, locationId, amount);

    if (!validation.allowed) {
      return validation;
    }

    const key = this.key(employeeId, locationId);
    const current = this.balances.get(key) ?? 0;
    this.balances.set(key, current - amount);

    return {
      success: true,
      requestId,
      balanceAmount: this.balances.get(key),
    };
  }

  cancel(
    requestId: string,
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    const key = this.key(employeeId, locationId);
    const current = this.balances.get(key) ?? 0;
    this.balances.set(key, current + amount);

    return {
      success: true,
      requestId,
      balanceAmount: this.balances.get(key),
    };
  }

  batchUpsert(
    balances: Array<{
      employeeId: string;
      locationId: string;
      balanceAmount: number;
    }>,
  ) {
    for (const item of balances) {
      this.balances.set(
        this.key(item.employeeId, item.locationId),
        item.balanceAmount,
      );
    }

    return { success: true, count: balances.length };
  }
}