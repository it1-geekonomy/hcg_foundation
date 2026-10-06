import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { TeamType } from '../../../common/enums/team-type.enum';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateTeamMultipartDto {
  @ApiProperty({ example: 'Dr. John Smith' })
  title: string;

  @ApiPropertyOptional({ example: 'Senior Oncologist' })
  designation?: string;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Team member image (WebP or AVIF, max 5MB)',
  })
  teamImage?: unknown;

  @ApiPropertyOptional({
    example: '<p>Dr. John Smith has over 20 years of experience in oncology...</p>',
  })
  content?: string;

  @ApiPropertyOptional({ example: 1 })
  displayOrder?: number;

  @ApiProperty({
    enum: TeamType,
    example: TeamType.TEAM,
  })
  type: TeamType;

  @ApiPropertyOptional({ enum: ['draft', 'published', 'archived'], example: 'draft' })
  status?: string;

  @ApiPropertyOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  metaDescription?: string;

  @ApiPropertyOptional()
  schemaCode?: string;
}

export class UpdateTeamMultipartDto extends IntersectionType(
  PartialType(CreateTeamMultipartDto),
  DisplayOrderModeDto,
) {}
