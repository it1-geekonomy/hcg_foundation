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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTermsAndConditionDto } from './dto/create-terms-and-condition.dto';
import { UpdateTermsAndConditionDto } from './dto/update-terms-and-condition.dto';
import { TermsAndCondition } from './entities/terms-and-condition.entity';
import { TermsAndConditionsService } from './terms-and-conditions.service';

@ApiTags('Terms and Conditions')
@Controller('terms-and-conditions')
export class TermsAndConditionsController {
  constructor(private readonly service: TermsAndConditionsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Create terms and conditions (CMS / super-admin)',
    description: 'Create new terms and conditions content.',
  })
  @ApiCreatedResponse({ type: TermsAndCondition })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(@Body() dto: CreateTermsAndConditionDto) {
    const data = await this.service.create(dto);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Terms and conditions created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all terms and conditions (CMS)',
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
          ? 'No terms and conditions found'
          : 'Terms and conditions fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'Get published terms and conditions (website)',
    description: 'Public. Returns the most recent published terms and conditions.',
  })
  @ApiOkResponse({ type: TermsAndCondition })
  async findPublished() {
    const data = await this.service.findPublished();
    if (!data) {
      return {
        statusCode: HttpStatus.OK,
        message: 'No published terms and conditions found',
        data: null,
      };
    }
    return {
      statusCode: HttpStatus.OK,
      message: 'Published terms and conditions fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get terms and conditions by id (CMS, any status)' })
  @ApiOkResponse({ type: TermsAndCondition })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Update terms and conditions (CMS / super-admin)',
  })
  @ApiOkResponse({ type: TermsAndCondition })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTermsAndConditionDto,
  ) {
    const data = await this.service.update(id, dto);
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete terms and conditions (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Terms and conditions deleted successfully',
    };
  }
}
