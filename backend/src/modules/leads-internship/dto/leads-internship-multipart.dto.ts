import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateLeadsInternshipDto } from './create-leads-internship.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateLeadsInternshipMultipartDto extends CreateLeadsInternshipDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'CV file (PDF, DOC, DOCX, etc., max 5MB)',
  })
  cv?: any;
}

export class UpdateLeadsInternshipMultipartDto extends PartialType(
  CreateLeadsInternshipMultipartDto,
) {}
