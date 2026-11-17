'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/motion';

/** The giant wordmark rises out of the page bottom as the footer scrolls in. */
export function FooterGiant() {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const foot = el.closest('footer');
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { yPercent: 60 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: foot, start: 'top bottom', end: 'bottom bottom', scrub: true } });
    });
    return () => ctx.revert();
  }, []);
  return (
    <div className="giant disp" aria-hidden="true">
      <span ref={ref}>TACTYQAL</span>
    </div>
  );
}
