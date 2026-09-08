import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../../common/dto/pagination-query.dto';
import { LegalPageType } from '../../../../common/enums/legal-page-type.enum';

export class ListLegalPagesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: LegalPageType,
    description: 'Filter by privacy policy vs terms and conditions',
  })
  @IsOptional()
  @IsEnum(LegalPageType)
  pageType?: LegalPageType;
}
