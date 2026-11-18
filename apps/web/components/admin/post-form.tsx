'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { savePost } from '@/app/admin/actions';
import type { FormState } from '@/app/actions';
import type { PostDetail, TermWithCount } from '@/lib/types';

interface Props {
  post?: PostDetail;
  authors: TermWithCount[];
  categories: TermWithCount[];
}

export function PostForm({ post, authors, categories }: Props) {
  const [state, action, pending] = useActionState(savePost, { status: 'idle' } as FormState);
  const v = state.values;
  const err = (f: string) => state.fieldErrors?.[f];
  const selected = new Set(
    v?.categories !== undefined
      ? v.categories.split(',').filter(Boolean)
      : (post?.categories.map((c) => c.slug) ?? []),
  );

  const describe = (f: string) =>
    err(f) ? { 'aria-invalid': true as const, 'aria-describedby': `${f}-err` } : {};
  const errorText = (f: string) =>
    err(f) && (
      <p id={`${f}-err`} className="err">
        {err(f)}
      </p>
    );

  return (
    <form action={action} className="card flex flex-col gap-6" noValidate>
      {post && <input type="hidden" name="id" value={post.id} />}
      {state.message && (
        <p role="alert" className="alert">
          {state.message}
        </p>
      )}

      <div className="field">
        <label htmlFor="title">Title</label>
        <input id="title" name="title" className="input" required maxLength={200} defaultValue={v?.title ?? post?.title} {...describe('title')} />
        {errorText('title')}
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] gap-5">
        <div className="field">
          <label htmlFor="slug">Slug {post ? '' : '(optional)'}</label>
          <input
            id="slug"
            name="slug"
            className="input"
            placeholder={post ? undefined : 'generated from the title'}
            pattern="[a-z0-9]+(-[a-z0-9]+)*"
            defaultValue={v?.slug ?? post?.slug}
            {...describe('slug')}
          />
          {errorText('slug')}
        </div>
        <div className="field">
          <label htmlFor="status">Status</label>
          <select id="status" name="status" className="input" defaultValue={v?.status ?? post?.status ?? 'DRAFT'}>
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
        </div>
        <div className="field">
          <label htmlFor="authorSlug">Author</label>
          <select id="authorSlug" name="authorSlug" className="input" defaultValue={v?.authorSlug ?? post?.author?.slug ?? ''}>
            <option value="">No author</option>
            {authors.map((a) => (
              <option key={a.slug} value={a.slug}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="small mb-3">Categories</legend>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {categories.map((c) => (
            <label key={c.slug} className="flex min-h-11 items-center gap-2">
              <input type="checkbox" name="categories" value={c.slug} defaultChecked={selected.has(c.slug)} className="size-5 accent-black" />
              {c.name}
            </label>
          ))}
        </div>
        {errorText('categories')}
      </fieldset>

      <div className="field">
        <label htmlFor="excerpt">Excerpt (optional)</label>
        <textarea id="excerpt" name="excerpt" className="input" rows={3} maxLength={500} placeholder="generated from the content" defaultValue={v?.excerpt ?? post?.excerpt ?? ''} {...describe('excerpt')} />
        {errorText('excerpt')}
      </div>

      <div className="field">
        <label htmlFor="contentHtml">Content (HTML)</label>
        <textarea
          id="contentHtml"
          name="contentHtml"
          className="input font-mono text-[15px]"
          rows={18}
          required
          defaultValue={v?.contentHtml ?? post?.contentHtml}
          {...describe('contentHtml')}
        />
        <p className="small">Scripts and other unsafe code are removed automatically when you save.</p>
        {errorText('contentHtml')}
      </div>

      <details className="flex flex-col gap-4">
        <summary className="small py-2 underline">SEO fields</summary>
        <div className="mt-4 flex flex-col gap-5">
          <div className="field">
            <label htmlFor="seoTitle">SEO title</label>
            <input id="seoTitle" name="seoTitle" className="input" maxLength={200} defaultValue={v?.seoTitle ?? post?.seoTitle ?? ''} />
          </div>
          <div className="field">
            <label htmlFor="seoDescription">SEO description</label>
            <textarea id="seoDescription" name="seoDescription" className="input" rows={2} maxLength={320} defaultValue={v?.seoDescription ?? post?.seoDescription ?? ''} />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap gap-3">
        <button className="btn btn-primary" type="submit" disabled={pending}>
          {pending ? 'Saving…' : post ? 'Save changes' : 'Create post'}
        </button>
        <Link className="btn btn-secondary" href="/admin/posts">
          Cancel
        </Link>
      </div>
    </form>
  );
}
