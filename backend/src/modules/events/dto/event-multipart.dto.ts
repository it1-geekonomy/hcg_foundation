import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateEventDto } from './create-event.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateEventMultipartDto extends CreateEventDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  eventBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  eventMobileBanner?: unknown;
}

export class UpdateEventMultipartDto extends PartialType(
  CreateEventMultipartDto,
) {}
