import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getPosts } from '@/lib/blog';
import { LoadErrorBoundary } from '../load-error';
import { PostRow, PostRowsSkeleton } from '../post-row';
import { Reveal } from '../reveal';

/**
 * Rendered at request time behind Suspense, so the static homepage shell
 * never depends on the API being reachable at build time. The data call
 * itself is cached (lib/blog.ts), so this stays fast.
 */
async function LatestPostsList() {
  await connection();
  const { data: posts } = await getPosts({ limit: 3 });

  if (posts.length === 0) {
    return (
      <div className="row rows flex flex-col gap-1">
        <p className="h3">No articles yet</p>
        <p>New articles will appear here once they are published.</p>
      </div>
    );
  }
  return (
    <ul className="rows">
      {posts.map((post) => (
        <PostRow key={post.id} post={post} />
      ))}
    </ul>
  );
}

export function LatestPosts() {
  return (
    <section className="sec" id="blog" aria-labelledby="blog-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="blog-title">
            Learn from Industry Experts
          </h2>
          <Link className="link inline-flex min-h-11 items-center" href="/blog">
            Read All Articles
          </Link>
        </div>
        <div className="split-body">
          <LoadErrorBoundary>
            <Suspense fallback={<PostRowsSkeleton />}>
              <LatestPostsList />
            </Suspense>
          </LoadErrorBoundary>
        </div>
      </Reveal>
    </section>
  );
}
