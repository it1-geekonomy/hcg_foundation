import { Column, Entity } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';

/**
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('newsletters')
export class Newsletter extends SeoContentEntity {

  @Column({ type: 'varchar', nullable: false })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'file_url', type: 'varchar', nullable: true })
  fileUrl?: string;

  @Column({ name: 'issue_date', type: 'timestamptz', nullable: true })
  issueDate?: Date | null;

  @Column({ name: 'is_published', type: 'boolean', nullable: false, default: false })
  isPublished: boolean;
}
