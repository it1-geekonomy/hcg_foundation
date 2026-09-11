import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import {
  RECENTLY_DELETED_RESOURCES,
  RecentlyDeletedResource,
} from '../recently-deleted.resources';

const RESOURCE_VALUES = RECENTLY_DELETED_RESOURCES.map((r) => r.resource);

export class ListRecentlyDeletedQueryDto {
  @ApiPropertyOptional({ default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20, minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ description: 'Search title / name' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    enum: RESOURCE_VALUES,
    description: 'Filter by one CMS module. Omit to list every deleted row.',
  })
  @IsOptional()
  @IsIn(RESOURCE_VALUES)
  resource?: RecentlyDeletedResource;
}
