'use client';

import Lenis from 'lenis';
import { useEffect } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';
import { ROUTE_EVENT } from './route-watcher';

declare global {
  interface Window {
    __lenis?: Lenis;
  }
}

/**
 * Smooth scrolling (Lenis) kept in step with ScrollTrigger. Skipped entirely
 * when the visitor prefers reduced motion. Also drives the thin reading
 * progress bar and refreshes triggers after route changes and font loads.
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ lerp: 0.09 });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    const raf = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete window.__lenis;
    };
  }, []);

  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const refresh = () => ScrollTrigger.refresh();
    const onRoute = () => {
      clearTimeout(t);
      t = setTimeout(refresh, 50);
    };
    document.fonts?.ready.then(refresh);
    window.addEventListener(ROUTE_EVENT, onRoute);
    return () => {
      clearTimeout(t);
      window.removeEventListener(ROUTE_EVENT, onRoute);
    };
  }, []);

  return null;
}

/** Scrolls to an element or selector, through Lenis when it is running. */
export function scrollToTarget(target: string | Element) {
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  if (!el) return;
  const lenis = window.__lenis;
  if (lenis) lenis.scrollTo(el as HTMLElement, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else el.scrollIntoView({ behavior: 'smooth' });
}
