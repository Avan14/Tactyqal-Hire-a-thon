import Link from 'next/link';

export function Wordmark() {
  return (
    <Link className="wordmark" href="/">
      <span className="wordmark-dot" aria-hidden="true" />
      Tactyqal Labs
    </Link>
  );
}
