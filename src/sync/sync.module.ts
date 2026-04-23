import { Module } from '@nestjs/common';
import { BalancesModule } from '../balances/balances.module';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';

@Module({
  imports: [BalancesModule],
  controllers: [SyncController],
  providers: [SyncService],
})
export class SyncModule {}