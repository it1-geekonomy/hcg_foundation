import { PartialType } from '@nestjs/swagger';
import { CreateLeadContactDto } from './create-lead-contact.dto';

export class UpdateLeadContactDto extends PartialType(CreateLeadContactDto) {}
