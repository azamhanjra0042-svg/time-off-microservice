import { Body, Controller, Get, Headers, Param, Post } from '@nestjs/common';
import { TimeOffRequestsService } from './time-off-requests.service';
import { CreateTimeOffRequestDto } from './dto/create-time-off-request.dto';

@Controller('time-off-requests')
export class TimeOffRequestsController {
  constructor(
    private readonly timeOffRequestsService: TimeOffRequestsService,
  ) {}

  @Post()
  create(
    @Body() dto: CreateTimeOffRequestDto,
    @Headers('idempotency-key') idempotencyKey: string,
  ) {
    return this.timeOffRequestsService.create(dto, idempotencyKey);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.timeOffRequestsService.findOne(id);
  }

  @Post(':id/approve')
  approve(@Param('id') id: string) {
    return this.timeOffRequestsService.approve(id);
  }

  @Post(':id/reject')
  reject(@Param('id') id: string) {
    return this.timeOffRequestsService.reject(id);
  }

  @Post(':id/cancel')
  cancel(@Param('id') id: string) {
    return this.timeOffRequestsService.cancel(id);
  }
}