import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

@Entity('blogs')
export class Blog extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_blogs_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'blog_banner', type: 'text', nullable: true })
  blogBanner?: string | null;

  @Column({ name: 'blog_mobile_banner', type: 'text', nullable: true })
  blogMobileBanner?: string | null;

  @Index('idx_blogs_blog_date')
  @Column({ name: 'blog_date', type: 'date', nullable: true })
  blogDate?: string | null;

  @Column({ name: 'author_name', type: 'varchar', length: 255, nullable: true })
  authorName?: string | null;

  @Column({ name: 'author_designation', type: 'varchar', length: 255, nullable: true })
  authorDesignation?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_blogs_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
