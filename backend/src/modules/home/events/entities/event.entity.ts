import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('events')
export class Event extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ name: 'event_date', type: 'timestamptz', nullable: true })
  eventDate?: Date | null;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ name: 'is_published', type: 'boolean', nullable: false, default: false })
  isPublished: boolean;
}
