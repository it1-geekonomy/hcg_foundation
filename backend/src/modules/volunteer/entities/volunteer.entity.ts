import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Volunteer form submissions
 */
@Entity('volunteer')
export class Volunteer extends BaseEntity {
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: false })
  phone: string;

  @Index('idx_volunteer_email')
  @Column({ type: 'varchar', length: 255, nullable: false })
  email: string;

  @Column({ name: 'city_location', type: 'varchar', length: 255, nullable: false })
  cityLocation: string;

  @Column({ name: 'educational_qualification', type: 'varchar', length: 255, nullable: false })
  educationalQualification: string;

  @Column({ name: 'areas_of_interest', type: 'varchar', length: 255, nullable: false })
  areasOfInterest: string;

  @Column({ type: 'text', nullable: false })
  reason: string;

  @Column({ name: 'terms_accepted', type: 'boolean', nullable: false, default: false })
  termsAccepted: boolean;
}
