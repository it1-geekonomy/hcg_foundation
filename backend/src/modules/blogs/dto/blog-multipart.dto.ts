import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateBlogDto } from './create-blog.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateBlogMultipartDto extends OmitType(CreateBlogDto, [
  'blogBanner',
  'blogMobileBanner',
] as const) {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  blogBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner (JPEG, PNG, WebP, GIF, max 5MB)',
  })
  blogMobileBanner?: unknown;
}

export class UpdateBlogMultipartDto extends PartialType(
  CreateBlogMultipartDto,
) {}
