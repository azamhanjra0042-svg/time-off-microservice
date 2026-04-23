import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TimeOffRequestsController } from './time-off-requests.controller';
import { TimeOffRequestsService } from './time-off-requests.service';
import { TimeOffRequest } from './entities/time-off-request.entity';
import { BalancesModule } from '../balances/balances.module';
import { HcmModule } from '../hcm/hcm.module';
import { AuditModule } from '../audit/audit.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([TimeOffRequest]),
    BalancesModule,
    HcmModule,
    AuditModule,
  ],
  controllers: [TimeOffRequestsController],
  providers: [TimeOffRequestsService],
  exports: [TimeOffRequestsService, TypeOrmModule],
})
export class TimeOffRequestsModule {}