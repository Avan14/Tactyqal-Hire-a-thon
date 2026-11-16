/**
 * Imports posts from the existing WordPress blog through its public REST API.
 *
 *   pnpm import:wp                  # newest 60 posts
 *   pnpm import:wp --limit 200      # more
 *   pnpm import:wp --dry-run        # fetch and map, write nothing
 *
 * Idempotent: posts, authors and terms are upserted by WordPress id or slug,
 * so re-running only refreshes what is already there. Requests are small,
 * sequential and spaced out to keep load on the live site negligible.
 */
import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client';
import { MappedPost, MappedTerm, mapWpPost, WpPost } from './wordpress/mapper';

interface Options {
  baseUrl: string;
  limit: number;
  batchSize: number;
  delayMs: number;
  dryRun: boolean;
}

function parseArgs(argv: string[]): Options {
  const get = (flag: string) => {
    const i = argv.indexOf(flag);
    return i >= 0 ? argv[i + 1] : undefined;
  };
  const limit = Number(get('--limit') ?? 60);
  if (!Number.isInteger(limit) || limit < 1) {
    throw new Error('--limit must be a positive integer');
  }
  return {
    baseUrl: get('--base') ?? 'https://tactyqal.com/blog/wp-json/wp/v2',
    limit,
    batchSize: Math.min(20, limit),
    delayMs: Number(get('--delay') ?? 1000),
    dryRun: argv.includes('--dry-run'),
  };
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  const res = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'TactyqalBlogImporter/1.0',
    },
  });
  if ((res.status === 429 || res.status >= 500) && attempt < 4) {
    const wait = 1000 * 2 ** attempt;
    console.warn(`  ${res.status} from source, retrying in ${wait}ms`);
    await sleep(wait);
    return fetchJson<T>(url, attempt + 1);
  }
  if (!res.ok) {
    throw new Error(`GET ${url} failed with ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as T;
}

async function* wordpressPosts(opts: Options): AsyncGenerator<WpPost> {
  let yielded = 0;
  for (let page = 1; yielded < opts.limit; page++) {
    const perPage = Math.min(opts.batchSize, opts.limit - yielded);
    const url = `${opts.baseUrl}/posts?_embed=author,wp:term,wp:featuredmedia&per_page=${perPage}&page=${page}&orderby=date&order=desc`;
    console.log(`Fetching page ${page} (${perPage} posts)`);
    const posts = await fetchJson<WpPost[]>(url);
    for (const post of posts) {
      yield post;
      yielded++;
    }
    if (posts.length < perPage) return; // reached the oldest post
    await sleep(opts.delayMs);
  }
}

async function upsertTerm(
  prisma: PrismaClient,
  kind: 'category' | 'tag',
  term: MappedTerm,
) {
  const args = {
    where: { slug: term.slug },
    create: { name: term.name, slug: term.slug, wpId: term.wpId },
    update: { name: term.name },
    select: { id: true },
  };
  return kind === 'category'
    ? prisma.category.upsert(args)
    : prisma.tag.upsert(args);
}

async function savePost(prisma: PrismaClient, post: MappedPost) {
  const author = post.author
    ? await prisma.author.upsert({
        where: { slug: post.author.slug },
        create: {
          name: post.author.name,
          slug: post.author.slug,
          bio: post.author.bio,
          wpId: post.author.wpId,
        },
        update: { name: post.author.name, bio: post.author.bio },
        select: { id: true },
      })
    : null;
  const categories = await Promise.all(
    post.categories.map((t) => upsertTerm(prisma, 'category', t)),
  );
  const tags = await Promise.all(
    post.tags.map((t) => upsertTerm(prisma, 'tag', t)),
  );

  const fields = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    contentHtml: post.contentHtml,
    readingMinutes: post.readingMinutes,
    status: 'PUBLISHED' as const,
    publishedAt: post.publishedAt,
    featuredImageUrl: post.featuredImageUrl,
    seoTitle: post.seoTitle,
    seoDescription: post.seoDescription,
    canonicalUrl: post.canonicalUrl,
    authorId: author?.id ?? null,
  };

  const existing = await prisma.post.findUnique({
    where: { wpId: post.wpId },
    select: { id: true },
  });
  if (existing) {
    await prisma.post.update({
      where: { id: existing.id },
      data: { ...fields, categories: { set: categories }, tags: { set: tags } },
    });
    return 'updated';
  }
  await prisma.post.create({
    data: {
      ...fields,
      wpId: post.wpId,
      categories: { connect: categories },
      tags: { connect: tags },
    },
  });
  return 'created';
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error('DATABASE_URL is not set');

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString: url }),
  });
  const tally = { created: 0, updated: 0, skipped: 0, failed: 0 };
  const started = Date.now();

  try {
    for await (const wp of wordpressPosts(opts)) {
      if (wp.status !== 'publish') {
        tally.skipped++;
        continue;
      }
      try {
        const mapped = mapWpPost(wp);
        if (opts.dryRun) {
          console.log(`  [dry run] ${mapped.slug}`);
          tally.skipped++;
          continue;
        }
        const result = await savePost(prisma, mapped);
        tally[result]++;
        console.log(`  ${result.padEnd(7)} ${mapped.slug}`);
      } catch (err) {
        tally.failed++;
        console.error(
          `  failed  wp#${wp.id} ${wp.slug}: ${(err as Error).message}`,
        );
      }
    }
  } finally {
    await prisma.$disconnect();
  }

  const seconds = ((Date.now() - started) / 1000).toFixed(1);
  console.log(
    `\nDone in ${seconds}s: ${tally.created} created, ${tally.updated} updated, ` +
      `${tally.skipped} skipped, ${tally.failed} failed.`,
  );
  if (tally.failed > 0) process.exitCode = 1;
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
