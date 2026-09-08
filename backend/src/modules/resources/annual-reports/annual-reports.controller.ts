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
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateAnnualReportDto } from './dto/create-annual-report.dto';
import { UpdateAnnualReportDto } from './dto/update-annual-report.dto';
import { AnnualReport } from './entities/annual-report.entity';
import { AnnualReportsService } from './annual-reports.service';

const reportUploadFields = FileFieldsInterceptor(
  [
    { name: 'banner', maxCount: 1 },
    { name: 'file', maxCount: 1 },
  ],
  {
    storage: memoryStorage(),
    limits: { fileSize: 25 * 1024 * 1024 },
  },
);

@ApiTags('Resources · Annual Reports')
@Controller('annual-reports')
export class AnnualReportsController {
  constructor(private readonly service: AnnualReportsService) {}

  @Post()
  @ApiOperation({
    summary: 'Create AnnualReport (banner + file uploaded to R2 CDN)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['title', 'slug'],
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        reportYear: { type: 'string', example: '2024-25' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        schemaCode: { type: 'string' },
        banner: { type: 'string', format: 'binary' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiCreatedResponse({ type: AnnualReport })
  @UseInterceptors(reportUploadFields)
  create(
    @Body() dto: CreateAnnualReportDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    return this.service.create(dto, {
      banner: files?.banner?.[0],
      file: files?.file?.[0],
    });
  }

  @Get()
  @ApiOperation({ summary: 'List annual_reports (R2 URLs in response)' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get AnnualReport by slug' })
  @ApiOkResponse({ type: AnnualReport })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get AnnualReport by id' })
  @ApiOkResponse({ type: AnnualReport })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update AnnualReport (optional new banner/file → R2)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        slug: { type: 'string' },
        reportYear: { type: 'string' },
        status: { type: 'string', enum: ['draft', 'published', 'archived'] },
        metaTitle: { type: 'string' },
        metaDescription: { type: 'string' },
        schemaCode: { type: 'string' },
        banner: { type: 'string', format: 'binary' },
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @ApiOkResponse({ type: AnnualReport })
  @UseInterceptors(reportUploadFields)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAnnualReportDto,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      file?: Express.Multer.File[];
    },
  ) {
    return this.service.update(id, dto, {
      banner: files?.banner?.[0],
      file: files?.file?.[0],
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete AnnualReport and R2 objects' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
