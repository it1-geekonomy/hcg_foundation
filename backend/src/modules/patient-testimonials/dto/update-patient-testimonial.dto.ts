import { PartialType } from '@nestjs/swagger';
import { CreatePatientTestimonialDto } from './create-patient-testimonial.dto';

export class UpdatePatientTestimonialDto extends PartialType(CreatePatientTestimonialDto) {}
