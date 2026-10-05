import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';
import { TeamType } from '../../../common/enums/team-type.enum';

export class CreateTeamDto extends SeoFieldsDto {
  @ApiProperty({ example: 'Dr. John Smith' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Senior Oncologist' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  designation?: string;

  @ApiPropertyOptional({
    example: 'https://cdn.example.com/teams/dr-john-smith.jpg',
    description: 'Team member image URL',
  })
  @IsOptional()
  @IsString()
  teamImage?: string;

  @ApiPropertyOptional({
    example: '<p>Dr. John Smith has over 20 years of experience in oncology...</p>',
    description: 'Full bio/content (HTML / rich text)',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    example: 1,
    description: 'Order of display (ascending). If omitted, item is appended at the end.',
  })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Type(() => Number)
  displayOrder?: number;

  @ApiProperty({
    enum: TeamType,
    example: TeamType.TEAM,
    description: 'Whether this person is a team member or a trustee',
  })
  @IsEnum(TeamType)
  type: TeamType;

  @ApiPropertyOptional({
    enum: ContentStatus,
    example: 'draft',
    default: ContentStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
