import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BalancesModule } from './balances/balances.module';
import { TimeOffRequestsModule } from './time-off-requests/time-off-requests.module';
import { HcmModule } from './hcm/hcm.module';
import { AuditModule } from './audit/audit.module';
import { MockHcmModule } from './mock-hcm/mock-hcm.module';
import { SyncModule } from './sync/sync.module';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'timeoff.db',
      autoLoadEntities: true,
      synchronize: true,
    }),
    BalancesModule,
    TimeOffRequestsModule,
    HcmModule,
    AuditModule,
    MockHcmModule,
    SyncModule,
  ],
})
export class AppModule {}