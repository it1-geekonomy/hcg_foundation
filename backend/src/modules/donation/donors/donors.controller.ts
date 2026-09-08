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
import { CreateDonorDto } from './dto/create-donor.dto';
import { UpdateDonorDto } from './dto/update-donor.dto';
import { Donor } from './entities/donor.entity';
import { DonorsService } from './donors.service';

@ApiTags('Donation · Donors')
@Controller('donors')
export class DonorsController {
  constructor(private readonly service: DonorsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Donor' })
  @ApiCreatedResponse({ type: Donor })
  create(@Body() dto: CreateDonorDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List donors' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Donor by id' })
  @ApiOkResponse({ type: Donor })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Donor' })
  @ApiOkResponse({ type: Donor })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDonorDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Donor' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
