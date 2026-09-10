import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DonationStatus } from '../../../common/enums/donation-status.enum';

/**
 * Donors — independent table, no FKs, no SEO.
 */
@Entity('donors')
export class Donor extends BaseEntity {
  @ApiProperty({ example: 'Anita Sharma' })
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @Index('idx_donors_phone')
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'anita@example.com' })
  @Index('idx_donors_email')
  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  pan?: string | null;

  @ApiPropertyOptional()
  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @ApiProperty({ example: '5000.00' })
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false })
  amount!: string;

  @ApiProperty({ example: 'INR' })
  @Column({ type: 'varchar', length: 10, nullable: false, default: 'INR' })
  currency!: string;

  @ApiPropertyOptional({ example: 'HCG-RCP-1001' })
  @Column({ name: 'receipt_number', type: 'varchar', length: 50, nullable: true })
  receiptNumber?: string | null;

  @ApiPropertyOptional()
  @Index('idx_donors_razorpay_payment_id')
  @Column({
    name: 'razorpay_payment_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  razorpayPaymentId?: string | null;

  @ApiPropertyOptional()
  @Index('idx_donors_razorpay_order_id')
  @Column({
    name: 'razorpay_order_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  razorpayOrderId?: string | null;

  @ApiProperty({ enum: DonationStatus, default: DonationStatus.PENDING })
  @Index('idx_donors_status')
  @Column({
    type: 'enum',
    enum: DonationStatus,
    enumName: 'donation_status',
    nullable: false,
    default: DonationStatus.PENDING,
  })
  status!: DonationStatus;
}
