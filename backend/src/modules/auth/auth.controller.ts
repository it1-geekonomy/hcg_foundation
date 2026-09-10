import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Super-admin login (email or username + password)',
  })
  @ApiBody({
    type: LoginDto,
    examples: {
      email: {
        summary: 'Login with email',
        value: {
          identifier: 'kishan10@gmail.com',
          password: 'password@123',
        },
      },
      username: {
        summary: 'Login with username',
        value: {
          identifier: 'kishan10',
          password: 'password@123',
        },
      },
    },
  })
  @ApiOkResponse({ description: 'Access token + user' })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials' })
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout (client discards token)' })
  logout() {
    return this.auth.logout();
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Current authenticated super-admin' })
  me(
    @Req()
    req: {
      user?: {
        sub: string;
        email: string;
        username: string;
        fullName: string;
      };
      headers: { authorization?: string };
    },
  ) {
    if (req.user) {
      return {
        id: req.user.sub,
        email: req.user.email,
        username: req.user.username,
        fullName: req.user.fullName,
      };
    }
    const header = req.headers.authorization;
    const token = header?.startsWith('Bearer ')
      ? header.slice(7).trim()
      : '';
    return this.auth.me(token);
  }
}
