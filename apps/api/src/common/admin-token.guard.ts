import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash, timingSafeEqual } from 'node:crypto';
import type { Request } from 'express';

/**
 * Protects write endpoints with a single admin bearer token.
 * Deliberately small: the brief asks for a blog backend, not user accounts.
 * Hashing both sides gives equal-length buffers, so the comparison is
 * constant-time regardless of the submitted token's length.
 */
@Injectable()
export class AdminTokenGuard implements CanActivate {
  private readonly expected: Buffer;

  constructor(config: ConfigService) {
    this.expected = digest(config.getOrThrow<string>('ADMIN_API_TOKEN'));
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    if (!isAdmin(request, this.expected)) {
      throw new UnauthorizedException('A valid admin token is required');
    }
    return true;
  }
}

/** True when the request carries the admin bearer token. Never throws. */
export function isAdmin(request: Request, expected: Buffer): boolean {
  const header = request.headers.authorization ?? '';
  const [scheme, token] = header.split(' ');
  return scheme === 'Bearer' && !!token && timingSafeEqual(digest(token), expected);
}

export function digest(value: string): Buffer {
  return createHash('sha256').update(value).digest();
}
