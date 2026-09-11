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
import { CreatePatientTestimonialDto } from './dto/create-patient-testimonial.dto';
import {
  CreatePatientTestimonialMultipartDto,
  UpdatePatientTestimonialMultipartDto,
} from './dto/patient-testimonial-multipart.dto';
import { UpdatePatientTestimonialDto } from './dto/update-patient-testimonial.dto';
import { PatientTestimonial } from './entities/patient-testimonial.entity';
import {
  PatientTestimonialFiles,
  PatientTestimonialUploadedFiles,
  PatientTestimonialsService,
} from './patient-testimonials.service';

@ApiTags('Patient Testimonials')
@Controller('patient-testimonials')
export class PatientTestimonialsController {
  constructor(private readonly service: PatientTestimonialsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePatientTestimonialMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'patientTestimonialBanner', maxCount: 1 },
      { name: 'patientTestimonialMobileBanner', maxCount: 1 },
      { name: 'patientTestimonialFile', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create patient testimonial (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional files `patientTestimonialBanner`, `patientTestimonialMobileBanner`, and `patientTestimonialFile`. CDN URLs are stored on the row.',
  })
  @ApiCreatedResponse({ type: PatientTestimonial })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreatePatientTestimonialDto,
    @UploadedFiles()
    files?: PatientTestimonialUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toPatientTestimonialFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Patient testimonial created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all patient testimonials (CMS)',
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
          ? 'No patient testimonials found'
          : 'Patient testimonials fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published patient testimonials (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published patient testimonials found'
          : 'Published patient testimonials fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get patient testimonial by id (CMS, any status)' })
  @ApiOkResponse({ type: PatientTestimonial })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient testimonial fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdatePatientTestimonialMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'patientTestimonialBanner', maxCount: 1 },
      { name: 'patientTestimonialMobileBanner', maxCount: 1 },
      { name: 'patientTestimonialFile', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update patient testimonial (CMS / super-admin)',
    description:
      'Optional new `patientTestimonialBanner`, `patientTestimonialMobileBanner`, or `patientTestimonialFile` files replace the previous CDN objects.',
  })
  @ApiOkResponse({ type: PatientTestimonial })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientTestimonialDto,
    @UploadedFiles()
    files?: PatientTestimonialUploadedFiles,
  ) {
    const data = await this.service.update(
      id,
      dto,
      this.toPatientTestimonialFiles(files),
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient testimonial updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete patient testimonial (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Patient testimonial deleted successfully',
    };
  }

  private toPatientTestimonialFiles(
    files?: PatientTestimonialUploadedFiles,
  ): PatientTestimonialFiles {
    return {
      patientTestimonialBanner: files?.patientTestimonialBanner?.[0],
      patientTestimonialMobileBanner: files?.patientTestimonialMobileBanner?.[0],
      patientTestimonialFile: files?.patientTestimonialFile?.[0],
    };
  }
}
