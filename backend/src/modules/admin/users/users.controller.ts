import {
  Body,
  ClassSerializerInterceptor,
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
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationQueryDto } from '../../../common/dto/pagination-query.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersService } from './users.service';

@ApiTags('Admin · Users')
@ApiBearerAuth()
@UseInterceptors(ClassSerializerInterceptor)
@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @ApiOperation({
    summary: 'Create admin user',
    description:
      'Send plain `password` only. Server stores a hash. Do not send passwordHash, role, or isActive.',
  })
  @ApiBody({
    type: CreateUserDto,
    examples: {
      default: {
        summary: 'Create user',
        value: {
          fullName: 'Kishan',
          email: 'kishan10@gmail.com',
          username: 'kishan10',
          password: 'password@123',
        },
      },
      withSlug: {
        summary: 'Create user with slug',
        value: {
          fullName: 'Kishan',
          slug: 'kishan-10',
          email: 'kishan10@gmail.com',
          username: 'kishan10',
          password: 'password@123',
        },
      },
    },
  })
  @ApiCreatedResponse({ type: User })
  create(@Body() dto: CreateUserDto) {
    return this.service.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @ApiOkResponse({ description: 'Paginated list (password hash excluded)' })
  findAll(@Query() query: PaginationQueryDto) {
    return this.service.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by id' })
  @ApiOkResponse({ type: User })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update user' })
  @ApiBody({
    type: UpdateUserDto,
    examples: {
      default: {
        summary: 'Update name / email',
        value: {
          fullName: 'Kishan Updated',
          email: 'kishan10@gmail.com',
        },
      },
      password: {
        summary: 'Reset password',
        value: {
          password: 'password@123',
        },
      },
    },
  })
  @ApiOkResponse({ type: User })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete user by id' })
  @ApiNoContentResponse()
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
