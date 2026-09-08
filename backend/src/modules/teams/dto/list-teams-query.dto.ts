import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { TeamMemberType } from '../../../common/enums/team-member-type.enum';

export class ListTeamsQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({
    enum: TeamMemberType,
    description: 'Filter by trustee vs team member',
  })
  @IsOptional()
  @IsEnum(TeamMemberType)
  memberType?: TeamMemberType;
}
