import type { Metadata } from 'next';
import Form from 'next/form';
import Link from 'next/link';
import { Suspense } from 'react';
import { LoadErrorBoundary } from '@/components/load-error';
import { PostRow, PostRowsSkeleton } from '@/components/post-row';
import { getCategories, getPosts } from '@/lib/blog';
import { blogHref, parseBlogFilters, type BlogFilters } from '@/lib/search-params';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'Startup ideas, business models, problem solving and lessons from failed startups, for young founders and their parents.',
  alternates: { canonical: '/blog' },
};

const PAGE_SIZE = 10;

export default function BlogIndexPage(props: PageProps<'/blog'>) {
  return (
    <section aria-labelledby="blog-title">
      <div className="wrap page flex flex-col gap-10 pb-[12vh]" data-hdr="dark">
        <header className="flex flex-col gap-6">
          <p className="small">The Tactyqal blog</p>
          <h1 className="h1" id="blog-title">
            Learn from Industry Experts
          </h1>
          <p className="lead measure">
            Startup ideas, business models, problem solving and the lessons behind startups that failed.
          </p>
        </header>
        <LoadErrorBoundary title="The blog could not be loaded">
          <Suspense fallback={<BlogSkeleton />}>
            <BlogResults searchParams={props.searchParams} />
          </Suspense>
        </LoadErrorBoundary>
      </div>
    </section>
  );
}

async function BlogResults({ searchParams }: Pick<PageProps<'/blog'>, 'searchParams'>) {
  const filters = parseBlogFilters(await searchParams);
  const [categories, result] = await Promise.all([
    getCategories(),
    getPosts({ page: filters.page, limit: PAGE_SIZE, category: filters.category, q: filters.q }),
  ]);
  const active = categories.filter((c) => c.postCount > 0);
  const { data: posts, meta } = result;
  const activeName = categories.find((c) => c.slug === filters.category)?.name;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <Form action="/blog" className="flex max-w-[720px] flex-wrap gap-3" role="search">
          <label htmlFor="blog-q" className="sr-only">
            Search articles
          </label>
          <input
            id="blog-q"
            className="input flex-[1_1_260px]"
            type="search"
            name="q"
            placeholder="Search articles"
            defaultValue={filters.q}
          />
          {filters.category && <input type="hidden" name="category" value={filters.category} />}
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </Form>
        <nav aria-label="Categories" className="flex flex-wrap gap-3">
          <Link className="chip" href={blogHref({ q: filters.q })} aria-current={!filters.category ? 'page' : undefined}>
            All
          </Link>
          {active.map((c) => (
            <Link
              key={c.slug}
              className="chip"
              href={blogHref({ q: filters.q, category: c.slug })}
              aria-current={filters.category === c.slug ? 'page' : undefined}
            >
              {c.name} <span className="ml-2 opacity-70">{c.postCount}</span>
            </Link>
          ))}
        </nav>
      </div>

      <p className="small" aria-live="polite">
        {meta.total === 0
          ? 'No articles found'
          : `${meta.total} article${meta.total === 1 ? '' : 's'}`}
        {filters.q && ` for “${filters.q}”`}
        {activeName && ` in ${activeName}`}
      </p>

      {posts.length === 0 ? (
        <div className="row rows flex flex-col items-start gap-4">
          <p className="h3">Nothing matches yet</p>
          <p>Try a different search term, or browse all articles.</p>
          <Link className="btn btn-secondary" href="/blog">
            Clear filters
          </Link>
        </div>
      ) : (
        <ul className="rows">
          {posts.map((post) => (
            <PostRow key={post.id} post={post} />
          ))}
        </ul>
      )}

      <Pagination filters={filters} totalPages={meta.totalPages} />
    </div>
  );
}

function pageWindow(current: number, total: number): (number | 'gap')[] {
  const pages = new Set([1, total, current - 1, current, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1]! > 1) out.push('gap');
    out.push(p);
  });
  return out;
}

function Pagination({ filters, totalPages }: { filters: BlogFilters; totalPages: number }) {
  if (totalPages <= 1) return null;
  const { page } = filters;
  const href = (p: number) => blogHref({ ...filters, page: p });

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center gap-3">
      {page > 1 ? (
        <Link className="chip" href={href(page - 1)} rel="prev">
          ← Newer
        </Link>
      ) : (
        <span className="chip" aria-disabled="true">
          ← Newer
        </span>
      )}
      {pageWindow(page, totalPages).map((p, i) =>
        p === 'gap' ? (
          <span key={`gap-${i}`} className="small px-1" aria-hidden="true">
            …
          </span>
        ) : (
          <Link
            key={p}
            className="chip"
            href={href(p)}
            aria-label={`Page ${p}`}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link className="chip" href={href(page + 1)} rel="next">
          Older →
        </Link>
      ) : (
        <span className="chip" aria-disabled="true">
          Older →
        </span>
      )}
    </nav>
  );
}

function BlogSkeleton() {
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-6">
        <span className="sk h-14 max-w-[720px]" />
        <div className="flex flex-wrap gap-3">
          {[90, 160, 140, 180, 120].map((w) => (
            <span key={w} className="sk h-12" style={{ width: w }} />
          ))}
        </div>
      </div>
      <PostRowsSkeleton count={5} />
    </div>
  );
}
