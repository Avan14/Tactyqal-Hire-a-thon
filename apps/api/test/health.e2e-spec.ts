import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp } from './utils';

describe('Health and error envelope (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /api/health reports the database as up', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .expect(200);
    expect(res.body).toMatchObject({ status: 'ok', database: 'up' });
  });

  it('returns a request id header that echoes the caller-supplied one', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/health')
      .set('X-Request-Id', 'trace-123')
      .expect(200);
    expect(res.headers['x-request-id']).toBe('trace-123');
  });

  it('does not rate-limit public reads, which the web server makes for every visitor', async () => {
    const server = app.getHttpServer();
    for (let i = 0; i < 130; i++) {
      await request(server).get('/api/v1/categories').expect(200);
    }
    await request(server).get('/api/v1/posts').expect(200);
  });

  it('unknown routes use the standard error envelope', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/nope')
      .expect(404);
    expect(res.body.error).toMatchObject({ code: 'NOT_FOUND' });
    expect(typeof res.body.error.requestId).toBe('string');
  });
});
