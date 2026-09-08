import { createHmac, timingSafeEqual } from 'crypto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';

type TokenPayload = {
  sub: string;
  email: string;
  username: string;
  fullName: string;
  exp: number;
};

@Injectable()
export class AuthService {
  private readonly secret: string;
  private readonly ttlSeconds: number;

  constructor(
    private readonly users: UsersService,
    private readonly config: ConfigService,
  ) {
    this.secret =
      this.config.get<string>('auth.jwtSecret') ||
      'hcg-dev-secret-change-me';
    this.ttlSeconds =
      this.config.get<number>('auth.jwtExpiresInSeconds') || 60 * 60 * 24 * 7;
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByLogin(dto.identifier);
    if (!user || !this.users.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email/username or password');
    }

    const safe = this.users.toSafeUser(user);
    const accessToken = this.signToken({
      sub: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      exp: Math.floor(Date.now() / 1000) + this.ttlSeconds,
    });

    return {
      accessToken,
      tokenType: 'Bearer',
      expiresIn: this.ttlSeconds,
      user: safe,
    };
  }

  logout() {
    return { success: true };
  }

  me(token: string) {
    const payload = this.verifyToken(token);
    return {
      id: payload.sub,
      email: payload.email,
      username: payload.username,
      fullName: payload.fullName,
    };
  }

  verifyToken(token: string): TokenPayload {
    const [body, sig] = token.split('.');
    if (!body || !sig) {
      throw new UnauthorizedException('Invalid token');
    }

    const expected = this.sign(body);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) {
      throw new UnauthorizedException('Invalid token');
    }

    let payload: TokenPayload;
    try {
      payload = JSON.parse(
        Buffer.from(body, 'base64url').toString('utf8'),
      ) as TokenPayload;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }

    if (!payload?.sub || !payload.exp || payload.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  private signToken(payload: TokenPayload): string {
    const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${body}.${this.sign(body)}`;
  }

  private sign(body: string): string {
    return createHmac('sha256', this.secret).update(body).digest('base64url');
  }
}
