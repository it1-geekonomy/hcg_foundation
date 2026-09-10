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
import { BlogsService, BlogFiles, BlogUploadedFiles } from './blogs.service';
import {
  CreateBlogMultipartDto,
  UpdateBlogMultipartDto,
} from './dto/blog-multipart.dto';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';

@ApiTags('Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateBlogMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'blogBanner', maxCount: 1 },
      { name: 'blogMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create blog (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional files: `blogBanner` and `blogMobileBanner`. CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: Blog })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateBlogDto,
    @UploadedFiles()
    files?: BlogUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Blog created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all blogs (CMS)',
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
          ? 'No blogs found'
          : 'Blogs fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published blogs (website)',
    description:
      'Public. Only status=published. Optional search. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published blogs found'
          : 'Published blogs fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published blog by slug (website)',
    description: 'Public detail page. Use slug in URL.',
  })
  @ApiOkResponse({ type: Blog })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published blog fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get blog by id (CMS, any status)' })
  @ApiOkResponse({ type: Blog })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateBlogMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'blogBanner', maxCount: 1 },
      { name: 'blogMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update blog (CMS / super-admin)',
    description: 'Optional new banner images replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: Blog })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogDto,
    @UploadedFiles()
    files?: BlogUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete blog (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Blog deleted successfully',
    };
  }

  private toFiles(files?: BlogUploadedFiles): BlogFiles {
    return {
      blogBanner: files?.blogBanner?.[0],
      blogMobileBanner: files?.blogMobileBanner?.[0],
    };
  }
}
