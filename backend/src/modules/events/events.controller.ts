import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateEventDto } from './dto/create-event.dto';
import {
  CreateEventMultipartDto,
  UpdateEventMultipartDto,
} from './dto/event-multipart.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Event } from './entities/event.entity';
import { EventFiles, EventUploadedFiles, EventsService } from './events.service';

@ApiTags('Events')
@Controller('events')
export class EventsController {
  constructor(private readonly service: EventsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateEventMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'eventBanner', maxCount: 1 },
      { name: 'eventMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create event (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image files `eventBanner` and `eventMobileBanner`. CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: Event })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateEventDto,
    @UploadedFiles()
    files?: EventUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toEventFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Event created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all events (CMS)',
    description:
      'Returns draft, published, and archived. Optional status/search filters. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: PaginationQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No events found'
          : 'Events fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published events (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published events found'
          : 'Published events fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published event by slug (website)',
    description:
      'Public detail page. Use slug in the URL, e.g. /resources/events/pink-hope-awareness-walk',
  })
  @ApiOkResponse({ type: Event })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published event fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get event by id (CMS, any status)' })
  @ApiOkResponse({ type: Event })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateEventMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'eventBanner', maxCount: 1 },
      { name: 'eventMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update event (CMS / super-admin)',
    description:
      'Optional new `eventBanner` / `eventMobileBanner` files replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: Event })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateEventDto,
    @UploadedFiles()
    files?: EventUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toEventFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Event updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete event (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Event deleted successfully',
    };
  }

  private toEventFiles(files?: EventUploadedFiles): EventFiles {
    return {
      eventBanner: files?.eventBanner?.[0],
      eventMobileBanner: files?.eventMobileBanner?.[0],
    };
  }
}
