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
import { CreateLeadContactDto } from './dto/create-lead-contact.dto';
import { UpdateLeadContactDto } from './dto/update-lead-contact.dto';
import { LeadContact } from './entities/lead-contact.entity';
import { LeadsContactService } from './leads-contact.service';

@ApiTags('Contact · Leads')
@Controller('leads-contact')
export class LeadsContactController {
  constructor(private readonly service: LeadsContactService) {}

  @Post()
  @ApiOperation({ summary: 'Create LeadContact' })
  @ApiCreatedResponse({ type: LeadContact })
  create(@Body() dto: CreateLeadContactDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List leads_contact' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get LeadContact by id' })
  @ApiOkResponse({ type: LeadContact })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update LeadContact' })
  @ApiOkResponse({ type: LeadContact })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateLeadContactDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete LeadContact' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
