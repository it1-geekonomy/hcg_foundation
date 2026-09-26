import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Privacy Policy — independent table, no FKs.
 */
@Entity('privacy_policy')
export class PrivacyPolicy extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @Column({ type: 'text', nullable: false })
  content?: string;

  @Index('idx_privacy_policy_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
