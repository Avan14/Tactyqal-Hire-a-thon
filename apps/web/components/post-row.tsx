import Link from 'next/link';
import { formatDate } from '@/lib/format';
import type { PostSummary } from '@/lib/types';

export function PostRow({ post }: { post: PostSummary }) {
  const category = post.categories[0]?.name;
  return (
    <li className="row post">
      <Link className="post-title" href={`/blog/${post.slug}`}>
        {post.title}
      </Link>
      <span className="small">
        {[category, formatDate(post.publishedAt), `${post.readingMinutes} min read`]
          .filter(Boolean)
          .join(' · ')}
      </span>
      <Link className="small link" href={`/blog/${post.slug}`} aria-label={`Read more: ${post.title}`}>
        Read More
      </Link>
    </li>
  );
}

export function PostRowsSkeleton({ count = 3 }: { count?: number }) {
  const widths = [72, 58, 64, 50, 68];
  return (
    <ul className="rows" aria-busy="true" aria-label="Loading articles">
      {Array.from({ length: count }, (_, i) => (
        <li key={i} className="row flex flex-col gap-3">
          <span className="sk h-[18px]" style={{ width: `${widths[i % widths.length]}%` }} />
          <span className="sk" style={{ width: `${i % 2 ? 28 : 34}%` }} />
        </li>
      ))}
    </ul>
  );
}
