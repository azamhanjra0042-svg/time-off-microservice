import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RequestEvent } from './entities/request-event.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(RequestEvent)
    private readonly requestEventRepo: Repository<RequestEvent>,
  ) {}

  async log(
    requestId: string,
    eventType: string,
    fromStatus: string | null,
    toStatus: string | null,
    payload: any,
  ) {
    const event = this.requestEventRepo.create({
      requestId,
      eventType,
      fromStatus,
      toStatus,
      payload,
    });

    return this.requestEventRepo.save(event);
  }
}