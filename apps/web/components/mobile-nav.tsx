'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { nav } from '@/content/site';

/**
 * A native <details> menu: it works without JavaScript. The script only
 * closes it after a link is chosen and on Escape.
 */
export function MobileNav() {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const details = ref.current;
    if (!details) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && details.open) {
        details.open = false;
        details.querySelector('summary')?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const close = () => {
    if (ref.current) ref.current.open = false;
  };

  return (
    <details ref={ref} className="nav-mobile">
      <summary className="btn btn-secondary">Menu</summary>
      <nav className="nav nav-panel" aria-label="Primary">
        {nav.map((item) => (
          <Link key={item.href} href={item.href} onClick={close}>
            {item.label}
          </Link>
        ))}
        <Link className="btn btn-primary mt-4" href="/#contact" onClick={close}>
          Book Free Consultation
        </Link>
      </nav>
    </details>
  );
}
