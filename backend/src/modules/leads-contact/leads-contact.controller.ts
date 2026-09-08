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
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateLeadContactDto } from './dto/create-lead-contact.dto';
import { UpdateLeadContactDto } from './dto/update-lead-contact.dto';
import { LeadContact } from './entities/lead-contact.entity';
import { LeadsContactService } from './leads-contact.service';

@ApiTags('Contact · Leads')
@Controller('leads-contact')
export class LeadsContactController {
  constructor(private readonly service: LeadsContactService) {}

  @Public()
  @Post()
  @ApiOperation({ summary: 'Submit contact lead (public form)' })
  @ApiCreatedResponse({ type: LeadContact })
  create(@Body() dto: CreateLeadContactDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List leads (super-admin)' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get LeadContact by id (super-admin)' })
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
