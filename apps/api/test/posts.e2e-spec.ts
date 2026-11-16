import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import { auth, createTestApp, resetDatabase } from './utils';

describe('Posts API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const http = () => request(app.getHttpServer());

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  beforeEach(async () => {
    await resetDatabase(app);
    await prisma.author.create({
      data: { name: 'Partha Chakraborty', slug: 'partha' },
    });
    await prisma.category.createMany({
      data: [
        { name: 'Startup business ideas', slug: 'startup-business-ideas' },
        { name: 'Problem Solving', slug: 'problem-solving' },
      ],
    });
    await prisma.tag.create({ data: { name: 'No-code', slug: 'no-code' } });
  });

  afterAll(async () => {
    await app.close();
  });

  const validPost = (overrides: Record<string, unknown> = {}) => ({
    title: '50 No-Code Startup Ideas',
    contentHtml: '<h2>Why no-code</h2><p>Build without programming skills.</p>',
    status: 'PUBLISHED',
    authorSlug: 'partha',
    categories: ['startup-business-ideas'],
    tags: ['no-code'],
    ...overrides,
  });

  describe('POST /api/v1/posts', () => {
    it('creates a post, deriving slug, excerpt and reading time', async () => {
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);

      expect(res.body).toMatchObject({
        slug: '50-no-code-startup-ideas',
        title: '50 No-Code Startup Ideas',
        excerpt: 'Why no-code Build without programming skills.',
        status: 'PUBLISHED',
        readingMinutes: 1,
        author: { name: 'Partha Chakraborty', slug: 'partha' },
        categories: [
          { name: 'Startup business ideas', slug: 'startup-business-ideas' },
        ],
        tags: [{ name: 'No-code', slug: 'no-code' }],
      });
      expect(res.body.publishedAt).toEqual(expect.any(String));
      expect(res.body).not.toHaveProperty('searchVector');
    });

    it('sanitizes HTML before storing it', async () => {
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(
          validPost({ contentHtml: '<p>Safe</p><script>alert(1)</script>' }),
        )
        .expect(201);
      expect(res.body.contentHtml).toBe('<p>Safe</p>');
    });

    it('adds a numeric suffix when the derived slug is taken', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      expect(res.body.slug).toBe('50-no-code-startup-ideas-2');
    });

    it('rejects an explicit slug that is already taken with 409', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ slug: 'taken' }))
        .expect(201);
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ slug: 'taken' }))
        .expect(409);
      expect(res.body.error.code).toBe('CONFLICT');
    });

    it('rejects an invalid body with field-level details', async () => {
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send({ title: '', contentHtml: 42, status: 'LIVE', extra: true })
        .expect(400);
      const fields = res.body.error.details.map(
        (d: { field: string }) => d.field,
      );
      expect(fields).toEqual(
        expect.arrayContaining(['title', 'contentHtml', 'status', 'extra']),
      );
    });

    it('rejects unknown categories with 400', async () => {
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ categories: ['does-not-exist'] }))
        .expect(400);
      expect(res.body.error.message).toContain('does-not-exist');
    });

    it('requires the admin token', async () => {
      await http().post('/api/v1/posts').send(validPost()).expect(401);
      await http()
        .post('/api/v1/posts')
        .set({ Authorization: 'Bearer wrong-token' })
        .send(validPost())
        .expect(401);
    });
  });

  describe('GET /api/v1/posts', () => {
    beforeEach(async () => {
      for (let i = 1; i <= 12; i++) {
        await http()
          .post('/api/v1/posts')
          .set(auth)
          .send(
            validPost({
              title: `Idea number ${i}`,
              publishedAt: new Date(Date.UTC(2025, 6, i)).toISOString(),
              categories: [
                i % 2 ? 'startup-business-ideas' : 'problem-solving',
              ],
              tags: i === 3 ? ['no-code'] : [],
            }),
          )
          .expect(201);
      }
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ title: 'Unfinished draft', status: 'DRAFT' }))
        .expect(201);
    });

    it('lists published posts newest first with pagination meta', async () => {
      const res = await http().get('/api/v1/posts?limit=5').expect(200);
      expect(res.body.meta).toEqual({
        page: 1,
        limit: 5,
        total: 12,
        totalPages: 3,
      });
      expect(res.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Idea number 12',
        'Idea number 11',
        'Idea number 10',
        'Idea number 9',
        'Idea number 8',
      ]);
      expect(res.body.data[0]).not.toHaveProperty('contentHtml');
    });

    it('returns the requested page', async () => {
      const res = await http().get('/api/v1/posts?limit=5&page=3').expect(200);
      expect(res.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Idea number 2',
        'Idea number 1',
      ]);
    });

    it('caps the page size', async () => {
      await http().get('/api/v1/posts?limit=500').expect(400);
    });

    it('filters by category and tag', async () => {
      const byCategory = await http()
        .get('/api/v1/posts?category=problem-solving')
        .expect(200);
      expect(byCategory.body.meta.total).toBe(6);

      const byTag = await http().get('/api/v1/posts?tag=no-code').expect(200);
      expect(byTag.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Idea number 3',
      ]);
    });

    it('hides drafts from the public but shows them to admins', async () => {
      await http().get('/api/v1/posts?status=DRAFT').expect(401);
      const res = await http()
        .get('/api/v1/posts?status=DRAFT')
        .set(auth)
        .expect(200);
      expect(res.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Unfinished draft',
      ]);
    });

    it('searches title and body, ranking title matches first', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(
          validPost({
            title: 'Concept maps explained',
            contentHtml: '<p>Systems.</p>',
          }),
        )
        .expect(201);
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(
          validPost({
            title: 'Thinking tools',
            contentHtml: '<p>A concept map helps.</p>',
          }),
        )
        .expect(201);

      const res = await http().get('/api/v1/posts?q=concept%20map').expect(200);
      expect(res.body.meta.total).toBe(2);
      expect(res.body.data.map((p: { title: string }) => p.title)).toEqual([
        'Concept maps explained',
        'Thinking tools',
      ]);
    });

    it('combines search with a category filter', async () => {
      const res = await http()
        .get('/api/v1/posts?q=idea&category=problem-solving&limit=50')
        .expect(200);
      expect(res.body.meta.total).toBe(6);
    });
  });

  describe('GET /api/v1/posts/:slug', () => {
    it('returns the full post including content', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      const res = await http()
        .get('/api/v1/posts/50-no-code-startup-ideas')
        .expect(200);
      expect(res.body.contentHtml).toContain('<h2>Why no-code</h2>');
    });

    it('returns 404 for a missing slug', async () => {
      const res = await http().get('/api/v1/posts/missing').expect(404);
      expect(res.body.error.code).toBe('NOT_FOUND');
    });

    it('returns 404 for a draft unless the caller is an admin', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ slug: 'secret', status: 'DRAFT' }))
        .expect(201);
      await http().get('/api/v1/posts/secret').expect(404);
      await http().get('/api/v1/posts/secret').set(auth).expect(200);
    });
  });

  describe('PATCH /api/v1/posts/:id', () => {
    it('updates fields, keeps the slug stable and replaces categories', async () => {
      const created = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);

      const res = await http()
        .patch(`/api/v1/posts/${created.body.id}`)
        .set(auth)
        .send({ title: 'Renamed', categories: ['problem-solving'] })
        .expect(200);

      expect(res.body).toMatchObject({
        title: 'Renamed',
        slug: '50-no-code-startup-ideas',
        categories: [{ slug: 'problem-solving' }],
      });
    });

    it('clears publishedAt when a post is unpublished', async () => {
      const created = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      const res = await http()
        .patch(`/api/v1/posts/${created.body.id}`)
        .set(auth)
        .send({ status: 'DRAFT' })
        .expect(200);
      expect(res.body.publishedAt).toBeNull();
    });

    it('returns 404 for an unknown id', async () => {
      await http()
        .patch('/api/v1/posts/0193a0b0-0000-7000-8000-000000000000')
        .set(auth)
        .send({ title: 'x title' })
        .expect(404);
    });

    it('rejects a malformed id with 400', async () => {
      await http()
        .patch('/api/v1/posts/not-a-uuid')
        .set(auth)
        .send({ title: 'x' })
        .expect(400);
    });

    it('clears optional fields sent as null and regenerates the excerpt', async () => {
      const created = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(
          validPost({
            excerpt: 'Hand-written summary',
            seoTitle: 'SEO title',
            seoDescription: 'SEO description',
          }),
        )
        .expect(201);

      const res = await http()
        .patch(`/api/v1/posts/${created.body.id}`)
        .set(auth)
        .send({
          authorSlug: null,
          excerpt: null,
          seoTitle: null,
          seoDescription: null,
          categories: null,
          tags: null,
        })
        .expect(200);

      expect(res.body).toMatchObject({
        author: null,
        excerpt: 'Why no-code Build without programming skills.',
        seoTitle: null,
        seoDescription: null,
        categories: [],
        tags: [],
      });
    });

    it('accepts null optional fields on create', async () => {
      const res = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(
          validPost({
            authorSlug: null,
            excerpt: null,
            categories: null,
            tags: null,
          }),
        )
        .expect(201);
      expect(res.body).toMatchObject({
        author: null,
        categories: [],
        tags: [],
      });
    });

    it.each(['title', 'slug', 'contentHtml', 'status'])(
      'rejects null for the required field %s with 400',
      async (field) => {
        const created = await http()
          .post('/api/v1/posts')
          .set(auth)
          .send(validPost())
          .expect(201);
        const res = await http()
          .patch(`/api/v1/posts/${created.body.id}`)
          .set(auth)
          .send({ [field]: null })
          .expect(400);
        expect(res.body.error.details).toEqual(
          expect.arrayContaining([expect.objectContaining({ field })]),
        );
      },
    );
  });

  describe('input edge cases', () => {
    it('lists when each post last changed, for the sitemap', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      const res = await http().get('/api/v1/posts?limit=1').expect(200);
      expect(res.body.data[0].updatedAt).toEqual(expect.any(String));
    });

    it('rejects a whitespace-only title', async () => {
      await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost({ title: '   ' }))
        .expect(400);
    });

    it('rejects an absurdly large page number with 400', async () => {
      await http().get('/api/v1/posts?page=1000000000000000000').expect(400);
    });
  });

  describe('DELETE /api/v1/posts/:id', () => {
    it('deletes a post', async () => {
      const created = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      await http()
        .delete(`/api/v1/posts/${created.body.id}`)
        .set(auth)
        .expect(204);
      await http().get('/api/v1/posts/50-no-code-startup-ideas').expect(404);
    });

    it('requires the admin token', async () => {
      const created = await http()
        .post('/api/v1/posts')
        .set(auth)
        .send(validPost())
        .expect(201);
      await http().delete(`/api/v1/posts/${created.body.id}`).expect(401);
    });
  });
});
