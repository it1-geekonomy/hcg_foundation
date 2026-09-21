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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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
import { CdnFile } from '../../common/storage/cdn.service';
import { CreateLeadsInternshipDto } from './dto/create-leads-internship.dto';
import {
  CreateLeadsInternshipMultipartDto,
  UpdateLeadsInternshipMultipartDto,
} from './dto/leads-internship-multipart.dto';
import { UpdateLeadsInternshipDto } from './dto/update-leads-internship.dto';
import { LeadsInternship } from './entities/leads-internship.entity';
import  { LeadsInternshipService } from './leads-internship.service';

@ApiTags('Leads Internship')
@Controller('leads-internship')
export class LeadsInternshipController {
  constructor(private readonly service: LeadsInternshipService) {}

  @Public()
  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateLeadsInternshipMultipartDto })
  @UseInterceptors(FileInterceptor('cv'))
  @ApiOperation({
    summary: 'Submit internship lead (website)',
    description: 'Public endpoint for website internship form submissions. Requires a CV file upload.',
  })
  @ApiCreatedResponse({ type: LeadsInternship })
  async create(
    @Body() dto: CreateLeadsInternshipDto,
    @UploadedFile() file?: CdnFile,
  ) {
    const data = await this.service.create(dto, file);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Internship lead submitted successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all internship leads (CMS)',
    description: 'Returns all internship leads. Requires Bearer token.',
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
          ? 'No internship leads found'
          : 'Internship leads fetched successfully',
      ...result,
    };
  }

  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List recently deleted internship leads (CMS trash)',
    description:
      'Soft-deleted leads only, newest first. Restore with POST /leads-internship/:id/restore.',
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
          ? 'No deleted internship leads found'
          : 'Deleted internship leads fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get internship lead by id (CMS)' })
  @ApiOkResponse({ type: LeadsInternship })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Internship lead fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateLeadsInternshipMultipartDto })
  @UseInterceptors(FileInterceptor('cv'))
  @ApiOperation({ summary: 'Update internship lead (CMS)' })
  @ApiOkResponse({ type: LeadsInternship })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadsInternshipDto,
    @UploadedFile() file?: CdnFile,
  ) {
    const data = await this.service.update(id, dto, file);
    return {
      statusCode: HttpStatus.OK,
      message: 'Internship lead updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted internship lead (CMS)',
    description: 'Clears deletedAt so the lead shows again in the CMS inbox.',
  })
  @ApiOkResponse({ type: LeadsInternship })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Internship lead restored successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete internship lead (CMS)',
    description: 'Sets deletedAt. Hidden from the CMS inbox.',
  })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Internship lead deleted successfully',
    };
  }
}
