import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { LoadErrorBoundary } from '@/components/load-error';
import { PostRow } from '@/components/post-row';
import { getPost, getPosts } from '@/lib/blog';
import { formatDate, siteUrl } from '@/lib/format';
import type { PostDetail } from '@/lib/types';

export async function generateMetadata(props: PageProps<'/blog/[slug]'>): Promise<Metadata> {
  const { slug } = await props.params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article not found', robots: { index: false } };

  const description = post.seoDescription ?? post.excerpt ?? undefined;
  return {
    // SEO titles (imported from Yoast or set in the admin) already carry the
    // site name, so they skip the "| Tactyqal Labs" template.
    title: post.seoTitle ? { absolute: post.seoTitle } : post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      title: post.seoTitle ?? post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.publishedAt ?? undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author.name] : undefined,
      images: post.featuredImageUrl ? [post.featuredImageUrl] : undefined,
    },
  };
}

export default function BlogPostPage(props: PageProps<'/blog/[slug]'>) {
  return (
    <article className="wrap flex flex-col gap-10 py-[clamp(48px,6cqi,96px)]">
      <Link className="link inline-flex min-h-11 items-center self-start" href="/blog">
        ← All articles
      </Link>
      <LoadErrorBoundary title="This article could not be loaded">
        <Suspense fallback={<PostSkeleton />}>
          <PostBody params={props.params} />
        </Suspense>
      </LoadErrorBoundary>
    </article>
  );
}

async function PostBody({ params }: Pick<PageProps<'/blog/[slug]'>, 'params'>) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const category = post.categories[0];
  return (
    <>
      <PostJsonLd post={post} />
      <header className="flex flex-col gap-6 border-b-4 border-black pb-10">
        {category && (
          <Link className="small self-start underline" href={`/blog?category=${category.slug}`}>
            {category.name}
          </Link>
        )}
        <h1 className="h2 max-w-[22ch]">{post.title}</h1>
        <p className="small">
          {[post.author?.name, formatDate(post.publishedAt), `${post.readingMinutes} min read`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      <div
        className="prose"
        // contentHtml is sanitized by the API with an allow-list before it is stored.
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {post.tags.length > 0 && (
        <ul className="flex flex-wrap gap-3" aria-label="Tags">
          {post.tags.map((t) => (
            <li key={t.slug} className="badge bg-white">
              {t.name}
            </li>
          ))}
        </ul>
      )}

      {post.author && (
        <aside className="card flex max-w-[68ch] flex-col gap-2" aria-label="About the author">
          <p className="small">Written by</p>
          <p className="h3">{post.author.name}</p>
        </aside>
      )}

      {category && <RelatedPosts slug={post.slug} category={category} />}
    </>
  );
}

async function RelatedPosts({ slug, category }: { slug: string; category: { name: string; slug: string } }) {
  const { data } = await getPosts({ category: category.slug, limit: 4 });
  const related = data.filter((p) => p.slug !== slug).slice(0, 3);
  if (related.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="flex flex-col gap-6 pt-10">
      <h2 className="h3" id="related-title">
        More in {category.name}
      </h2>
      <ul className="rows">
        {related.map((p) => (
          <PostRow key={p.id} post={p} />
        ))}
      </ul>
    </section>
  );
}

function PostJsonLd({ post }: { post: PostDetail }) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.seoDescription ?? post.excerpt ?? undefined,
    datePublished: post.publishedAt ?? undefined,
    dateModified: post.updatedAt,
    author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
    image: post.featuredImageUrl ?? undefined,
    mainEntityOfPage: siteUrl(`/blog/${post.slug}`),
    publisher: { '@type': 'Organization', name: 'Tactyqal Labs' },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}

function PostSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading article">
      <span className="sk w-40" />
      <span className="sk h-20 max-w-[900px]" />
      <span className="sk w-72" />
      <div className="mt-6 flex max-w-[68ch] flex-col gap-3">
        {[100, 96, 98, 80, 100, 92].map((w, i) => (
          <span key={i} className="sk" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}
