import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { CampaignStatus } from '../../../common/enums/campaign-status.enum';

/**
 * Fundraising Campaigns — independent table per ERD.
 */
@Entity('fundraising_campaigns')
export class FundraisingCampaign extends BaseEntity {
  @ApiProperty({ example: 'Ananya Sharma' })
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @ApiProperty({ example: '+91 9876543210' })
  @Column({ name: 'phone_number', type: 'varchar', length: 30, nullable: false })
  phoneNumber: string;

  @ApiProperty({ example: 'ananya@example.com' })
  @Index('idx_fundraising_campaigns_email')
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @ApiProperty({ example: 'Bengaluru' })
  @Column({ type: 'varchar', length: 150, nullable: false })
  city: string;

  @ApiProperty({ example: '50000.00' })
  @Column({
    name: 'fundraising_goal',
    type: 'numeric',
    precision: 12,
    scale: 2,
    nullable: false,
  })
  fundraisingGoal: string;

  @ApiProperty({ example: 'Support pediatric cancer patient treatments' })
  @Column({ name: 'fundraising_reason', type: 'text', nullable: false })
  fundraisingReason: string;

  @ApiPropertyOptional({ example: 'We would love to start this campaign for World Cancer Day' })
  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @ApiProperty({ example: true, default: false })
  @Column({ name: 'terms_accepted', type: 'boolean', nullable: false, default: false })
  termsAccepted: boolean;

  @ApiProperty({ enum: CampaignStatus, default: CampaignStatus.PENDING })
  @Index('idx_fundraising_campaigns_status')
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    default: CampaignStatus.PENDING,
  })
  status: CampaignStatus;
}
