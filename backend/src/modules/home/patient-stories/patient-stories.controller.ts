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
import { CreatePatientStoryDto } from './dto/create-patient-story.dto';
import { UpdatePatientStoryDto } from './dto/update-patient-story.dto';
import { PatientStory } from './entities/patient-story.entity';
import { PatientStoriesService } from './patient-stories.service';

@ApiTags('Home · Patient Stories')
@Controller('patient-stories')
export class PatientStoriesController {
  constructor(private readonly service: PatientStoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create PatientStory' })
  @ApiCreatedResponse({ type: PatientStory })
  create(@Body() dto: CreatePatientStoryDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List patient_stories' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get PatientStory by id' })
  @ApiOkResponse({ type: PatientStory })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update PatientStory' })
  @ApiOkResponse({ type: PatientStory })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePatientStoryDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete PatientStory' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
