import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';

export class AnnualReportsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report year (e.g. 2024-25 or 2024)',
  })
  @IsOptional()
  @IsString()
  reportYear?: string;
}
