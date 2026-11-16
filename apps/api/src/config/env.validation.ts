import { plainToInstance } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  MinLength,
  validateSync,
} from 'class-validator';

/** Fail fast at boot if configuration is missing or unsafe. */
class EnvironmentVariables {
  @IsString()
  DATABASE_URL!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT: number = 4000;

  @IsOptional()
  @IsString()
  CORS_ORIGINS: string = 'http://localhost:3000';

  @IsString()
  @MinLength(16, { message: 'ADMIN_API_TOKEN must be at least 16 characters' })
  @Matches(/^(?!change-me)/, {
    message:
      'ADMIN_API_TOKEN is still the .env.example placeholder; set a random value',
  })
  ADMIN_API_TOKEN!: string;

  @IsOptional()
  @IsIn(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
  LOG_LEVEL: string = 'info';

  /**
   * Express "trust proxy" setting. The web app calls the API server-side and
   * forwards the visitor's IP in X-Forwarded-For so rate limits stay per
   * visitor. 'loopback' trusts that header only from the same host.
   */
  @IsOptional()
  @IsString()
  TRUST_PROXY: string = 'loopback';

  /**
   * Shared with the web server. When it is set and presented in
   * X-Internal-Secret, the X-Client-IP header becomes the rate-limit key.
   * Needed when the web app and the API run on different hosts.
   */
  @IsOptional()
  @IsString()
  @MinLength(16, {
    message: 'INTERNAL_API_SECRET must be at least 16 characters',
  })
  INTERNAL_API_SECRET?: string;
}

export function validateEnv(config: Record<string, unknown>) {
  const env = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(env, { skipMissingProperties: false });
  if (errors.length > 0) {
    const details = errors
      .map((e) => Object.values(e.constraints ?? {}).join(', '))
      .join('; ');
    throw new Error(`Invalid environment configuration: ${details}`);
  }
  return env;
}
