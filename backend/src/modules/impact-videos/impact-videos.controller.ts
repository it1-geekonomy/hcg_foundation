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
import { CreateImpactVideoDto } from './dto/create-impact-video.dto';
import {
  CreateImpactVideoMultipartDto,
  UpdateImpactVideoMultipartDto,
} from './dto/impact-video-multipart.dto';
import { UpdateImpactVideoDto } from './dto/update-impact-video.dto';
import { ImpactVideo } from './entities/impact-video.entity';
import {
  ImpactVideoUploadedFiles,
  ImpactVideosService,
} from './impact-videos.service';

@ApiTags('Impact Videos')
@Controller('impact-videos')
export class ImpactVideosController {
  constructor(private readonly service: ImpactVideosService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateImpactVideoMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'videoFile', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Create impact video (CMS / super-admin)',
    description:
      'Send multipart form fields with optional `videoFile` (MP4/WebM, max 50MB, no duration limit) or direct `videoUrl`. Uploaded videos are stored on Cloudflare R2 CDN.',
  })
  @ApiCreatedResponse({ type: ImpactVideo })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateImpactVideoDto,
    @UploadedFiles()
    files?: ImpactVideoUploadedFiles,
  ) {
    const data = await this.service.create(dto, files?.videoFile?.[0]);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Impact video created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all impact videos (CMS)',
    description:
      'Returns draft, published, and archived impact videos. Optional status filter and pagination.',
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
          ? 'No impact videos found'
          : 'Impact videos fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published impact videos (website)',
    description:
      'Public endpoint. Only status=published videos ordered by display_order ASC, created_at DESC.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published impact videos found'
          : 'Published impact videos fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get impact video by id (CMS, any status)' })
  @ApiOkResponse({ type: ImpactVideo })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Impact video fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateImpactVideoMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'videoFile', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Update impact video (CMS / super-admin)',
    description:
      'Optional new `videoFile` replaces previous CDN video. Can also update displayOrder and status.',
  })
  @ApiOkResponse({ type: ImpactVideo })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateImpactVideoDto,
    @UploadedFiles()
    files?: ImpactVideoUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, files?.videoFile?.[0]);
    return {
      statusCode: HttpStatus.OK,
      message: 'Impact video updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete impact video (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Impact video deleted successfully',
    };
  }
}
