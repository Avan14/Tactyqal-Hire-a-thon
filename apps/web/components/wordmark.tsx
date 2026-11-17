import Link from 'next/link';

/** The "T" monogram from the comp, drawn once and reused. */
export function Monogram({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 600 560" aria-hidden="true" fill="currentColor">
      <polygon points="40,0 600,0 572,96 12,96" />
      <polygon points="250,96 372,96 268,470 146,470" />
      <polygon points="420,250 560,250 520,390 380,390" />
      <polygon points="470,390 560,390 600,560 510,560" />
    </svg>
  );
}

export function Wordmark({ className = 'logo' }: { className?: string }) {
  return (
    <Link className={className} href="/" aria-label="Tactyqal Labs home">
      <Monogram />
      <span>Tactyqal</span>
    </Link>
  );
}
