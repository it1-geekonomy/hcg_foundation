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
import { CreateTrusteeDto } from './dto/create-trustee.dto';
import { UpdateTrusteeDto } from './dto/update-trustee.dto';
import { Trustee } from './entities/trustee.entity';
import { TrusteesService } from './trustees.service';

@ApiTags('About · Trustees')
@Controller('trustees')
export class TrusteesController {
  constructor(private readonly service: TrusteesService) {}

  @Post()
  @ApiOperation({ summary: 'Create Trustee' })
  @ApiCreatedResponse({ type: Trustee })
  create(@Body() dto: CreateTrusteeDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List trustees' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Trustee by id' })
  @ApiOkResponse({ type: Trustee })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Trustee' })
  @ApiOkResponse({ type: Trustee })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTrusteeDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Trustee' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
