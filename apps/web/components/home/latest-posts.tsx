import Link from 'next/link';
import { connection } from 'next/server';
import { Suspense } from 'react';
import { getPosts } from '@/lib/blog';
import { LoadErrorBoundary } from '../load-error';
import { PostRow, PostRowsSkeleton } from '../post-row';

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

/** The live site's "Learn from Industry Experts" block, fed by the new blog API. */
export function LatestPosts() {
  return (
    <>
      <p className="eyebrow">From the blog</p>
      <h2 className="h2 text-[clamp(36px,4vw,62px)]" id="blog-title">Learn from industry experts.</h2>
      <LoadErrorBoundary>
        <Suspense fallback={<PostRowsSkeleton />}>
          <LatestPostsList />
        </Suspense>
      </LoadErrorBoundary>
      <Link className="ghost-link mt-auto self-start" href="/blog">
        <i /><span>Read all articles</span>
      </Link>
    </>
  );
}
