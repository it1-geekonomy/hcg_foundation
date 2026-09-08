import { Column, Entity, Index } from 'typeorm';
import { SeoContentEntity } from '../../../../common/entities/seo-content.entity';
import { ContentStatus } from '../../../../common/enums/content-status.enum';
import { TeamMemberType } from '../../../../common/enums/team-member-type.enum';

/**
 * About Us people cards — same fields for trustees and team.
 * Differentiated by `memberType` enum (no separate trustees table needed for CMS).
 * Independent table — no FK relations (ERD constraint).
 */
@Entity('teams')
export class Team extends SeoContentEntity {
  @Column({ type: 'varchar', length: 255, nullable: false })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  designation?: string | null;

  @Column({ name: 'team_image', type: 'text', nullable: true })
  teamImage?: string | null;

  @Column({ type: 'text', nullable: true })
  content?: string | null;

  @Column({ name: 'short_description', type: 'text', nullable: true })
  shortDescription?: string | null;

  @Index('idx_teams_member_type')
  @Column({
    name: 'member_type',
    type: 'enum',
    enum: TeamMemberType,
    enumName: 'team_member_type',
    nullable: false,
    default: TeamMemberType.TRUSTEE,
  })
  memberType: TeamMemberType;

  @Index('idx_teams_status')
  @Column({
    type: 'enum',
    enum: ContentStatus,
    enumName: 'content_status',
    nullable: false,
    default: ContentStatus.DRAFT,
  })
  status: ContentStatus;
}
