import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseEnumPipe,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { LegalPageType } from '../../../common/enums/legal-page-type.enum';
import { CreateLegalPageDto } from './dto/create-legal-page.dto';
import { ListLegalPagesQueryDto } from './dto/list-legal-pages-query.dto';
import { UpdateLegalPageDto } from './dto/update-legal-page.dto';
import { LegalPage } from './entities/legal-page.entity';
import { LegalPagesService } from './legal-pages.service';

@ApiTags('Legal · Privacy & Terms')
@Controller('legal-pages')
export class LegalPagesController {
  constructor(private readonly service: LegalPagesService) {}

  @Post()
  @ApiOperation({ summary: 'Create legal page (privacy or terms)' })
  @ApiCreatedResponse({ type: LegalPage })
  create(@Body() dto: CreateLegalPageDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List legal pages' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: ListLegalPagesQueryDto) {
    return this.service.findAll(query);
  }

  @Get('published/:pageType')
  @ApiOperation({
    summary: 'Get latest published page by type (public)',
  })
  @ApiOkResponse({ type: LegalPage })
  findPublishedByType(
    @Param('pageType', new ParseEnumPipe(LegalPageType))
    pageType: LegalPageType,
  ) {
    return this.service.findPublishedByType(pageType);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get legal page by slug' })
  @ApiOkResponse({ type: LegalPage })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get legal page by id' })
  @ApiOkResponse({ type: LegalPage })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update legal page' })
  @ApiOkResponse({ type: LegalPage })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLegalPageDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete legal page' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
