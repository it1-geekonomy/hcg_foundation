import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TeamType } from '../../../common/enums/team-type.enum';

export class TeamQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TeamType,
    description: 'Filter by member type (team or trustee)',
  })
  @IsOptional()
  @IsEnum(TeamType)
  type?: TeamType;
}
