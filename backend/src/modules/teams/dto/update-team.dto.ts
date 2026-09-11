import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { SeoFieldsDto } from '../../../common/dto/seo-fields.dto';
import { ContentStatus } from '../../../common/enums/content-status.enum';

export class UpdateTeamDto extends SeoFieldsDto {
  @ApiPropertyOptional({ example: 'Dr. John Smith' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

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
    example: 'Senior oncologist specializing in breast cancer treatment',
    description: 'Short blurb for cards',
  })
  @IsOptional()
  @IsString()
  shortDescription?: string;

  @ApiPropertyOptional({
    enum: ContentStatus,
    example: 'published',
  })
  @IsOptional()
  @IsEnum(ContentStatus)
  status?: ContentStatus;
}
