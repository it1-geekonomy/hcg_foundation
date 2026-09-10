import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePatientStoryDto } from './create-patient-story.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreatePatientStoryMultipartDto extends CreatePatientStoryDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Patient image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  patientImage?: unknown;
}

export class UpdatePatientStoryMultipartDto extends PartialType(
  CreatePatientStoryMultipartDto,
) {}
