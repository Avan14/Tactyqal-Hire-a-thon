'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/motion';

/** A blue growth curve that rises out of the cream as the next section nears. */
export function GrowthRise() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el.querySelector('svg'), { scaleY: 0 }, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top 85%', end: 'bottom bottom', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div className="grow bg-cream" ref={ref} aria-hidden="true">
      <svg viewBox="0 0 1440 400" preserveAspectRatio="none">
        <path d="M0 400 L0 360 L120 350 L160 330 L260 336 L300 300 L400 306 L440 270 L540 276 L580 236 L680 242 L720 196 L820 202 L860 150 L960 158 L1000 104 L1100 112 L1140 60 L1240 68 L1280 20 L1440 0 L1440 400 Z" />
      </svg>
    </div>
  );
}

/** One huge word that scales up as it scrolls into view. */
export function GiantWord({ word }: { word: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(el, { scale: 0.3, rotate: -8, opacity: 0.2 }, { scale: 1, rotate: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'center center', scrub: true } });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <div ref={ref} className="disp text-ink" style={{ fontSize: 'min(25vw,46vh)', lineHeight: 0.8, marginTop: '12vh' }} aria-hidden="true">
      {word}
    </div>
  );
}
