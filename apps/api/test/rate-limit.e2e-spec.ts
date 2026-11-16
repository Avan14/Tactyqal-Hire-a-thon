import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { createTestApp, resetDatabase } from './utils';

/**
 * The web server calls the API for every visitor, so the API must rate
 * limit by the visitor's IP. It trusts the X-Client-IP header only from a
 * caller that also presents the shared internal secret.
 */
describe('Per-visitor rate limiting (e2e)', () => {
  let app: INestApplication;
  const SECRET = process.env.INTERNAL_API_SECRET ?? '';
  const LIMIT = 5; // subscribers: 5 per minute

  beforeEach(async () => {
    app = await createTestApp(); // fresh in-memory buckets for every test
    await resetDatabase(app);
  });

  afterEach(async () => {
    await app.close();
  });

  const subscribe = (n: number, headers: Record<string, string>) =>
    request(app.getHttpServer())
      .post('/api/v1/subscribers')
      .set(headers)
      .send({ email: `reader${n}@example.com` });

  it('ignores X-Client-IP without the internal secret', async () => {
    expect(SECRET.length).toBeGreaterThanOrEqual(16);
    for (let i = 0; i < LIMIT; i++) {
      await subscribe(i, { 'X-Client-IP': `203.0.113.${i}` }).expect(202);
    }
    await subscribe(99, { 'X-Client-IP': '198.51.100.7' }).expect(429);
  });

  it('ignores X-Client-IP with a wrong secret', async () => {
    for (let i = 0; i < LIMIT; i++) {
      await subscribe(i, {
        'X-Client-IP': `203.0.113.${i}`,
        'X-Internal-Secret': 'wrong-secret-of-enough-length',
      }).expect(202);
    }
    await subscribe(99, {
      'X-Client-IP': '198.51.100.7',
      'X-Internal-Secret': 'wrong-secret-of-enough-length',
    }).expect(429);
  });

  it('gives each visitor their own bucket when the secret matches', async () => {
    const visitor = (ip: string) => ({
      'X-Client-IP': ip,
      'X-Internal-Secret': SECRET,
    });
    for (let i = 0; i < LIMIT; i++) {
      await subscribe(i, visitor('203.0.113.10')).expect(202);
    }
    await subscribe(50, visitor('203.0.113.10')).expect(429);
    await subscribe(51, visitor('198.51.100.7')).expect(202);
  });
});
