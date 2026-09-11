import { ApiPropertyOptional, OmitType, PartialType } from '@nestjs/swagger';
import { CreateAnnualReportDto } from './create-annual-report.dto';

/** Swagger-only shape so file pickers appear on multipart endpoints. */
export class CreateAnnualReportMultipartDto extends OmitType(
  CreateAnnualReportDto,
  [
    'annualReportBanner',
    'annualReportMobileBanner',
    'annualReportFile',
  ] as const,
) {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Desktop / web banner image (WebP or AVIF, max 5MB)',
  })
  annualReportBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Mobile banner image (WebP or AVIF, max 5MB)',
  })
  annualReportMobileBanner?: unknown;

  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Annual report document / PDF (PDF, Word, max 25MB)',
  })
  annualReportFile?: unknown;
}

export class UpdateAnnualReportMultipartDto extends PartialType(
  CreateAnnualReportMultipartDto,
) {}
