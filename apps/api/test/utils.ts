import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { configureApp } from '../src/app.setup';
import { PrismaService } from '../src/prisma/prisma.service';

export const ADMIN_TOKEN = process.env.ADMIN_API_TOKEN ?? '';
export const auth = { Authorization: `Bearer ${ADMIN_TOKEN}` };

export async function createTestApp(): Promise<INestApplication> {
  if (!process.env.DATABASE_URL?.includes('_test')) {
    throw new Error('e2e tests must run against the test database (.env.test)');
  }
  const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
  const app = moduleRef.createNestApplication({ bufferLogs: true });
  configureApp(app);
  await app.init();
  return app;
}

/** Empties every table between tests. Only ever runs against the test database. */
export async function resetDatabase(app: INestApplication) {
  const prisma = app.get(PrismaService);
  await prisma.$executeRawUnsafe(
    'TRUNCATE TABLE "posts", "authors", "categories", "tags", "leads", "_CategoryToPost", "_PostToTag" RESTART IDENTITY CASCADE',
  );
}
