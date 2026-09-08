import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/admin/auth/auth.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Super-admin JWT guard (global).
 *
 * - `@Public()` → skip auth (login, health, public forms, chatbot chat)
 * - Website GETs for published content stay open
 * - Admin GETs (users, leads list, donors list) + all mutations need Bearer JWT
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly auth: AuthService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const req = context.switchToHttp().getRequest<{
      method: string;
      originalUrl?: string;
      url?: string;
      headers: Record<string, string | undefined>;
      user?: unknown;
    }>();

    const method = (req.method || 'GET').toUpperCase();
    const raw = req.originalUrl || req.url || '';
    const path = raw.split('?')[0].replace(/^\/api/, '') || '/';

    // Admin-only reads (not for public site)
    const adminOnlyGet =
      method === 'GET' &&
      (this.matches(path, '/users') ||
        this.matches(path, '/auth/me') ||
        this.matches(path, '/leads-contact') ||
        this.matches(path, '/donors') ||
        this.matches(path, '/chatbot/reindex'));

    const needsAuth = method !== 'GET' || adminOnlyGet;

    if (!needsAuth) {
      return true;
    }

    const header = req.headers.authorization || req.headers.Authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Missing bearer token');
    }

    const payload = this.auth.verifyToken(header.slice(7).trim());
    req.user = payload;
    return true;
  }

  private matches(path: string, prefix: string): boolean {
    return path === prefix || path.startsWith(`${prefix}/`);
  }
}
