import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class VerifyDonationDto {
  @ApiProperty({ example: 'order_xxxxxxxxxxxxxxxx' })
  @IsString()
  razorpayOrderId!: string;

  @ApiProperty({ example: 'pay_xxxxxxxxxxxxxxxx' })
  @IsString()
  razorpayPaymentId!: string;

  @ApiProperty({ example: 'a1b2c3d4e5f6...' })
  @IsString()
  razorpaySignature!: string;
}
