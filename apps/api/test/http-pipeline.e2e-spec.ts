import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { auth, createTestApp, resetDatabase } from './utils';

describe('HTTP pipeline (e2e)', () => {
  let app: INestApplication;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(async () => {
    await resetDatabase(app);
  });

  afterAll(async () => {
    await app.close();
  });

  it('accepts a long post body (imported posts can exceed 100 KB)', async () => {
    const paragraph = `<p>${'Long-form startup idea text. '.repeat(40)}</p>`;
    const contentHtml = paragraph.repeat(250); // about 300 KB
    expect(contentHtml.length).toBeGreaterThan(250_000);

    const created = await http()
      .post('/api/v1/posts')
      .set(auth)
      .send({ title: 'A very long post', contentHtml })
      .expect(201);
    await http()
      .patch(`/api/v1/posts/${created.body.id}`)
      .set(auth)
      .send({ contentHtml: `${contentHtml}<p>One more line.</p>` })
      .expect(200);
  });

  it('answers malformed JSON with a 400 in the standard error shape', async () => {
    const res = await http()
      .post('/api/v1/leads')
      .set('Content-Type', 'application/json')
      .send('{"name": "Asha",')
      .expect(400);
    expect(res.body).toEqual({
      error: expect.objectContaining({
        code: 'BAD_REQUEST',
        message: 'Request body is not valid JSON',
      }),
    });
  });

  it('answers an oversized body with a 413 in the standard error shape', async () => {
    const res = await http()
      .post('/api/v1/posts')
      .set(auth)
      .send({ title: 'Too big', contentHtml: 'x'.repeat(1_200_000) })
      .expect(413);
    expect(res.body).toEqual({
      error: expect.objectContaining({ code: 'PAYLOAD_TOO_LARGE' }),
    });
  });
});
