import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('gallery')
export class GalleryItem extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ name: 'image_url', type: 'varchar', nullable: false })
  imageUrl: string;

  @Column({ type: 'varchar', nullable: true })
  caption?: string;

  @Column({ type: 'varchar', nullable: true })
  category?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true, default: 0 })
  displayOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive: boolean;
}
