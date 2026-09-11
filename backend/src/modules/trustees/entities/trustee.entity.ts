import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

@Entity('trustees')
@Index('idx_trustees_status', ['status'])
export class Trustee extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Index()
  @Column({ type: 'varchar', length: 255, nullable: false, unique: true })
  slug: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string;

  @Column({ name: 'trustee_image', type: 'text', nullable: true })
  trusteeImage?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string;

  @Column({
    type: 'enum',
    enumName: 'content_status',
    enum: ContentStatus,
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
