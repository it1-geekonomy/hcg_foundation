import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { CreateHomeBannerDto } from './create-home-banner.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateHomeBannerMultipartDto extends CreateHomeBannerDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner image (WebP or AVIF, max 5MB)',
  })
  bannerImage?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner image (WebP or AVIF, max 5MB)',
  })
  mobileBannerImage?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Profile image (WebP or AVIF, max 5MB)',
  })
  profileImage?: unknown;
}

export class UpdateHomeBannerMultipartDto extends PartialType(
  CreateHomeBannerMultipartDto,
) {}
