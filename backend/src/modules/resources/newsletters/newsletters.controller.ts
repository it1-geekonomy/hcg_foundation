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
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateNewsletterDto } from './dto/create-newsletter.dto';
import { UpdateNewsletterDto } from './dto/update-newsletter.dto';
import { Newsletter } from './entities/newsletter.entity';
import { NewslettersService } from './newsletters.service';

@ApiTags('Resources · Newsletters')
@Controller('newsletters')
export class NewslettersController {
  constructor(private readonly service: NewslettersService) {}

  @Post()
  @ApiOperation({ summary: 'Create Newsletter' })
  @ApiCreatedResponse({ type: Newsletter })
  create(@Body() dto: CreateNewsletterDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List newsletters' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Newsletter by id' })
  @ApiOkResponse({ type: Newsletter })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Newsletter' })
  @ApiOkResponse({ type: Newsletter })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNewsletterDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Newsletter' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
