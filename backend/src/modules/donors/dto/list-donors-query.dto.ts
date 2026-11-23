import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { DonationCategory } from '../../../common/enums/donation-category.enum';
import { DonationStatus } from '../../../common/enums/donation-status.enum';
import { ReceiptEmailStatus } from '../../../common/enums/receipt-email-status.enum';

export class ListDonorsQueryDto {
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
    description: 'Search name, email, phone, or receipt number',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: DonationStatus,
    description:
      'Filter by status (paid, refunded, pending, failed). If omitted, returns all.',
  })
  @IsOptional()
  @IsEnum(DonationStatus)
  status?: DonationStatus;

  @ApiPropertyOptional({
    enum: DonationCategory,
    description: 'Only donations made towards this category',
  })
  @IsOptional()
  @IsEnum(DonationCategory)
  donationCategory?: DonationCategory;

  @ApiPropertyOptional({
    enum: ReceiptEmailStatus,
    description: 'Only donations whose receipt email is in this state',
  })
  @IsOptional()
  @IsEnum(ReceiptEmailStatus)
  receiptEmailStatus?: ReceiptEmailStatus;

  @ApiPropertyOptional({
    description: 'Filter donations by patient story ID',
  })
  @IsOptional()
  @IsUUID()
  patientStoryId?: string;

  @ApiPropertyOptional({
    description:
      'true = Outside India / international donors; false = India donors',
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === undefined || value === null || value === '') return undefined;
    if (value === true || value === 'true' || value === '1') return true;
    if (value === false || value === 'false' || value === '0') return false;
    return undefined;
  })
  @IsBoolean()
  isInternational?: boolean;
}
