import { PartialType } from '@nestjs/swagger';
import { CreateLeadsContactDto } from './create-leads-contact.dto';

export class UpdateLeadsContactDto extends PartialType(CreateLeadsContactDto) {}
