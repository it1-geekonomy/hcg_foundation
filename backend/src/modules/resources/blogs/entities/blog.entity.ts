import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('blogs')
export class Blog extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  excerpt?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'author_name', type: 'varchar', nullable: true })
  authorName?: string;

  @Column({ name: 'cover_image_url', type: 'varchar', nullable: true })
  coverImageUrl?: string;

  @Column({ name: 'published_at', type: 'timestamptz', nullable: true })
  publishedAt?: Date | null;

  @Column({ name: 'is_published', type: 'boolean', nullable: false, default: false })
  isPublished: boolean;
}
