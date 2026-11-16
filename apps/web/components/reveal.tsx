'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/**
 * Section entry from the comp: the heading wipes left to right, then the body
 * wipes top to bottom. Server HTML is fully visible, so content never depends
 * on JavaScript; only sections that start below the fold are hidden, then
 * revealed once. Reduced-motion users get a short fade (see globals.css).
 */
export function Reveal({ className = '', children }: { className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const done = useRef(false);
  const [phase, setPhase] = useState<'' | 'rv-wait' | 'rv-in'>('');

  useEffect(() => {
    const el = ref.current;
    if (!el || done.current || typeof IntersectionObserver === 'undefined') return;
    if (el.getBoundingClientRect().top < window.innerHeight) {
      done.current = true;
      return;
    }
    setPhase('rv-wait');
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        done.current = true;
        setPhase('rv-in');
        io.disconnect();
      },
      { rootMargin: '0px 0px -10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={`${className} ${phase}`.trim()}>
      {children}
    </div>
  );
}
