import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateNewsDto } from './create-news.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateNewsMultipartDto extends CreateNewsDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  newsBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  newsMobileBanner?: unknown;
}

export class UpdateNewsMultipartDto extends PartialType(
  CreateNewsMultipartDto,
) {}
