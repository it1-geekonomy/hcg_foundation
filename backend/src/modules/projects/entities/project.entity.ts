import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('projects')
export class Project extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'varchar', nullable: false })
  slug: string;

  @Column({ type: 'text', nullable: true })
  summary?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true, default: 0 })
  displayOrder?: number;

  @Column({ name: 'is_featured', type: 'boolean', nullable: false, default: false })
  isFeatured: boolean;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive: boolean;
}
