import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Annual reports — banner + PDF stored on Cloudflare R2.
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('annual_reports')
export class AnnualReport extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Index('idx_annual_reports_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug: string;

  @Column({ name: 'report_year', type: 'varchar', length: 9, nullable: true })
  reportYear?: string | null;

  /** Public R2 URL for banner image */
  @Column({ name: 'annual_report_banner', type: 'text', nullable: true })
  annualReportBanner?: string | null;

  /** Public R2 URL for report PDF/file */
  @Column({ name: 'annual_report_file', type: 'text', nullable: true })
  annualReportFile?: string | null;

  @Index('idx_annual_reports_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
