import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreatePatientTestimonialDto } from './create-patient-testimonial.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreatePatientTestimonialMultipartDto extends CreatePatientTestimonialDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (WebP or AVIF, max 5MB)',
  })
  patientTestimonialBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (WebP or AVIF, max 5MB)',
  })
  patientTestimonialMobileBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
     description: 'Testimonial video (MP4, WebM, max 50MB)',
  })
  patientTestimonialFile?: unknown;
}

export class UpdatePatientTestimonialMultipartDto extends PartialType(
  CreatePatientTestimonialMultipartDto,
) {}
