import {
  BadRequestException,
  INestApplication,
  PayloadTooLargeException,
  VersioningType,
} from '@nestjs/common';
import type { NestExpressApplication } from '@nestjs/platform-express';
import type { NextFunction, Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { Logger } from 'nestjs-pino';
import { createValidationPipe } from './common/validation';

export const JSON_BODY_LIMIT = '1mb';

function bodyParserErrors(
  err: { type?: string } | undefined,
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  if (err?.type === 'entity.parse.failed') {
    return next(new BadRequestException('Request body is not valid JSON'));
  }
  if (err?.type === 'entity.too.large') {
    return next(
      new PayloadTooLargeException(
        `Request body is larger than ${JSON_BODY_LIMIT}`,
      ),
    );
  }
  next(err);
}

/**
 * Applies the HTTP pipeline. Shared by main.ts and the e2e tests so tests
 * exercise exactly what production runs.
 */
export function configureApp(app: INestApplication) {
  const config = app.get(ConfigService);
  const express = app as NestExpressApplication;

  app.useLogger(app.get(Logger));
  express.set('trust proxy', config.get<string>('TRUST_PROXY', 'loopback'));

  // Post bodies may be up to 500,000 characters (see CreatePostDto), well
  // past Express's 100 KB default. Registered before init, so Nest skips its
  // own parser. Parser failures become HTTP errors in the standard shape.
  express.useBodyParser('json', { limit: JSON_BODY_LIMIT });
  express.use(bodyParserErrors);

  app.use(helmet());
  app.enableCors({
    origin: config
      .get<string>('CORS_ORIGINS', '')
      .split(',')
      .map((o) => o.trim())
      .filter(Boolean),
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
  });
  app.setGlobalPrefix('api');
  app.enableVersioning({ type: VersioningType.URI, defaultVersion: '1' });
  app.useGlobalPipes(createValidationPipe());
  app.enableShutdownHooks();

  const openApi = new DocumentBuilder()
    .setTitle('Tactyqal Blog API')
    .setDescription(
      'Blog platform API replacing the WordPress blog. Reads are public; writes need the admin bearer token.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup(
    'api/docs',
    app,
    SwaggerModule.createDocument(app, openApi),
  );

  return app;
}
