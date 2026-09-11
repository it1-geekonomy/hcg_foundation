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
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { CreateTeamDto } from './dto/create-team.dto';
import {
  CreateTeamMultipartDto,
  UpdateTeamMultipartDto,
} from './dto/team-multipart.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { Team } from './entities/team.entity';
import { TeamFiles, TeamUploadedFiles, TeamsService } from './teams.service';

@ApiTags('Teams')
@Controller('teams')
export class TeamsController {
  constructor(private readonly service: TeamsService) {}

  @Post()
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreateTeamMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'teamImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Create team member (CMS / super-admin)',
    description:
      'Send multipart form fields plus optional image file `teamImage`. CDN URL is stored on the row.',
  })
  @ApiCreatedResponse({ type: Team })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async create(
    @Body() dto: CreateTeamDto,
    @UploadedFiles()
    files?: TeamUploadedFiles,
  ) {
    const data = await this.service.create(dto, this.toTeamFiles(files));
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Team member created successfully',
      data,
    };
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List all team members (CMS)',
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
          ? 'No team members found'
          : 'Team members fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published')
  @ApiOperation({
    summary: 'List published team members (website)',
    description: 'Public. Only status=published. No token required.',
  })
  @ApiOkResponse({ description: 'Paginated published list' })
  async findPublished(@Query() query: PaginationQueryDto) {
    const result = await this.service.findPublished(query);
    return {
      statusCode: HttpStatus.OK,
      message:
        result.meta.total === 0
          ? 'No published team members found'
          : 'Published team members fetched successfully',
      ...result,
    };
  }

  @Public()
  @Get('published/slug/:slug')
  @ApiOperation({
    summary: 'Get published team member by slug (website)',
    description:
      'Public detail page. Use slug in the URL, e.g. /about-us/team/dr-john-smith',
  })
  @ApiOkResponse({ type: Team })
  async findPublishedBySlug(@Param('slug') slug: string) {
    const data = await this.service.findPublishedBySlug(slug);
    return {
      statusCode: HttpStatus.OK,
      message: 'Published team member fetched successfully',
      data,
    };
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get team member by id (CMS, any status)' })
  @ApiOkResponse({ type: Team })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    const data = await this.service.findOne(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team member fetched successfully',
      data,
    };
  }

  @Patch(':id')
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: UpdateTeamMultipartDto })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'teamImage', maxCount: 1 },
    ]),
  )
  @ApiOperation({
    summary: 'Update team member (CMS / super-admin)',
    description:
      'Optional new `teamImage` file replaces the previous CDN object.',
  })
  @ApiOkResponse({ type: Team })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTeamDto,
    @UploadedFiles()
    files?: TeamUploadedFiles,
  ) {
    const data = await this.service.update(id, dto, this.toTeamFiles(files));
    return {
      statusCode: HttpStatus.OK,
      message: 'Team member updated successfully',
      data,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete team member (CMS / super-admin)' })
  @ApiUnauthorizedResponse({
    description: 'Missing, invalid, or expired bearer token',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.service.remove(id);
    return {
      statusCode: HttpStatus.OK,
      message: 'Team member deleted successfully',
    };
  }

  private toTeamFiles(files?: TeamUploadedFiles): TeamFiles {
    return {
      teamImage: files?.teamImage?.[0],
    };
  }
}
