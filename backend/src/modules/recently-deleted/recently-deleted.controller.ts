import { Controller, Get, HttpStatus, Query } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { ListRecentlyDeletedQueryDto } from './dto/list-recently-deleted-query.dto';
import { RecentlyDeletedService } from './recently-deleted.service';

@ApiTags('Recently Deleted')
@ApiBearerAuth()
@Controller('recently-deleted')
export class RecentlyDeletedController {
  constructor(private readonly service: RecentlyDeletedService) {}

  @Get()
  @ApiOperation({
    summary: 'List recently deleted records (CMS trash)',
    description:
      'All soft-deleted rows across CMS modules, newest first. Optional resource filter. Restore with POST {restorePath}.',
  })
  @ApiOkResponse({ description: 'Paginated trash list for the Recently Deleted page' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: ListRecentlyDeletedQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No recently deleted records found'
          : 'Recently deleted records fetched successfully',
      ...result,
    };
  }
}
