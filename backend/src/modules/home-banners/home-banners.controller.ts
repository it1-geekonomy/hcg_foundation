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
import { CreateHomeBannerDto } from './dto/create-home-banner.dto';
import {
  CreateHomeBannerMultipartDto,
  UpdateHomeBannerMultipartDto,
} from './dto/home-banner-multipart.dto';
import { UpdateHomeBannerDto } from './dto/update-home-banner.dto';
import { HomeBanner } from './entities/home-banner.entity';
import {
  HomeBannerFiles,
  HomeBannerUploadedFiles,
  HomeBannersService,
} from './home-banners.service';

@ApiTags('Home Banners')
@Controller('home-banners')
export class HomeBannersController {
  constructor(private readonly service: HomeBannersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateHomeBannerMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'mobileBannerImage', maxCount: 1 },
      { name: 'profileImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create home banner (CMS / super-admin)',
    description:
      'Send multipart form fields with `bannerImage` (WebP or AVIF, max 5MB) or a direct `bannerImageUrl`. Optional `mobileBannerImage` and `profileImage`. Uploaded images are stored on Cloudflare R2 CDN.',
  })
  @ApiCreatedResponse({ type: HomeBanner })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateHomeBannerDto,
    @UploadedFiles()
    files?: HomeBannerUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toHomeBannerFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Home banner created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all home banners (CMS)',
    description:
      'Returns all banners ordered by display order. Requires Bearer token.',
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
          ? 'No home banners found'
          : 'Home banners fetched successfully',
      ...result,
    };
  }

  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List recently deleted home banners (CMS trash)',
    description:
      'Soft-deleted banners only, newest first. Restore with POST /home-banners/:id/restore.',
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
          ? 'No deleted home banners found'
          : 'Deleted home banners fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('active')
  @ApiOperation({
    summary: 'List active home banners (website)',
    description: 'Public. Only active banners ordered by display order.',
  })
  @ApiOkResponse({ type: [HomeBanner] })
  async findActive() {
    const data = await this.service.findActive();
    return {
      statusCode: HttpStatus.OK,
      message:
        data.length === 0
          ? 'No active home banners found'
          : 'Active home banners fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get home banner by id (CMS)' })
  @ApiOkResponse({ type: HomeBanner })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Home banner fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateHomeBannerMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'bannerImage', maxCount: 1 },
      { name: 'mobileBannerImage', maxCount: 1 },
      { name: 'profileImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update home banner (CMS / super-admin)',
    description:
      'Optional new `bannerImage`, `mobileBannerImage`, or `profileImage` replaces the previous CDN file.',
  })
  @ApiOkResponse({ type: HomeBanner })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHomeBannerDto,
    @UploadedFiles()
    files?: HomeBannerUploadedFiles,
  ) {
    const data = await this.service.update(
      id,
      dto,
      this.toHomeBannerFiles(files),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Home banner updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted home banner (CMS / super-admin)',
    description:
      'Clears deletedAt so the banner shows again in CMS and on the website if active.',
  })
  @ApiOkResponse({ type: HomeBanner })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Home banner restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete home banner (CMS / super-admin)',
    description: 'Sets deletedAt. Hidden from CMS lists and the website.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Home banner deleted successfully',
    };
  }

  private toHomeBannerFiles(
    files?: HomeBannerUploadedFiles,
  ): HomeBannerFiles {
    return {
      bannerImage: files?.bannerImage?.[0],
      mobileBannerImage: files?.mobileBannerImage?.[0],
      profileImage: files?.profileImage?.[0],
    };
  }
}
