import { Suspense } from 'react';
import { PostForm } from '@/components/admin/post-form';
import { requireAdminToken } from '@/lib/admin-session';
import { getAuthors, getCategories } from '@/lib/blog';

export default function NewPostPage() {
  return (
    <section className="flex flex-col gap-8" aria-labelledby="new-title">
      <h1 className="h2" id="new-title">
        New post
      </h1>
      <Suspense fallback={<div className="card sk h-96" />}>
        <NewPostForm />
      </Suspense>
    </section>
  );
}

async function NewPostForm() {
  await requireAdminToken();
  const [authors, categories] = await Promise.all([getAuthors(), getCategories()]);
  return <PostForm authors={authors} categories={categories} />;
}
