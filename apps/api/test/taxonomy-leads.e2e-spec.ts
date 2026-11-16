import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { createTestApp, resetDatabase } from './utils';

describe('Taxonomy and leads (e2e)', () => {
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

  async function seed() {
    const author = await prisma.author.create({
      data: {
        name: 'Partha Chakraborty',
        slug: 'partha',
        bio: 'VC turned founder',
      },
    });
    const ideas = await prisma.category.create({
      data: { name: 'Startup business ideas', slug: 'startup-business-ideas' },
    });
    await prisma.category.create({ data: { name: 'Empty', slug: 'empty' } });
    const tag = await prisma.tag.create({
      data: { name: 'No-code', slug: 'no-code' },
    });

    const base = {
      contentHtml: '<p>Body</p>',
      authorId: author.id,
      categories: { connect: [{ id: ideas.id }] },
      tags: { connect: [{ id: tag.id }] },
    };
    await prisma.post.create({
      data: {
        ...base,
        slug: 'a',
        title: 'A',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-07-01'),
      },
    });
    await prisma.post.create({
      data: {
        ...base,
        slug: 'b',
        title: 'B',
        status: 'PUBLISHED',
        publishedAt: new Date('2025-07-02'),
      },
    });
    // Drafts must not be counted publicly.
    await prisma.post.create({
      data: { ...base, slug: 'c', title: 'C', status: 'DRAFT' },
    });
  }

  it('GET /api/v1/categories lists categories with published post counts', async () => {
    await seed();
    const res = await http().get('/api/v1/categories').expect(200);
    expect(res.body).toEqual([
      {
        name: 'Startup business ideas',
        slug: 'startup-business-ideas',
        postCount: 2,
      },
      { name: 'Empty', slug: 'empty', postCount: 0 },
    ]);
  });

  it('GET /api/v1/tags lists tags with published post counts', async () => {
    await seed();
    const res = await http().get('/api/v1/tags').expect(200);
    expect(res.body).toEqual([
      { name: 'No-code', slug: 'no-code', postCount: 2 },
    ]);
  });

  it('GET /api/v1/authors lists authors with bios and counts', async () => {
    await seed();
    const res = await http().get('/api/v1/authors').expect(200);
    expect(res.body).toEqual([
      {
        name: 'Partha Chakraborty',
        slug: 'partha',
        bio: 'VC turned founder',
        postCount: 2,
      },
    ]);
  });

  describe('POST /api/v1/leads', () => {
    const lead = {
      name: 'Asha Rao',
      email: 'asha@example.com',
      phone: '+91 98765 43210',
      message: 'My daughter wants to build an app for her school.',
    };

    it('stores a consultation request and returns only an id', async () => {
      const res = await http().post('/api/v1/leads').send(lead).expect(201);
      expect(Object.keys(res.body).sort()).toEqual(['createdAt', 'id']);

      const stored = await prisma.lead.findUniqueOrThrow({
        where: { id: res.body.id },
      });
      expect(stored).toMatchObject({ ...lead, source: 'homepage' });
    });

    it('rejects an invalid email and an empty message', async () => {
      const res = await http()
        .post('/api/v1/leads')
        .send({ ...lead, email: 'not-an-email', message: '' })
        .expect(400);
      const fields = res.body.error.details.map(
        (d: { field: string }) => d.field,
      );
      expect(fields).toEqual(expect.arrayContaining(['email', 'message']));
    });

    it('silently drops submissions that fill the hidden honeypot field', async () => {
      await http()
        .post('/api/v1/leads')
        .send({ ...lead, website: 'http://spam.example' })
        .expect(201);
      expect(await prisma.lead.count()).toBe(0);
    });
  });
});
