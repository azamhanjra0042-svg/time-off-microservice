import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TimeOffRequest } from './entities/time-off-request.entity';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';
import { BalancesService } from '../balances/balances.service';
import { HcmService } from '../hcm/hcm.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class TimeOffRequestsService {
  constructor(
    @InjectRepository(TimeOffRequest)
    private readonly requestRepo: Repository<TimeOffRequest>,
    private readonly balancesService: BalancesService,
    private readonly hcmService: HcmService,
    private readonly auditService: AuditService,
  ) {}

  async create(dto: CreateTimeOffRequestDto, idempotencyKey: string) {
    if (!idempotencyKey) {
      throw new BadRequestException('idempotency-key header is required');
    }

    const existing = await this.requestRepo.findOne({
      where: { idempotencyKey },
    });

    if (existing) {
      return existing;
    }

    const validation = this.hcmService.validateTimeOff(
      dto.employeeId,
      dto.locationId,
      dto.amount,
    );

    let status = 'PENDING_APPROVAL';
    let failureReason: string | null = null;

    if (!validation.allowed) {
      status = 'FAILED_VALIDATION';
      failureReason = validation.reason;
    }

    const request = this.requestRepo.create({
      ...dto,
      status,
      failureReason,
      idempotencyKey,
      externalReference: null,
    });

    const saved = await this.requestRepo.save(request);

    if (status === 'PENDING_APPROVAL') {
      const currentHcmBalance = this.hcmService.getBalance(
        dto.employeeId,
        dto.locationId,
      );

      await this.balancesService.upsertFromRealtime(
        dto.employeeId,
        dto.locationId,
        currentHcmBalance.balanceAmount,
      );

      await this.balancesService.reservePending(
        dto.employeeId,
        dto.locationId,
        dto.amount,
      );
    }

    await this.auditService.log(
      saved.id,
      'REQUEST_CREATED',
      null,
      saved.status,
      saved,
    );

    return saved;
  }

  async findOne(id: string) {
    const request = await this.requestRepo.findOne({ where: { id } });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    return request;
  }

  async approve(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Only pending requests can be approved');
    }

    const result = this.hcmService.commitTimeOff(
      request.id,
      request.employeeId,
      request.locationId,
      request.amount,
    );

    const fromStatus = request.status;

    if ('success' in result && result.success) {
      request.status = 'APPROVED';
      request.failureReason = null;

      await this.balancesService.movePendingToApproved(
        request.employeeId,
        request.locationId,
        request.amount,
      );

      const currentHcmBalance = this.hcmService.getBalance(
        request.employeeId,
        request.locationId,
      );

      await this.balancesService.upsertFromRealtime(
        request.employeeId,
        request.locationId,
        currentHcmBalance.balanceAmount,
      );
    } else {
      request.status = 'FAILED_VALIDATION';
      request.failureReason =
        'reason' in result
          ? result.reason ?? 'APPROVAL_FAILED'
          : 'APPROVAL_FAILED';

      await this.balancesService.releasePending(
        request.employeeId,
        request.locationId,
        request.amount,
      );
    }

    const saved = await this.requestRepo.save(request);

    await this.auditService.log(
      saved.id,
      'REQUEST_APPROVAL_PROCESSED',
      fromStatus,
      saved.status,
      saved,
    );

    return saved;
  }

  async reject(id: string) {
    const request = await this.findOne(id);

    if (request.status !== 'PENDING_APPROVAL') {
      throw new BadRequestException('Only pending requests can be rejected');
    }

    const fromStatus = request.status;
    request.status = 'REJECTED';

    await this.balancesService.releasePending(
      request.employeeId,
      request.locationId,
      request.amount,
    );

    const saved = await this.requestRepo.save(request);

    await this.auditService.log(
      saved.id,
      'REQUEST_REJECTED',
      fromStatus,
      saved.status,
      saved,
    );

    return saved;
  }

  async cancel(id: string) {
    const request = await this.findOne(id);
    const fromStatus = request.status;

    if (!['PENDING_APPROVAL', 'APPROVED'].includes(request.status)) {
      throw new BadRequestException(
        'Only pending or approved requests can be cancelled',
      );
    }

    if (request.status === 'PENDING_APPROVAL') {
      await this.balancesService.releasePending(
        request.employeeId,
        request.locationId,
        request.amount,
      );
    }

    if (request.status === 'APPROVED') {
      this.hcmService.cancelTimeOff(
        request.id,
        request.employeeId,
        request.locationId,
        request.amount,
      );

      await this.balancesService.restoreApproved(
        request.employeeId,
        request.locationId,
        request.amount,
      );

      const currentHcmBalance = this.hcmService.getBalance(
        request.employeeId,
        request.locationId,
      );

      await this.balancesService.upsertFromRealtime(
        request.employeeId,
        request.locationId,
        currentHcmBalance.balanceAmount,
      );
    }

    request.status = 'CANCELLED';

    const saved = await this.requestRepo.save(request);

    await this.auditService.log(
      saved.id,
      'REQUEST_CANCELLED',
      fromStatus,
      saved.status,
      saved,
    );

    return saved;
  }
}