import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Events — independent table, no FKs.
 */
@Entity('events')
export class Event extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_events_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'event_banner', type: 'text', nullable: true })
  eventBanner?: string | null;

  @Column({ name: 'event_mobile_banner', type: 'text', nullable: true })
  eventMobileBanner?: string | null;

  @Index('idx_events_event_date')
  @Column({ name: 'event_date', type: 'date', nullable: true })
  eventDate?: string | null;

  @Column({ name: 'event_location', type: 'varchar', length: 255, nullable: true })
  eventLocation?: string | null;

  @Column({ name: 'event_time', type: 'time', nullable: true })
  eventTime?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_events_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
