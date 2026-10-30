import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  DONATION_FREQUENCIES,
  type DonationFrequency,
  SUBSCRIPTION_STATUSES,
  type SubscriptionStatus,
} from '../entities/donation-subscription.entity';

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

  @ApiPropertyOptional({ description: 'Search name, email or phone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: SUBSCRIPTION_STATUSES,
    description: "If omitted, 'created' (checkout never completed) rows are excluded",
  })
  @IsOptional()
  @IsIn([...SUBSCRIPTION_STATUSES])
  status?: SubscriptionStatus;

  @ApiPropertyOptional({ enum: DONATION_FREQUENCIES })
  @IsOptional()
  @IsIn([...DONATION_FREQUENCIES])
  frequency?: DonationFrequency;
}
