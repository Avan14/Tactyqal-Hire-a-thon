import Link from 'next/link';
import { Suspense } from 'react';
import { logout } from '@/app/admin/actions';
import { DeletePostButton } from '@/components/admin/delete-post-button';
import { PostRowsSkeleton } from '@/components/post-row';
import { adminApi } from '@/lib/admin-session';
import { formatDate } from '@/lib/format';
import type { Paginated, PostSummary } from '@/lib/types';

export default function AdminPostsPage(props: PageProps<'/admin/posts'>) {
  return (
    <section className="flex flex-col gap-8" aria-labelledby="admin-title">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="h2" id="admin-title">
          Posts
        </h1>
        <div className="flex flex-wrap gap-3">
          <Link className="btn btn-primary" href="/admin/posts/new">
            New post
          </Link>
          <form action={logout}>
            <button className="btn btn-secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>
      <Suspense fallback={<PostRowsSkeleton count={6} />}>
        <PostTable searchParams={props.searchParams} />
      </Suspense>
    </section>
  );
}

async function PostTable({ searchParams }: Pick<PageProps<'/admin/posts'>, 'searchParams'>) {
  const params = await searchParams;
  const page = Math.min(10_000, Math.max(1, Math.trunc(Number(params.page)) || 1));
  // Admin reads are never cached: they include drafts and must reflect edits at once.
  const { data: posts, meta } = await adminApi<Paginated<PostSummary>>(`/posts?limit=25&page=${page}`);
  const saved = typeof params.saved === 'string' ? params.saved : undefined;
  // Only link to the public page when the saved post is actually visible there.
  const savedIsLive = params.live === '1';

  return (
    <div className="flex flex-col gap-6">
      {saved && (
        <p role="status" className="status">
          Saved.{' '}
          {savedIsLive ? (
            <Link className="underline" href={`/blog/${saved}`}>
              View the post
            </Link>
          ) : (
            'It is not public yet, so it does not appear on the blog.'
          )}
        </p>
      )}
      {params.deleted && (
        <p role="status" className="status">
          Post deleted.
        </p>
      )}
      <div className="table-box">
        <table className="w-full min-w-[720px] border-collapse text-[16px]">
          <thead>
            <tr className="bg-ink text-left text-lime">
              {['Title', 'Status', 'Published', 'Actions'].map((h) => (
                <th key={h} scope="col" className="small px-4 py-3.5">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => {
              const label = postState(post);
              return (
                <tr key={post.id} className="border-b border-ink/15 align-top last:border-b-0">
                  <td className="px-4 py-3.5 font-semibold">{post.title}</td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`badge ${label === 'Published' ? '' : 'bg-cream'}`}
                    >
                      {label}
                    </span>
                  </td>
                  <td className="small px-4 py-3.5">{formatDate(post.publishedAt)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link className="btn btn-secondary btn-sm" href={`/admin/posts/${post.slug}/edit`}>
                        Edit
                      </Link>
                      {label === 'Published' && (
                        <Link className="btn btn-secondary btn-sm" href={`/blog/${post.slug}`}>
                          View
                        </Link>
                      )}
                      <DeletePostButton id={post.id} title={post.title} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="small">
        Page {meta.page} of {meta.totalPages} · {meta.total} posts
        {meta.page > 1 && (
          <Link className="ml-4 underline" href={`/admin/posts?page=${meta.page - 1}`}>
            Previous
          </Link>
        )}
        {meta.page < meta.totalPages && (
          <Link className="ml-4 underline" href={`/admin/posts?page=${meta.page + 1}`}>
            Next
          </Link>
        )}
      </p>
    </div>
  );
}

/** Scheduled posts are published with a future date and are not public yet. */
function postState(post: PostSummary): 'Draft' | 'Scheduled' | 'Published' {
  if (post.status === 'DRAFT') return 'Draft';
  return post.publishedAt && Date.parse(post.publishedAt) > Date.now() ? 'Scheduled' : 'Published';
}
