import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateEventMultipartDto extends CreateEventDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (4:3 aspect ratio, e.g. 800x600px, WebP or AVIF, max 5MB)',
  })
  eventBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (4:3 aspect ratio, e.g. 800x600px, WebP or AVIF, max 5MB)',
  })
  eventMobileBanner?: unknown;
}

export class UpdateEventMultipartDto extends PartialType(
  CreateEventMultipartDto,
) {}
