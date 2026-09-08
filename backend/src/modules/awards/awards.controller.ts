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
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateAwardDto } from './dto/create-award.dto';
import { UpdateAwardDto } from './dto/update-award.dto';
import { Award } from './entities/award.entity';
import { AwardsService } from './awards.service';

@ApiTags('About · Awards')
@Controller('awards')
export class AwardsController {
  constructor(private readonly service: AwardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Award' })
  @ApiCreatedResponse({ type: Award })
  create(@Body() dto: CreateAwardDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List awards' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Award by id' })
  @ApiOkResponse({ type: Award })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Award' })
  @ApiOkResponse({ type: Award })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAwardDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Award' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
