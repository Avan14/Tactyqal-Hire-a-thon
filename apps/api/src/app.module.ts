import { randomUUID } from 'node:crypto';
import { Module, RequestMethod } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { AdminAuthModule } from './common/admin-token.guard';
import { AllExceptionsFilter } from './common/all-exceptions.filter';
import { LeadsModule } from './leads/leads.module';
import { PostsModule } from './posts/posts.module';
import { SubscribersModule } from './subscribers/subscribers';
import { TaxonomyModule } from './taxonomy/taxonomy.module';
import { validateEnv } from './config/env.validation';
import { HealthController } from './health/health.controller';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    LoggerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const pretty = !['production', 'test'].includes(
          process.env.NODE_ENV ?? '',
        );
        return {
          // Express 5 path syntax; the library default ('*') triggers a warning.
          forRoutes: [{ path: '{*splat}', method: RequestMethod.ALL }],
          pinoHttp: {
            level: config.get<string>('LOG_LEVEL', 'info'),
            // Reuse an upstream request id when present so logs can be correlated.
            genReqId: (req, res) => {
              const incoming = req.headers['x-request-id'];
              const id =
                typeof incoming === 'string' && incoming
                  ? incoming
                  : randomUUID();
              res.setHeader('x-request-id', id);
              return id;
            },
            redact: ['req.headers.authorization', 'req.headers.cookie'],
            transport: pretty
              ? { target: 'pino-pretty', options: { singleLine: true } }
              : undefined,
          },
        };
      },
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 120 }]),
    PrismaModule,
    AdminAuthModule,
    PostsModule,
    TaxonomyModule,
    LeadsModule,
    SubscribersModule,
  ],
  controllers: [HealthController],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
