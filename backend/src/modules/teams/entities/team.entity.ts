import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../common/enums/content-status.enum';
import { TeamType } from '../../../common/enums/team-type.enum';

@Entity('teams')
@Index('idx_teams_status', ['status'])
@Index('idx_teams_type', ['type'])
export class Team extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string;

  @Column({ name: 'team_image', type: 'text', nullable: true })
  teamImage?: string;

  @Column({ type: 'text', nullable: true })
  content?: string;

  @Column({
    type: 'enum',
    enumName: 'team_type',
    enum: TeamType,
    nullable: false,
    default: TeamType.TEAM,
  })
  type: TeamType;

  @Column({
    type: 'enum',
    enumName: 'content_status',
    enum: ContentStatus,
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
