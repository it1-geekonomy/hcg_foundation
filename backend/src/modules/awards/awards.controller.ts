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
import { CreateAwardDto } from './dto/create-award.dto';
import {
  CreateAwardMultipartDto,
  UpdateAwardMultipartDto,
} from './dto/award-multipart.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { Award } from './entities/award.entity';
import { AwardFiles, AwardUploadedFiles, AwardsService } from './awards.service';

@ApiTags('Awards')
@Controller('awards')
export class AwardsController {
  constructor(private readonly service: AwardsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAwardMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'awardImage', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Create award (CMS / super-admin)',
    description:
      'Send multipart form fields with optional `awardImage` (WebP or AVIF, max 5MB) or direct `awardImageUrl`. Uploaded images are stored on Cloudflare R2 CDN.',
  })
  @ApiCreatedResponse({ type: Award })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateAwardDto,
    @UploadedFiles()
    files?: AwardUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toAwardFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Award created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all awards (CMS)',
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
          ? 'No awards found'
          : 'Awards fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published awards (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published awards found'
          : 'Published awards fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get award by id (CMS, any status)' })
  @ApiOkResponse({ type: Award })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Award fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAwardMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'awardImage', maxCount: 1 }]),
  )
  @ApiOperation({
    summary: 'Update award (CMS / super-admin)',
    description:
      'Optional new `awardImage` replaces previous CDN image. Can also update other award fields.',
  })
  @ApiOkResponse({ type: Award })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAwardDto,
    @UploadedFiles()
    files?: AwardUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toAwardFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Award updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted award (CMS / super-admin)',
    description: 'Clears deletedAt so the award shows again in CMS and on the website if published.',
  })
  @ApiOkResponse({ type: Award })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Award restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete award (CMS / super-admin)',
    description: 'Sets deletedAt. Hidden from CMS lists and the website.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Award deleted successfully',
    };
  }

  private toAwardFiles(files?: AwardUploadedFiles): AwardFiles {
    return {
      awardImage: files?.awardImage?.[0],
    };
  }
}
