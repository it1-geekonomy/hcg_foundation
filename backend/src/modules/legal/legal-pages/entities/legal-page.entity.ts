import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../../common/enums/content-status.enum';
import { LegalPageType } from '../../../../common/enums/legal-page-type.enum';

/**
 * Privacy Policy & Terms and Conditions pages.
 * Differentiated by `pageType` — independent table, no FKs.
 */
@Entity('legal_pages')
export class LegalPage extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Index('idx_legal_pages_slug', { unique: true })
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug: string;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Index('idx_legal_pages_page_type')
  @Column({
    name: 'page_type',
    type: 'enum',
    enum: LegalPageType,
    enumName: 'legal_page_type',
    nullable: false,
  })
  pageType: LegalPageType;

  @Index('idx_legal_pages_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
