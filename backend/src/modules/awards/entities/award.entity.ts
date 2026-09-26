import { Column, Entity, Index } from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

/**
 * Awards — independent table, no FKs.
 */
@Entity('awards')
export class Award extends BaseEntity {
  @ApiProperty({ example: 'Humanitarian Award 2024' })
  @Column({ type: 'varchar', length: 255, nullable: false })
  title?: string;

  @ApiPropertyOptional({ example: 2024 })
  @Column({ type: 'int', nullable: true })
  year?: number;

  @ApiPropertyOptional({ description: 'Description of the award' })
  @Column({ type: 'text', nullable: true })
  description?: string;

  @ApiProperty({
    description: 'CDN URL of the award image',
    example: 'https://cdn.hcgfoundation.org/awards/humanitarian-2024.jpg',
  })
  @Column({ name: 'award_image_url', type: 'text', nullable: false })
  awardImageUrl?: string;

  @ApiProperty({ example: 1, default: 1 })
  @Column({ name: 'display_order', type: 'int', nullable: false, default: 1 })
  displayOrder?: number;

  @ApiProperty({
    enum: ContentStatus,
    description: 'Publication state',
    default: ContentStatus.DRAFT,
  })
  @Index('idx_awards_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status?: ContentStatus;
}
