import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, resetDatabase } from './utils';

describe('Newsletter subscribers (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('subscribes an email, normalising case and whitespace', async () => {
    const res = await http()
      .post('/api/v1/subscribers')
      .send({ email: '  Asha@Example.com ' })
      .expect(202);
    expect(res.body).toEqual({ status: 'subscribed' });
    const rows = await prisma.subscriber.findMany();
    expect(rows.map((r) => r.email)).toEqual(['asha@example.com']);
  });

  it('answers identically for an existing email and stores it once', async () => {
    await http()
      .post('/api/v1/subscribers')
      .send({ email: 'asha@example.com' })
      .expect(202);
    const res = await http()
      .post('/api/v1/subscribers')
      .send({ email: 'ASHA@example.com' })
      .expect(202);
    expect(res.body).toEqual({ status: 'subscribed' });
    expect(await prisma.subscriber.count()).toBe(1);
  });

  it('rejects an invalid email', async () => {
    const res = await http()
      .post('/api/v1/subscribers')
      .send({ email: 'nope' })
      .expect(400);
    expect(res.body.error.details[0].field).toBe('email');
  });
});
