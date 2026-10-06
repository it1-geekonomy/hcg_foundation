import {
  ApiPropertyOptional,
  IntersectionType,
  PartialType,
} from '@nestjs/swagger';
import { DisplayOrderModeDto } from '../../../common/dto/display-order-mode.dto';
import { CreateAwardDto } from './create-award.dto';

/** Swagger-only shape so the file picker appears on multipart endpoints. */
export class CreateAwardMultipartDto extends CreateAwardDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Award image (WebP or AVIF, max 5MB)',
  })
  awardImage?: unknown;
}

export class UpdateAwardMultipartDto extends IntersectionType(
  PartialType(CreateAwardMultipartDto),
  DisplayOrderModeDto,
) {}
