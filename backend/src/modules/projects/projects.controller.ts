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
import { CreateProjectDto } from './dto/create-project.dto';
import {
  CreateProjectMultipartDto,
  UpdateProjectMultipartDto,
} from './dto/project-multipart.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import {
  ProjectFiles,
  ProjectUploadedFiles,
  ProjectsService,
} from './projects.service';

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly service: ProjectsService) { }

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateProjectMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'projectBanner', maxCount: 1 },
      { name: 'projectMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create project (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image files `projectBanner` and `projectMobileBanner`. CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: Project })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateProjectDto,
    @UploadedFiles()
    files?: ProjectUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toProjectFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Project created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all projects (CMS)',
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
          ? 'No projects found'
          : 'Projects fetched successfully',
      ...result,
    };
  }

  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List recently deleted projects (CMS trash)',
    description:
      'Soft-deleted projects only, newest first. Restore with POST /projects/:id/restore.',
  })
  @ApiOkResponse({ description: 'Paginated trash list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findDeleted(@Query() query: PaginationQueryDto) {
    const result = await this.service.findDeleted(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No deleted projects found'
          : 'Deleted projects fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published projects (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published projects found'
          : 'Published projects fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published project by slug (website)',
    description:
      'Public detail page. Use slug in the URL, e.g. /resources/projects/clean-water-initiative',
  })
  @ApiOkResponse({ type: Project })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published project fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get project by id (CMS, any status)' })
  @ApiOkResponse({ type: Project })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateProjectMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'projectBanner', maxCount: 1 },
      { name: 'projectMobileBanner', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update project (CMS / super-admin)',
    description:
      'Optional new `projectBanner` / `projectMobileBanner` files replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: Project })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProjectDto,
    @UploadedFiles()
    files?: ProjectUploadedFiles,
  ) {
    const data = await this.service.update(
      id,
      dto,
      this.toProjectFiles(files),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Project updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted project (CMS / super-admin)',
    description: 'Clears deletedAt so the project shows again in CMS and on the website if published.',
  })
  @ApiOkResponse({ type: Project })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete project (CMS / super-admin)',
    description: 'Sets deletedAt. Hidden from CMS lists and the website.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project deleted successfully',
    };
  }

  private toProjectFiles(files?: ProjectUploadedFiles): ProjectFiles {
    return {
      projectBanner: files?.projectBanner?.[0],
      projectMobileBanner: files?.projectMobileBanner?.[0],
    };
  }
}
