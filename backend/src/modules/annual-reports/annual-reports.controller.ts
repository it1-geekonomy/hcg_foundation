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
import {
  AnnualReportFiles,
  AnnualReportUploadedFiles,
  AnnualReportsService,
} from './annual-reports.service';
import {
  CreateAnnualReportMultipartDto,
  UpdateAnnualReportMultipartDto,
} from './dto/annual-report-multipart.dto';
import { AnnualReportsQueryDto } from './dto/annual-reports-query.dto';
import { CreateAnnualReportDto } from './dto/create-annual-report.dto';
import { UpdateAnnualReportDto } from './dto/update-annual-report.dto';
import { AnnualReport } from './entities/annual-report.entity';

@ApiTags('Annual Reports')
@Controller('annual-reports')
export class AnnualReportsController {
  constructor(private readonly service: AnnualReportsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateAnnualReportMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'annualReportBanner', maxCount: 1 },
      { name: 'annualReportMobileBanner', maxCount: 1 },
      { name: 'annualReportFile', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create annual report (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional files: `annualReportBanner`, `annualReportMobileBanner`, and `annualReportFile` (PDF). CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: AnnualReport })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateAnnualReportDto,
    @UploadedFiles()
    files?: AnnualReportUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Annual report created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all annual reports (CMS)',
    description:
      'Returns draft, published, and archived. Optional status/search/reportYear filters. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: AnnualReportsQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No annual reports found'
          : 'Annual reports fetched successfully',
      ...result,
    };
  }

  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List recently deleted annual reports (CMS trash)',
    description:
      'Soft-deleted reports only, newest first. Restore with POST /annual-reports/:id/restore.',
  })
  @ApiOkResponse({ description: 'Paginated trash list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findDeleted(@Query() query: AnnualReportsQueryDto) {
    const result = await this.service.findDeleted(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No deleted annual reports found'
          : 'Deleted annual reports fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published annual reports (website)',
    description:
      'Public. Only status=published. Optional search and reportYear filter. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: AnnualReportsQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published annual reports found'
          : 'Published annual reports fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published annual report by slug (website)',
    description: 'Public detail page. Use slug in URL.',
  })
  @ApiOkResponse({ type: AnnualReport })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published annual report fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get annual report by id (CMS, any status)' })
  @ApiOkResponse({ type: AnnualReport })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Annual report fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateAnnualReportMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'annualReportBanner', maxCount: 1 },
      { name: 'annualReportMobileBanner', maxCount: 1 },
      { name: 'annualReportFile', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update annual report (CMS / super-admin)',
    description:
      'Optional new banner images or annual report file replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: AnnualReport })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnualReportDto,
    @UploadedFiles()
    files?: AnnualReportUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Annual report updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted annual report (CMS / super-admin)',
    description: 'Clears deletedAt so the report shows again in CMS and on the website if published.',
  })
  @ApiOkResponse({ type: AnnualReport })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Annual report restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete annual report (CMS / super-admin)',
    description: 'Sets deletedAt. Hidden from CMS lists and the website.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Annual report deleted successfully',
    };
  }

  private toFiles(files?: AnnualReportUploadedFiles): AnnualReportFiles {
    return {
      annualReportBanner: files?.annualReportBanner?.[0],
      annualReportMobileBanner: files?.annualReportMobileBanner?.[0],
      annualReportFile: files?.annualReportFile?.[0],
    };
  }
}
