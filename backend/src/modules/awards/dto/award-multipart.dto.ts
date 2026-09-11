import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateAwardDto } from './create-award.dto';

/** Swagger-only shape so the file picker appears on multipart endpoints. */
export class CreateAwardMultipartDto extends CreateAwardDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Award image (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  awardImage?: unknown;
}

export class UpdateAwardMultipartDto extends PartialType(
  CreateAwardMultipartDto,
) {}
