import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import {
  InjectThrottlerOptions,
  InjectThrottlerStorage,
  ThrottlerGuard,
  type ThrottlerModuleOptions,
  type ThrottlerStorage,
} from '@nestjs/throttler';
import { isIP } from 'node:net';
import { digest, matchesDigest } from './secrets';

export const CLIENT_IP_HEADER = 'x-client-ip';
export const INTERNAL_SECRET_HEADER = 'x-internal-secret';

/**
 * Rate limits per visitor, not per web server.
 *
 * The site calls the API from its own server, so every request arrives from
 * the web server's address. When the web server presents the shared
 * INTERNAL_API_SECRET, the visitor IP it sends in X-Client-IP is used as the
 * rate-limit key. Without the secret the header is ignored, so callers
 * cannot dodge limits by inventing addresses.
 */
@Injectable()
export class ClientIpThrottlerGuard extends ThrottlerGuard {
  private readonly secret?: Buffer;

  constructor(
    @InjectThrottlerOptions() options: ThrottlerModuleOptions,
    @InjectThrottlerStorage() storage: ThrottlerStorage,
    reflector: Reflector,
    config: ConfigService,
  ) {
    super(options, storage, reflector);
    const secret = config.get<string>('INTERNAL_API_SECRET');
    this.secret = secret ? digest(secret) : undefined;
  }

  protected override async getTracker(
    req: Record<string, any>,
  ): Promise<string> {
    const headers = (req.headers ?? {}) as Record<string, unknown>;
    const presented = headers[INTERNAL_SECRET_HEADER];
    const clientIp = headers[CLIENT_IP_HEADER];
    if (
      this.secret &&
      typeof presented === 'string' &&
      matchesDigest(presented, this.secret) &&
      typeof clientIp === 'string' &&
      isIP(clientIp)
    ) {
      return super.getTracker({ ip: clientIp });
    }
    return super.getTracker(req);
  }
}
