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
import { CreatePatientStoryDto } from './dto/create-patient-story.dto';
import {
  CreatePatientStoryMultipartDto,
  UpdatePatientStoryMultipartDto,
} from './dto/patient-story-multipart.dto';
import { UpdatePatientStoryDto } from './dto/update-patient-story.dto';
import { PatientStory } from './entities/patient-story.entity';
import {
  PatientStoryFiles,
  PatientStoryUploadedFiles,
  PatientStoriesService,
} from './patient-stories.service';

@ApiTags('Patient Stories')
@Controller('patient-stories')
export class PatientStoriesController {
  constructor(private readonly service: PatientStoriesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePatientStoryMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'patientImage', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Create patient story (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image file `patientImage`. CDN URL is stored on the row.',
  })
  @ApiCreatedResponse({ type: PatientStory })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreatePatientStoryDto,
    @UploadedFiles()
    files?: PatientStoryUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toPatientStoryFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Patient story created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all patient stories (CMS)',
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
          ? 'No patient stories found'
          : 'Patient stories fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published patient stories (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published patient stories found'
          : 'Published patient stories fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published patient story by slug (website)',
    description:
      'Public detail page. Use slug in the URL, e.g. /resources/patient-stories/john-doe-recovery-journey',
  })
  @ApiOkResponse({ type: PatientStory })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published patient story fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient story by id (CMS, any status)' })
  @ApiOkResponse({ type: PatientStory })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient story fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePatientStoryMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'patientImage', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Update patient story (CMS / super-admin)',
    description:
      'Optional new `patientImage` file replaces the previous CDN object.',
  })
  @ApiOkResponse({ type: PatientStory })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientStoryDto,
    @UploadedFiles()
    files?: PatientStoryUploadedFiles,
  ) {
    const data = await this.service.update(
      id,
      dto,
      this.toPatientStoryFiles(files),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient story updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted patient story (CMS / super-admin)',
    description: 'Clears deletedAt so the story shows again in CMS and on the website if published.',
  })
  @ApiOkResponse({ type: PatientStory })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient story restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete patient story (CMS / super-admin)',
    description: 'Sets deletedAt. Hidden from CMS lists and the website.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient story deleted successfully',
    };
  }

  private toPatientStoryFiles(
    files?: PatientStoryUploadedFiles,
  ): PatientStoryFiles {
    return {
      patientImage: files?.patientImage?.[0],
    };
  }
}
