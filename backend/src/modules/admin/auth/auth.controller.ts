import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Admin login (email or username + password)',
    description:
      'Use the same email/username and plain password from POST /api/users.',
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
  @ApiOperation({ summary: 'Current authenticated user' })
  me(@Headers('authorization') authorization?: string) {
    const token = this.extractBearer(authorization);
    return this.auth.me(token);
  }

  private extractBearer(authorization?: string): string {
    if (!authorization?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }
    return authorization.slice(7).trim();
  }
}
