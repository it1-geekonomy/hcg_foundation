import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Patient stories — independent table, no FKs.
 */
@Entity('patient_stories')
export class PatientStory extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Index('idx_patient_stories_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug: string;

  @Column({ name: 'patient_image', type: 'text', nullable: true })
  patientImage?: string | null;

  @Index('idx_patient_stories_date')
  @Column({ name: 'story_date', type: 'date', nullable: true })
  storyDate?: string | null;

  @Column({ name: 'donation_state', type: 'varchar', length: 250, nullable: true })
  donationState?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_patient_stories_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
