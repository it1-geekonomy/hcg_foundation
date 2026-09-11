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
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CreatePartnershipInquiryDto } from './dto/create-partnership-inquiry.dto';
import { ListPartnershipInquiriesQueryDto } from './dto/list-partnership-inquiries-query.dto';
import { UpdatePartnershipInquiryDto } from './dto/update-partnership-inquiry.dto';
import { PartnershipInquiry } from './entities/partnership-inquiry.entity';
import { PartnershipInquiriesService } from './partnership-inquiries.service';

@ApiTags('Partnership Inquiries')
@Controller('partnership-inquiries')
export class PartnershipInquiriesController {
  constructor(private readonly service: PartnershipInquiriesService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit partnership inquiry (Public website)',
    description:
      'Submitted from the "Be a Part of Someone\'s Cancer Journey" modal. Publicly accessible without authentication.',
  })
  @ApiCreatedResponse({
    type: PartnershipInquiry,
    description: 'Inquiry submitted successfully',
  })
  async create(@Body() dto: CreatePartnershipInquiryDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Partnership inquiry submitted successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List partnership inquiries (CMS / Admin)',
    description:
      'Paginated list of all partnership inquiries with optional search and status filtering. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: ListPartnershipInquiriesQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No partnership inquiries found'
          : 'Partnership inquiries fetched successfully',
      ...result,
    };
  }

  @Get('deleted')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List recently deleted partnership inquiries (CMS trash)',
    description:
      'Soft-deleted inquiries only, newest first. Restore with POST /partnership-inquiries/:id/restore.',
  })
  @ApiOkResponse({ description: 'Paginated trash list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findDeleted(@Query() query: ListPartnershipInquiriesQueryDto) {
    const result = await this.service.findDeleted(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No deleted partnership inquiries found'
          : 'Deleted partnership inquiries fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get partnership inquiry details by ID (CMS / Admin)',
    description: 'Retrieve full inquiry details. Requires Bearer token.',
  })
  @ApiOkResponse({ type: PartnershipInquiry })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Partnership inquiry fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update partnership inquiry (CMS / Admin)',
    description:
      'Update status (e.g. in_review, contacted, resolved, rejected) or inquiry details. Requires Bearer token.',
  })
  @ApiOkResponse({ type: PartnershipInquiry })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePartnershipInquiryDto,
  ) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Partnership inquiry updated successfully',
      data,
    };
  }

  @Post(':id/restore')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Restore soft-deleted partnership inquiry (CMS / Admin)',
    description: 'Clears deletedAt so the inquiry shows again in CMS.',
  })
  @ApiOkResponse({ type: PartnershipInquiry })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async restore(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.restore(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Partnership inquiry restored successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Soft-delete partnership inquiry (CMS / Admin)',
    description:
      'Sets deletedAt. The row stays in the database and is hidden from list/get. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Inquiry deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Partnership inquiry deleted successfully',
    };
  }
}
