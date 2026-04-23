import { IsNumber, IsPositive, IsString } from 'class-validator';

export class CreateTimeOffRequestDto {
  @IsString()
  employeeId: string;

  @IsString()
  locationId: string;

  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  startDate: string;

  @IsString()
  endDate: string;

  @IsString()
  reason: string;
}