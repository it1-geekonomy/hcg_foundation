import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Column, Entity, Index, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';
import { DonationCategory } from '../../../common/enums/donation-category.enum';
import { SubscriptionStatus } from '../../../common/enums/subscription-status.enum';
import { SubscriptionPeriod } from '../../../common/enums/subscription-period.enum';
import { PatientStory } from '../../patient-stories/entities/patient-story.entity';
import { Donor } from './donor.entity';

export { SubscriptionStatus, SubscriptionPeriod };

@Entity('donor_subscriptions')
@Index('idx_donor_subscriptions_plan_lookup', ['amount', 'period', 'currency'])
export class DonorSubscription extends BaseEntity {
  @ApiProperty({ example: 'Rahul Sharma' })
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName!: string;

  @ApiPropertyOptional({ example: '9876543210' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @ApiProperty({ example: 'rahul@example.com' })
  @Index('idx_donor_subscriptions_email')
  @Column({ type: 'varchar', length: 255, nullable: false })
  email!: string;

  @ApiPropertyOptional({ example: 'Bengaluru' })
  @Column({ type: 'varchar', length: 255, nullable: true })
  city?: string | null;

  @ApiPropertyOptional({ example: 'India' })
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string | null;

  @ApiPropertyOptional({ example: 'IN' })
  @Column({ name: 'country_code', type: 'varchar', length: 8, nullable: true })
  countryCode?: string | null;

  @ApiProperty({ example: false })
  @Column({ name: 'is_international', type: 'boolean', default: false })
  isInternational!: boolean;

  @ApiPropertyOptional({ example: 'ABCDE1234F' })
  @Column({ type: 'varchar', length: 20, nullable: true })
  pan?: string | null;

  @ApiProperty({ example: '1000.00' })
  @Column({ type: 'numeric', precision: 12, scale: 2, nullable: false })
  amount!: string;

  @ApiProperty({ example: 'INR' })
  @Column({ type: 'varchar', length: 10, nullable: false, default: 'INR' })
  currency!: string;

  @ApiProperty({ enum: SubscriptionPeriod, default: SubscriptionPeriod.MONTHLY })
  @Column({ type: 'varchar', length: 20, nullable: false, default: SubscriptionPeriod.MONTHLY })
  period!: SubscriptionPeriod;

  @ApiProperty({ enum: DonationCategory, default: DonationCategory.GENERAL_FUNDS })
  @Column({
    name: 'donation_category',
    type: 'enum',
    enum: DonationCategory,
    enumName: 'donation_category_enum',
    nullable: false,
    default: DonationCategory.GENERAL_FUNDS,
  })
  donationCategory!: DonationCategory;

  @ApiPropertyOptional()
  @Index('idx_donor_subscriptions_patient_story_id')
  @Column({ name: 'patient_story_id', type: 'uuid', nullable: true })
  patientStoryId?: string | null;

  @ManyToOne(() => PatientStory, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'patient_story_id' })
  patientStory?: PatientStory | null;

  @ApiPropertyOptional()
  @Column({ name: 'razorpay_customer_id', type: 'varchar', length: 255, nullable: true })
  razorpayCustomerId?: string | null;

  @ApiPropertyOptional()
  @Column({ name: 'razorpay_plan_id', type: 'varchar', length: 255, nullable: true })
  razorpayPlanId?: string | null;

  @ApiProperty({ example: 'sub_K1234567890' })
  @Index('idx_donor_subscriptions_razorpay_subscription_id', { unique: true })
  @Column({ name: 'razorpay_subscription_id', type: 'varchar', length: 255, nullable: false, unique: true })
  razorpaySubscriptionId!: string;

  @ApiProperty({ enum: SubscriptionStatus, default: SubscriptionStatus.CREATED })
  @Index('idx_donor_subscriptions_status')
  @Column({ type: 'varchar', length: 50, nullable: false, default: SubscriptionStatus.CREATED })
  status!: string;

  @ApiProperty({ example: 60 })
  @Column({ name: 'total_count', type: 'int', default: 60 })
  totalCount!: number;

  @ApiProperty({ example: 0 })
  @Column({ name: 'paid_count', type: 'int', default: 0 })
  paidCount!: number;

  @ApiPropertyOptional()
  @Column({ name: 'current_start', type: 'timestamptz', nullable: true })
  currentStart?: Date | null;

  @ApiPropertyOptional()
  @Column({ name: 'current_end', type: 'timestamptz', nullable: true })
  currentEnd?: Date | null;

  @ApiPropertyOptional()
  @Column({ name: 'ended_at', type: 'timestamptz', nullable: true })
  endedAt?: Date | null;

  @OneToMany(() => Donor, (donor) => donor.subscription)
  donations?: Donor[];
}
