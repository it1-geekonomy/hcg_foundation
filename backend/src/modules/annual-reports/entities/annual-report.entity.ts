import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

@Entity('annual_reports')
export class AnnualReport extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Index('idx_annual_reports_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug?: string;

  @Column({ name: 'report_year', type: 'varchar', length: 9, nullable: true })
  reportYear?: string | null;

  @Column({ name: 'annual_report_banner', type: 'text', nullable: true })
  annualReportBanner?: string | null;

  @Column({ name: 'annual_report_mobile_banner', type: 'text', nullable: true })
  annualReportMobileBanner?: string | null;

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
  status?: ContentStatus;
}
