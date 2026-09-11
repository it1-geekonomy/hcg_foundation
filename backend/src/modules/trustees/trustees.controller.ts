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
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import {
  CreateTrusteeMultipartDto,
  UpdateTrusteeMultipartDto,
} from './dto/trustee-multipart.dto';
import { UpdateTrusteeDto } from './dto/update-trustee.dto';
import { Trustee } from './entities/trustee.entity';
import {
  TrusteeFiles,
  TrusteeUploadedFiles,
  TrusteesService,
} from './trustees.service';

@ApiTags('Trustees')
@Controller('trustees')
export class TrusteesController {
  constructor(private readonly service: TrusteesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateTrusteeMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'trusteeImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create trustee (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image file `trusteeImage`. CDN URL is stored on the row.',
  })
  @ApiCreatedResponse({ type: Trustee })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateTrusteeDto,
    @UploadedFiles()
    files?: TrusteeUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toTrusteeFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Trustee created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all trustees (CMS)',
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
          ? 'No trustees found'
          : 'Trustees fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published trustees (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published trustees found'
          : 'Published trustees fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get trustee by id (CMS, any status)' })
  @ApiOkResponse({ type: Trustee })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Trustee fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateTrusteeMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'trusteeImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update trustee (CMS / super-admin)',
    description:
      'Optional new `trusteeImage` file replaces the previous CDN object.',
  })
  @ApiOkResponse({ type: Trustee })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrusteeDto,
    @UploadedFiles()
    files?: TrusteeUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toTrusteeFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Trustee updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete trustee (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Trustee deleted successfully',
    };
  }

  private toTrusteeFiles(files?: TrusteeUploadedFiles): TrusteeFiles {
    return {
      trusteeImage: files?.trusteeImage?.[0],
    };
  }
}
