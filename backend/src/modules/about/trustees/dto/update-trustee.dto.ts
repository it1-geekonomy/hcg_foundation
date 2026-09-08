import { PartialType } from '@nestjs/swagger';
import { CreateTrusteeDto } from './create-trustee.dto';

export class UpdateTrusteeDto extends PartialType(CreateTrusteeDto) {}
