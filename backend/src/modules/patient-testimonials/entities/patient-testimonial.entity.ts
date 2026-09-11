import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Patient Testimonials — independent table, no FKs.
 */
@Entity('patient_testimonials')
export class PatientTestimonial extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_patient_testimonials_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'patient_testimonial_banner', type: 'text', nullable: true })
  patientTestimonialBanner?: string | null;

  @Column({ name: 'patient_testimonial_mobile_banner', type: 'text', nullable: true })
  patientTestimonialMobileBanner?: string | null;

  @Column({ name: 'patient_testimonial_file', type: 'text', nullable: true })
  patientTestimonialFile?: string | null;

  @Index('idx_patient_testimonials_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
