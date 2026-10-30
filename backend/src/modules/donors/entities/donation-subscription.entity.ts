import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DonationCategory } from '../../../common/enums/donation-category.enum';

export const DONATION_FREQUENCIES = ['monthly', 'quarterly', 'yearly'] as const;
export type DonationFrequency = (typeof DONATION_FREQUENCIES)[number];

/** Razorpay subscription states, stored as Razorpay reports them. */
export const SUBSCRIPTION_STATUSES = [
  'created',
  'authenticated',
  'active',
  'pending',
  'halted',
  'paused',
  'cancelled',
  'completed',
  'expired',
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

/**
 * A recurring donation (Razorpay subscription). Every successful charge is
 * stored as its own row in `donors` with `subscription_id` pointing here.
 */
@Entity('donation_subscriptions')
export class DonationSubscription extends BaseEntity {
  @ApiProperty({ example: 'Anita Sharma' })
  @Column({ name: 'full_name', type: 'varchar', length: 255 })
  fullName!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @ApiPropertyOptional({ example: 'anita@example.com' })
  @Index('idx_donation_subscriptions_email')
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

  @ApiProperty({ enum: DonationCategory })
  @Column({
    name: 'donation_category',
    type: 'enum',
    enum: DonationCategory,
    enumName: 'donation_category_enum',
    default: DonationCategory.GENERAL_FUNDS,
  })
  donationCategory!: DonationCategory;

  @ApiPropertyOptional()
  @Column({ name: 'patient_story_id', type: 'uuid', nullable: true })
  patientStoryId?: string | null;

  @ApiProperty({ enum: DONATION_FREQUENCIES, example: 'monthly' })
  @Column({ type: 'varchar', length: 20 })
  frequency!: DonationFrequency;

  @ApiProperty({ example: '1000.00', description: 'Amount charged every cycle' })
  @Column({ type: 'numeric', precision: 12, scale: 2 })
  amount!: string;

  @ApiProperty({ example: 'INR' })
  @Column({ type: 'varchar', length: 10, default: 'INR' })
  currency!: string;

  @ApiProperty({ example: 'plan_xxxxxxxxxxxx' })
  @Column({ name: 'razorpay_plan_id', type: 'varchar', length: 255 })
  razorpayPlanId!: string;

  @ApiProperty({ example: 'sub_xxxxxxxxxxxx' })
  @Index('idx_donation_subscriptions_razorpay_id', { unique: true })
  @Column({ name: 'razorpay_subscription_id', type: 'varchar', length: 255 })
  razorpaySubscriptionId!: string;

  @ApiProperty({ enum: SUBSCRIPTION_STATUSES, example: 'active' })
  @Index('idx_donation_subscriptions_status')
  @Column({ type: 'varchar', length: 20, default: 'created' })
  status!: SubscriptionStatus;

  @ApiProperty({ example: 3, description: 'Successful charges so far' })
  @Column({ name: 'paid_count', type: 'int', default: 0 })
  paidCount!: number;

  @ApiProperty({ example: 120, description: 'Maximum number of charges' })
  @Column({ name: 'total_count', type: 'int' })
  totalCount!: number;

  @ApiPropertyOptional({ description: 'When the next charge is due' })
  @Column({ name: 'next_charge_at', type: 'timestamptz', nullable: true })
  nextChargeAt?: Date | null;

  @ApiPropertyOptional()
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date | null;
}
