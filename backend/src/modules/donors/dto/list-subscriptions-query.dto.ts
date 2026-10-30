import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, IsUUID, Max, Min } from 'class-validator';
import { SubscriptionPeriod } from '../../../common/enums/subscription-period.enum';

export class ListSubscriptionsQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    description: 'Search subscriber name, email, phone, or subscription ID',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by status (created, active, halted, cancelled, completed)',
  })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({
    enum: SubscriptionPeriod,
    description: 'Filter subscriptions by period (monthly, quarterly, yearly)',
  })
  @IsOptional()
  period?: SubscriptionPeriod;

  @ApiPropertyOptional({
    description: 'Filter subscriptions by patient story ID',
  })
  @IsOptional()
  @IsUUID()
  patientStoryId?: string;
}
