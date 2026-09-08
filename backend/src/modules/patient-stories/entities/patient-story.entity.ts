import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('patient_stories')
export class PatientStory extends SeoContentEntity {

  @Column({ name: 'patient_name', type: 'varchar', nullable: false })
  patientName: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ type: 'varchar', nullable: true })
  tagline?: string;

  @Column({ type: 'text', nullable: true })
  story?: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true, default: 0 })
  displayOrder?: number;

  @Column({ name: 'is_featured', type: 'boolean', nullable: false, default: false })
  isFeatured: boolean;

  @Column({ name: 'is_published', type: 'boolean', nullable: false, default: false })
  isPublished: boolean;
}
