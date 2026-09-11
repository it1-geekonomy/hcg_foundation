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
import { CreateFundraisingCampaignDto } from './dto/create-fundraising-campaign.dto';
import { ListFundraisingCampaignsQueryDto } from './dto/list-fundraising-campaigns-query.dto';
import { UpdateFundraisingCampaignDto } from './dto/update-fundraising-campaign.dto';
import { FundraisingCampaign } from './entities/fundraising-campaign.entity';
import { FundraisingCampaignsService } from './fundraising-campaigns.service';

@ApiTags('Fundraising Campaigns')
@Controller('fundraising-campaigns')
export class FundraisingCampaignsController {
  constructor(private readonly service: FundraisingCampaignsService) {}

  @Public()
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Submit a fundraising campaign application (Public website)',
    description:
      'Submitted from the "Start a Fundraising Campaign" modal. Accessible publicly without authentication.',
  })
  @ApiCreatedResponse({
    type: FundraisingCampaign,
    description: 'Application submitted successfully',
  })
  async create(@Body() dto: CreateFundraisingCampaignDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Fundraising campaign application submitted successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List fundraising campaigns (CMS / Admin)',
    description:
      'Paginated list of all fundraising campaign submissions with optional search and status filtering. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Paginated CMS list' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findAll(@Query() query: ListFundraisingCampaignsQueryDto) {
    const result = await this.service.findAll(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No fundraising campaigns found'
          : 'Fundraising campaigns fetched successfully',
      ...result,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Get fundraising campaign details by ID (CMS / Admin)',
    description: 'Retrieve full application details. Requires Bearer token.',
  })
  @ApiOkResponse({ type: FundraisingCampaign })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Fundraising campaign fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update fundraising campaign (CMS / Admin)',
    description:
      'Update status (e.g. approved, rejected, completed) or application details. Requires Bearer token.',
  })
  @ApiOkResponse({ type: FundraisingCampaign })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFundraisingCampaignDto,
  ) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Fundraising campaign updated successfully',
      data,
    };
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Delete fundraising campaign (CMS / Admin)',
    description: 'Permanently remove a campaign application. Requires Bearer token.',
  })
  @ApiOkResponse({ description: 'Campaign application deleted successfully' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Fundraising campaign deleted successfully',
    };
  }
}
