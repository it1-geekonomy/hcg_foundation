import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

@Entity('terms_and_conditions')
@Index('idx_terms_and_conditions_status', ['status'])
export class TermsAndCondition extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'text', nullable: false })
  content: string;

  @Column({
    type: 'enum',
    enumName: 'content_status',
    enum: ContentStatus,
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
