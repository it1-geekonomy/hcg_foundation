import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SeoFieldsDto } from '../../../../common/dto/seo-fields.dto';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { ContentStatus } from '../../../../common/enums/content-status.enum';
import { TeamMemberType } from '../../../../common/enums/team-member-type.enum';

export class CreateTeamDto extends SeoFieldsDto {
  @ApiProperty({
    example: 'Dr. Aman',
    description: 'Display name shown on the card',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    example: 'Founder and Managing Trustee',
    description: 'Role / designation under the name',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/teams/ajaikumar.jpg',
    description: 'Portrait image URL',
  })
  @IsOptional()
  @IsString()
  teamImage?: string;

  @ApiPropertyOptional({
    description: 'Full biography / detail content',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Short blurb for cards / previews',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiProperty({
    enum: TeamMemberType,
    default: TeamMemberType.TRUSTEE,
    description: 'Whether this person is a trustee or a team member',
    example: TeamMemberType.TRUSTEE,
  })
  @IsEnum(TeamMemberType)
  memberType: TeamMemberType;

  @ApiPropertyOptional({
    enum: ContentStatus,
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
