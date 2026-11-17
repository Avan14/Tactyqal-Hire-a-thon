'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';
import { scrollToTarget } from '../motion/smooth-scroll';

/** Floating "book a call" pill: appears after the hero, leaves when the contact section is on screen. */
export function Fab() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      gsap.set(el, { yPercent: 0 });
      return;
    }
    const show = (on: boolean) => gsap.to(el, { yPercent: on ? 0 : 160, duration: on ? 0.8 : 0.4, ease: 'expo.out', overwrite: 'auto' });
    const a = ScrollTrigger.create({ trigger: '#top', start: 'bottom+=200% top', onEnter: () => show(true), onLeaveBack: () => show(false) });
    const b = ScrollTrigger.create({ trigger: '#contact', start: 'top 75%', end: () => ScrollTrigger.maxScroll(window) + 1, onToggle: (s) => show(!s.isActive) });
    return () => { a.kill(); b.kill(); };
  }, []);
  return (
    <div className="fab" ref={ref}>
      <Link className="pill" data-cursor="BOOK" href="/#contact" onClick={(e) => { e.preventDefault(); scrollToTarget('#contact'); }}>
        Book a free consultation →
      </Link>
    </div>
  );
}
