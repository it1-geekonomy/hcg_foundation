import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifySubscriptionDto {
  @ApiProperty({ example: 'sub_K1234567890' })
  @IsString()
  @IsNotEmpty()
  razorpaySubscriptionId!: string;

  @ApiProperty({ example: 'pay_K1234567890' })
  @IsString()
  @IsNotEmpty()
  razorpayPaymentId!: string;

  @ApiProperty({ example: '9a8b7c6d5e4f3a2b1c0d' })
  @IsString()
  @IsNotEmpty()
  razorpaySignature!: string;
}
