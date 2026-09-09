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
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreatePatientStoryDto } from './dto/create-patient-story.dto';
import { UpdatePatientStoryDto } from './dto/update-patient-story.dto';
import { PatientStory } from './entities/patient-story.entity';
import { PatientStoriesService } from './patient-stories.service';

@ApiTags('Patient Stories')
@Controller('patient-stories')
export class PatientStoriesController {
  constructor(private readonly service: PatientStoriesService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create patient story (super-admin)' })
  @ApiCreatedResponse({ type: PatientStory })
  create(@Body() dto: CreatePatientStoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'List patient stories',
    description: 'Supports pagination, search, and status filter',
  })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get patient story by slug' })
  @ApiOkResponse({ type: PatientStory })
  findBySlug(@Param('slug') slug: string) {
    return this.service.findBySlug(slug);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get patient story by id' })
  @ApiOkResponse({ type: PatientStory })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update patient story (super-admin)' })
  @ApiOkResponse({ type: PatientStory })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientStoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete patient story (super-admin)' })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
