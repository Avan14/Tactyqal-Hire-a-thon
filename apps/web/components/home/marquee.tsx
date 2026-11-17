'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';

/** A looping band of words that speeds up with the scroll velocity. */
export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const track = ref.current;
    if (!track || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      const loop = gsap.to(track, { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
      ScrollTrigger.create({
        start: 0, end: 'max',
        onUpdate: (s) => {
          const v = s.getVelocity(), dir = v < 0 ? -1 : 1;
          gsap.to(loop, { timeScale: dir * (1 + Math.min(Math.abs(v) / 450, 3)), duration: 0.4, ease: 'power2.out', overwrite: true });
          gsap.to(loop, { timeScale: dir, duration: 1.4, delay: 0.3, ease: 'power2.out' });
        },
      });
    }, track);
    return () => ctx.revert();
  }, []);
  const run = items.map((t) => (
    <span key={t}>
      {t.toUpperCase()} <em>●</em>
    </span>
  ));
  return (
    <div className="marq disp" aria-hidden="true">
      <div className="tr" ref={ref}>
        <span className="flex">{run}</span>
        <span className="flex">{run}</span>
      </div>
    </div>
  );
}
