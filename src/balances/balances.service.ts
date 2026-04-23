import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BalanceProjection } from './entities/balance-projection.entity';

@Injectable()
export class BalancesService {
  constructor(
    @InjectRepository(BalanceProjection)
    private readonly balanceRepo: Repository<BalanceProjection>,
  ) {}

  async getByEmployeeAndLocation(employeeId: string, locationId: string) {
    const balance = await this.balanceRepo.findOne({
      where: { employeeId, locationId },
    });

    if (!balance) {
      throw new NotFoundException('Balance projection not found');
    }

    return balance;
  }

  async upsertFromRealtime(
    employeeId: string,
    locationId: string,
    hcmBalanceAmount: number,
  ) {
    let balance = await this.balanceRepo.findOne({
      where: { employeeId, locationId },
    });

    if (!balance) {
      balance = this.balanceRepo.create({
        employeeId,
        locationId,
        hcmBalanceAmount,
        pendingRequestAmount: 0,
        approvedUnsettledAmount: 0,
        projectedAvailableAmount: hcmBalanceAmount,
        syncStatus: 'fresh',
        lastRealtimeSyncAt: new Date(),
        lastBatchSyncAt: null,
        version: 1,
      });
    } else {
      balance.hcmBalanceAmount = hcmBalanceAmount;
      balance.lastRealtimeSyncAt = new Date();
      balance.syncStatus = 'fresh';
      balance.projectedAvailableAmount =
        balance.hcmBalanceAmount - balance.pendingRequestAmount;
      balance.version += 1;
    }

    return this.balanceRepo.save(balance);
  }

  async upsertFromBatch(
    employeeId: string,
    locationId: string,
    balanceAmount: number,
  ) {
    let balance = await this.balanceRepo.findOne({
      where: { employeeId, locationId },
    });

    if (!balance) {
      balance = this.balanceRepo.create({
        employeeId,
        locationId,
        hcmBalanceAmount: balanceAmount,
        pendingRequestAmount: 0,
        approvedUnsettledAmount: 0,
        projectedAvailableAmount: balanceAmount,
        syncStatus: 'fresh',
        lastRealtimeSyncAt: null,
        lastBatchSyncAt: new Date(),
        version: 1,
      });
    } else {
      balance.hcmBalanceAmount = balanceAmount;
      balance.projectedAvailableAmount =
        balance.hcmBalanceAmount - balance.pendingRequestAmount;
      balance.syncStatus = 'fresh';
      balance.lastBatchSyncAt = new Date();
      balance.version += 1;
    }

    return this.balanceRepo.save(balance);
  }

  async reservePending(employeeId: string, locationId: string, amount: number) {
    const balance = await this.getByEmployeeAndLocation(employeeId, locationId);

    balance.pendingRequestAmount += amount;
    balance.projectedAvailableAmount =
      balance.hcmBalanceAmount - balance.pendingRequestAmount;
    balance.version += 1;

    return this.balanceRepo.save(balance);
  }

  async movePendingToApproved(
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    const balance = await this.getByEmployeeAndLocation(employeeId, locationId);

    balance.pendingRequestAmount -= amount;
    balance.approvedUnsettledAmount += amount;
    balance.projectedAvailableAmount =
      balance.hcmBalanceAmount - balance.pendingRequestAmount;
    balance.version += 1;

    return this.balanceRepo.save(balance);
  }

  async releasePending(employeeId: string, locationId: string, amount: number) {
    const balance = await this.getByEmployeeAndLocation(employeeId, locationId);

    balance.pendingRequestAmount -= amount;
    balance.projectedAvailableAmount =
      balance.hcmBalanceAmount - balance.pendingRequestAmount;
    balance.version += 1;

    return this.balanceRepo.save(balance);
  }

  async restoreApproved(
    employeeId: string,
    locationId: string,
    amount: number,
  ) {
    const balance = await this.getByEmployeeAndLocation(employeeId, locationId);

    balance.approvedUnsettledAmount -= amount;
    balance.projectedAvailableAmount =
      balance.hcmBalanceAmount - balance.pendingRequestAmount;
    balance.version += 1;

    return this.balanceRepo.save(balance);
  }
}