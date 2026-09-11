import { PartialType } from '@nestjs/swagger';
import { CreateLeadsInternshipDto } from './create-leads-internship.dto';

export class UpdateLeadsInternshipDto extends PartialType(CreateLeadsInternshipDto) {}
