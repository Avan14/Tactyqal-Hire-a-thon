import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { PostForm } from '@/components/admin/post-form';
import { adminApi } from '@/lib/admin-session';
import { ApiError } from '@/lib/api';
import { getAuthors, getCategories } from '@/lib/blog';
import type { PostDetail } from '@/lib/types';

export default function EditPostPage(props: PageProps<'/admin/posts/[slug]/edit'>) {
  return (
    <section className="flex flex-col gap-8" aria-labelledby="edit-title">
      <h1 className="h2" id="edit-title">
        Edit post
      </h1>
      <Suspense fallback={<div className="card sk h-96" />}>
        <EditPostForm params={props.params} />
      </Suspense>
    </section>
  );
}

async function EditPostForm({ params }: Pick<PageProps<'/admin/posts/[slug]/edit'>, 'params'>) {
  const { slug } = await params;
  // Read with the admin token, uncached, so drafts load and edits are current.
  const post = await adminApi<PostDetail>(`/posts/${encodeURIComponent(slug)}`).catch((err: unknown) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });
  const [authors, categories] = await Promise.all([getAuthors(), getCategories()]);
  return <PostForm post={post} authors={authors} categories={categories} />;
}
