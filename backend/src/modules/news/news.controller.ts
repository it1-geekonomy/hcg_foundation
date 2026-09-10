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
import { CreateNewsDto } from './dto/create-news.dto';
import {
  CreateNewsMultipartDto,
  UpdateNewsMultipartDto,
} from './dto/news-multipart.dto';
import { UpdateNewsDto } from './dto/update-news.dto';
import { News } from './entities/news.entity';
import { NewsFiles, NewsUploadedFiles, NewsService } from './news.service';

@ApiTags('News')
@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateNewsMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'newsBanner', maxCount: 1 },
      { name: 'newsMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create news (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image files `newsBanner` and `newsMobileBanner`. CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: News })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateNewsDto,
    @UploadedFiles()
    files?: NewsUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toNewsFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'News created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all news (CMS)',
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
          ? 'No news found'
          : 'News fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published news (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published news found'
          : 'Published news fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published news by slug (website)',
    description:
      'Public detail page. Use slug in the URL, e.g. /resources/news/hcg-foundation-launches-new-initiative',
  })
  @ApiOkResponse({ type: News })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published news fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get news by id (CMS, any status)' })
  @ApiOkResponse({ type: News })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'News fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateNewsMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'newsBanner', maxCount: 1 },
      { name: 'newsMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update news (CMS / super-admin)',
    description:
      'Optional new `newsBanner` / `newsMobileBanner` files replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: News })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsDto,
    @UploadedFiles()
    files?: NewsUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toNewsFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'News updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete news (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'News deleted successfully',
    };
  }

  private toNewsFiles(files?: NewsUploadedFiles): NewsFiles {
    return {
      newsBanner: files?.newsBanner?.[0],
      newsMobileBanner: files?.newsMobileBanner?.[0],
    };
  }
}
