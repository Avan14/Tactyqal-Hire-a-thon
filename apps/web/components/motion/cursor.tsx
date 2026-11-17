'use client';

import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/motion';

/**
 * Custom cursor: a small lime dot that follows the pointer (blend mode keeps
 * it visible on every colour), grows over links and buttons, and shows a
 * short label where an element asks for one with data-cursor="BOOK". It is
 * added to the normal cursor, never replaces it, and exists only for fine
 * pointers (mouse, trackpad) when reduced motion is not requested.
 */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const d = dot.current, l = label.current;
    if (!d || !l || prefersReducedMotion() || !matchMedia('(pointer:fine)').matches) return;

    const qx = gsap.quickTo(d, 'x', { duration: 0.25, ease: 'power3' });
    const qy = gsap.quickTo(d, 'y', { duration: 0.25, ease: 'power3' });
    const lx = gsap.quickTo(l, 'x', { duration: 0.25, ease: 'power3' });
    const ly = gsap.quickTo(l, 'y', { duration: 0.25, ease: 'power3' });
    const root = document.documentElement;

    let seen = false;
    const onMove = (e: MouseEvent) => {
      if (!seen) {
        // Appear only once the pointer is known, never parked at the top-left corner.
        seen = true;
        gsap.set([d, l], { x: e.clientX, y: e.clientY });
        gsap.to(d, { opacity: 1, duration: 0.2 });
      }
      qx(e.clientX); qy(e.clientY); lx(e.clientX); ly(e.clientY);
    };
    const onLeave = () => gsap.to([d, l], { opacity: 0, duration: 0.2 });
    const onEnter = () => gsap.to(d, { opacity: 1, duration: 0.2 });
    const onOver = (e: MouseEvent) => {
      const target = (e.target as Element | null)?.closest<HTMLElement>('a,button,summary,input,textarea,select');
      const text = target?.closest<HTMLElement>('[data-cursor]')?.dataset.cursor ?? '';
      gsap.to(d, { scale: text ? 5 : target ? 2.6 : 1, duration: 0.3, ease: 'expo.out' });
      l.textContent = text;
      gsap.to(l, { opacity: text ? 1 : 0, duration: 0.2 });
    };

    addEventListener('mousemove', onMove);
    root.addEventListener('mouseleave', onLeave);
    root.addEventListener('mouseenter', onEnter);
    document.addEventListener('mouseover', onOver);
    d.dataset.on = 'true';
    return () => {
      removeEventListener('mousemove', onMove);
      root.removeEventListener('mouseleave', onLeave);
      root.removeEventListener('mouseenter', onEnter);
      document.removeEventListener('mouseover', onOver);
      delete d.dataset.on;
    };
  }, []);

  return (
    <>
      <div className="cur" ref={dot} aria-hidden="true" />
      <div className="cur-l" ref={label} aria-hidden="true" />
    </>
  );
}
