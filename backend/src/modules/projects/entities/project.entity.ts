import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Projects — independent table, no FKs.
 */
@Entity('projects')
export class Project extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_projects_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'project_banner', type: 'text', nullable: true })
  projectBanner?: string | null;

  @Column({ name: 'project_mobile_banner', type: 'text', nullable: true })
  projectMobileBanner?: string | null;

  @Index('idx_projects_date')
  @Column({ name: 'project_date', type: 'date', nullable: true })
  projectDate?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_projects_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
