import { Column, Entity, Index } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { BaseEntity } from '../../../common/entities/base.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';

@Entity('impact_videos')
@Index('idx_impact_videos_status', ['status'])
@Index('idx_impact_videos_display_order', ['displayOrder'])
export class ImpactVideo extends BaseEntity {
  @ApiProperty({
    description: 'CDN URL of the video file',
    example: 'https://cdn.hcgfoundation.org/impact-videos/success-story-2026.mp4',
  })
  @Column({ name: 'video_url', type: 'text', nullable: false })
  videoUrl: string;

  @ApiProperty({
    description: 'Order in which the video should appear on the website',
    example: 1,
    default: 1,
  })
  @Column({ name: 'display_order', type: 'int', nullable: false, default: 1 })
  displayOrder: number;

  @ApiProperty({
    enum: ContentStatus,
    description: 'Publication state',
    default: ContentStatus.DRAFT,
  })
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
