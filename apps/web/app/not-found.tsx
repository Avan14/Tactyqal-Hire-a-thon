import Link from 'next/link';

export default function NotFound() {
  return (
    <section className="wrap page flex flex-col items-start gap-8 pb-[14vh]" data-hdr="dark">
      <p className="badge">404</p>
      <h1 className="h1 text-blue">This page does not exist</h1>
      <p className="lead measure">
        The link may be old, or the article may have moved. Every blog post kept its original address,
        so try the blog index or search for it.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link className="btn btn-primary" href="/blog">
          Browse the blog
        </Link>
        <Link className="btn btn-secondary" href="/">
          Back to home
        </Link>
      </div>
    </section>
  );
}
