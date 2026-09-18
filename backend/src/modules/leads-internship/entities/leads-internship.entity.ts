import { Column, Entity, Index } from 'typeorm';
import { BaseEntity } from '../../../common/entities/base.entity';

/**
 * Internship Leads — independent table, no FKs.
 */
@Entity('leads_internship')
export class LeadsInternship extends BaseEntity {
  @Index('idx_leads_internship_email')
  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: false })
  fullName: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  gender?: string | null;

  @Column({ name: 'dob', type: 'date', nullable: true })
  dob?: string | null;

  @Column({ name: 'current_course', type: 'varchar', length: 255, nullable: true })
  currentCourse?: string | null;

  @Column({ type: 'text', nullable: true })
  address?: string | null;

  @Column({ type: 'text', nullable: true })
  languages?: string | null;

  @Column({ name: 'computer_skills', type: 'text', nullable: true })
  computerSkills?: string | null;

  @Column({ type: 'text', nullable: true })
  message?: string | null;

  @Column({ name: 'terms_accepted', type: 'boolean', nullable: false, default: false })
  termsAccepted: boolean;
}
