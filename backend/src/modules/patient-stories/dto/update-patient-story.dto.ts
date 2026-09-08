import { PartialType } from '@nestjs/swagger';
import { CreatePatientStoryDto } from './create-patient-story.dto';

export class UpdatePatientStoryDto extends PartialType(CreatePatientStoryDto) {}
