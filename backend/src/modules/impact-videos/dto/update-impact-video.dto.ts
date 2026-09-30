import { PartialType } from '@nestjs/swagger';
import { CreateImpactVideoDto } from './create-impact-video.dto';

export class UpdateImpactVideoDto extends PartialType(CreateImpactVideoDto) {}
