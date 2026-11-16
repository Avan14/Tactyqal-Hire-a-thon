import {
  CanActivate,
  ExecutionContext,
  Global,
  Injectable,
  Module,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/**
 * Admin access is a single bearer token from the environment.
 * Deliberately small: the brief asks for a blog backend, not user accounts.
 * Hashing both sides gives equal-length buffers, so the comparison is
 * constant-time whatever the length of the submitted token.
 */
@Injectable()
export class AdminAuthService {
  private readonly expected: Buffer;

  constructor(config: ConfigService) {
    this.expected = digest(config.getOrThrow<string>('ADMIN_API_TOKEN'));
  }

  /** True when the request carries the admin token. Never throws. */
  isAdmin(request: Request): boolean {
    const [scheme, token] = (request.headers.authorization ?? '').split(' ');
    return (
      scheme === 'Bearer' &&
      !!token &&
      timingSafeEqual(digest(token), this.expected)
    );
  }
}

/** Guard for write endpoints. */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  constructor(private readonly auth: AdminAuthService) {}

  canActivate(context: ExecutionContext): boolean {
    if (!this.auth.isAdmin(context.switchToHttp().getRequest<Request>())) {
      throw new UnauthorizedException('A valid admin token is required');
    }
    return true;
  }
}

@Global()
@Module({
  providers: [AdminAuthService, AdminTokenGuard],
  exports: [AdminAuthService, AdminTokenGuard],
})
export class AdminAuthModule {}

function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}
