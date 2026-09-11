import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * News — independent table, no FKs.
 */
@Entity('news')
export class News extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_news_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'news_banner', type: 'text', nullable: true })
  newsBanner?: string | null;

  @Column({ name: 'news_mobile_banner', type: 'text', nullable: true })
  newsMobileBanner?: string | null;

  @Index('idx_news_date')
  @Column({ name: 'news_date', type: 'date', nullable: true })
  newsDate?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_news_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
