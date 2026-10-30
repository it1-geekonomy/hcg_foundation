import { ApiProperty } from '@nestjs/swagger';
import { IsIn } from 'class-validator';
import { CreateDonationDto } from './create-donation.dto';
import {
  DONATION_FREQUENCIES,
  type DonationFrequency,
} from '../entities/donation-subscription.entity';

export class CreateSubscriptionDto extends CreateDonationDto {
  @ApiProperty({ enum: DONATION_FREQUENCIES, example: 'monthly' })
  @IsIn([...DONATION_FREQUENCIES])
  frequency!: DonationFrequency;
}
