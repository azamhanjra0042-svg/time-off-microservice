import { Module } from '@nestjs/common';
import { HcmService } from './hcm.service';
import { MockHcmModule } from '../mock-hcm/mock-hcm.module';

@Module({
  imports: [MockHcmModule],
  providers: [HcmService],
  exports: [HcmService],
})
export class HcmModule {}