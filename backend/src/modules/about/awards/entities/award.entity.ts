import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('awards')
export class Award extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'int', nullable: true })
  year?: number;

  @Column({ name: 'image_url', type: 'varchar', nullable: true })
  imageUrl?: string;

  @Column({ name: 'display_order', type: 'int', nullable: true, default: 0 })
  displayOrder?: number;

  @Column({ name: 'is_active', type: 'boolean', nullable: false, default: true })
  isActive: boolean;
}
