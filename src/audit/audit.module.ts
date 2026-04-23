import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { RequestEvent } from './entities/request-event.entity';

@Module({
  imports: [TypeOrmModule.forFeature([RequestEvent])],
  providers: [AuditService],
  exports: [AuditService, TypeOrmModule],
})
export class AuditModule {}