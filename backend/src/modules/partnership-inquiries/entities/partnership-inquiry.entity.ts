import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { InquiryStatus } from '../../../common/enums/inquiry-status.enum';

/**
 * Partnership Inquiries — independent table per ERD.
 */
@Entity('partnership_inquiries')
export class PartnershipInquiry extends BaseEntity {
  @ApiProperty({ example: 'Vikram Mehta' })
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @ApiProperty({ example: 'vikram@csr-foundation.org' })
  @Index('idx_partnership_inquiries_email')
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @ApiProperty({ example: '+91 9876543210' })
  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: false })
  phoneNumber: string;

  @ApiPropertyOptional({ example: 'Mehta Philanthropies Ltd' })
  @Column({
    name: 'organization_name',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  organizationName?: string | null;

  @ApiProperty({ example: 'We would like to collaborate on CSR funding for rural cancer screening camps.' })
  @Column({ type: 'text', nullable: false })
  message: string;

  @ApiProperty({ example: true, default: false })
  @Column({ name: 'terms_accepted', type: 'boolean', nullable: false, default: false })
  termsAccepted: boolean;

  @ApiProperty({ enum: InquiryStatus, default: InquiryStatus.PENDING })
  @Index('idx_partnership_inquiries_status')
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: InquiryStatus.PENDING,
  })
  status: InquiryStatus;
}
