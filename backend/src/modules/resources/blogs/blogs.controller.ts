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
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { Blog } from './entities/blog.entity';
import { BlogsService } from './blogs.service';

@ApiTags('Resources · Blogs')
@Controller('blogs')
export class BlogsController {
  constructor(private readonly service: BlogsService) {}

  @Post()
  @ApiOperation({ summary: 'Create Blog' })
  @ApiCreatedResponse({ type: Blog })
  create(@Body() dto: CreateBlogDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List blogs' })
  @ApiOkResponse({ description: 'Paginated list' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get Blog by id' })
  @ApiOkResponse({ type: Blog })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update Blog' })
  @ApiOkResponse({ type: Blog })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateBlogDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete Blog' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
