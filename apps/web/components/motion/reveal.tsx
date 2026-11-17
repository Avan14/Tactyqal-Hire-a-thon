'use client';

import { useEffect, useRef, type ComponentPropsWithoutRef, type ElementType, type ReactNode } from 'react';
import { gsap, prefersReducedMotion } from '@/lib/motion';

/**
 * Scroll-entry animations. Server HTML is complete and visible without
 * JavaScript; the effects only add motion once the element nears the viewport.
 *
 * - <Lines> masks each child line and slides it up (the comp's `.ln` reveal).
 * - <Fade> lifts and fades a block in.
 * - <Float> drifts a framed card with scroll and wipes it in from below.
 */

interface LinesProps extends Omit<ComponentPropsWithoutRef<'div'>, 'children'> {
  as?: ElementType;
  lines: ReactNode[];
  /** Class for each line's inner span (e.g. a colour), by index. Plain data so server components can pass it. */
  lineClasses?: (string | undefined)[];
}

export function Lines({ as: Tag = 'div', lines, lineClasses, className, ...rest }: LinesProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el.querySelectorAll(':scope > .ln > span'), {
        yPercent: 105,
        rotate: 2,
        duration: 0.9,
        stagger: 0.08,
        ease: 'expo.out',
        scrollTrigger: { trigger: el, start: 'top 90%' },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <Tag ref={ref} className={className} {...rest}>
      {lines.map((line, i) => (
        <span key={i} className="ln">
          <span className={lineClasses?.[i]}>{line}</span>
        </span>
      ))}
    </Tag>
  );
}

interface FadeProps extends ComponentPropsWithoutRef<'div'> {
  as?: ElementType;
  delay?: number;
}

export function Fade({ as: Tag = 'div', delay = 0, children, ...rest }: FadeProps) {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      gsap.from(el, { y: 24, opacity: 0, duration: 0.8, delay, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
    }, el);
    return () => ctx.revert();
  }, [delay]);
  return (
    <Tag ref={ref} {...rest}>
      {children}
    </Tag>
  );
}

interface FloatProps extends ComponentPropsWithoutRef<'div'> {
  speed?: number;
}

export function Float({ speed = 0.5, children, className = '', ...rest }: FloatProps) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const section = el.closest('section') ?? el;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { y: speed * 160, rotate: speed * 8 },
        { y: -speed * 160, rotate: -speed * 6, ease: 'none', scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true } },
      );
      gsap.fromTo(
        el,
        { clipPath: 'inset(100% -2% -2% -2%)' },
        { clipPath: 'inset(-2% -2% -2% -2%)', duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 95%' } },
      );
    }, el);
    return () => ctx.revert();
  }, [speed]);
  return (
    <div ref={ref} className={`fr ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
}

/** Big number that counts up (or slides in digit by digit when it has a separator). */
export function BigNumber({ value, separator, className = '' }: { value: string; separator?: string; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const text = separator ? value.split('').join(separator) : value;
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return;
    const inner = el.querySelector<HTMLElement>('.nin');
    if (!inner) return;
    const ctx = gsap.context(() => {
      if (separator) {
        gsap.from(el.querySelectorAll('.nch'), { yPercent: 110, rotate: 6, duration: 1, stagger: 0.09, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 85%', once: true } });
        return;
      }
      const target = Number(value);
      const o = { v: 0 };
      gsap.set(inner, { yPercent: 110 });
      gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
        .to(inner, { yPercent: 0, duration: 0.9, ease: 'expo.out' }, 0)
        .to(o, { v: target, duration: 1.4, ease: 'power3.out', onUpdate: () => { inner.textContent = String(Math.round(o.v)); } }, 0);
    }, el);
    return () => ctx.revert();
  }, [value, separator]);
  return (
    <div ref={ref} className={`num disp ${className}`.trim()} aria-label={text}>
      <span className="nmask">
        <span className="nin" aria-hidden="true">
          {separator ? [...text].map((c, i) => <span key={i} className="nch">{c}</span>) : value}
        </span>
      </span>
    </div>
  );
}
