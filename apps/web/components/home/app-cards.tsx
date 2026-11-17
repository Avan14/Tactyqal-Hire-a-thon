'use client';

import { useEffect, useRef, useState } from 'react';
import type { StudentApp } from '@/content/site';
import { gsap, prefersReducedMotion } from '@/lib/motion';
import { Shot } from './shot';

const tilt = [-9, 7, -5, 10];
const rest = [-2, 1.5, -1, 2];

/**
 * Real screenshots of each student app, as on the live site's success-stories
 * carousel. The image cycles on click, and the dots jump to a screenshot.
 */
function Gallery({ app }: { app: StudentApp }) {
  const [index, setIndex] = useState(0);
  const total = app.screenshots.length;
  return (
    <div>
      <button
        type="button"
        className="block w-full cursor-pointer text-left"
        onClick={() => setIndex((i) => (i + 1) % total)}
        aria-label={`Show the next ${app.name} screenshot`}
      >
        <Shot src={app.screenshots[index]} alt={`${app.name}, screenshot ${index + 1} of ${total}`} sizes="(max-width: 820px) 90vw, 28vw" />
      </button>
      {total > 1 && (
        <div className="gal-dots" role="group" aria-label={`${app.name} screenshots`}>
          {app.screenshots.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Screenshot ${i + 1} of ${total}`}
              aria-current={i === index ? 'true' : undefined}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** App cards arrive scattered and tilted, then straighten as the grid scrolls in. */
export function AppCards({ apps }: { apps: StudentApp[] }) {
  const ref = useRef<HTMLUListElement>(null);
  useEffect(() => {
    const grid = ref.current;
    if (!grid || prefersReducedMotion()) return;
    const ctx = gsap.context(() => {
      grid.querySelectorAll<HTMLElement>('.acard').forEach((c, i) => {
        gsap.fromTo(c, { y: 160, rotate: tilt[i % 4], opacity: 0 }, { y: 0, rotate: rest[i % 4], opacity: 1, ease: 'power2.out', scrollTrigger: { trigger: grid, start: 'top 95%', end: 'top 45%', scrub: 1 } });
        if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
        c.addEventListener('mouseenter', () => gsap.to(c, { rotate: 0, scale: 1.03, y: -6, duration: 0.35, ease: 'expo.out' }));
        c.addEventListener('mouseleave', () => gsap.to(c, { rotate: rest[i % 4], scale: 1, y: 0, duration: 0.3, ease: 'expo.out' }));
      });
    }, grid);
    return () => ctx.revert();
  }, []);
  return (
    <ul ref={ref} className="agrid">
      {apps.map((app) => (
        <li key={app.name} className="acard">
          <Gallery app={app} />
          <div className="meta">
            <h3 className="disp text-[26px] leading-none">{app.name}</h3>
            <p>{app.description}</p>
            {app.detail && <p className="small text-[11px]">{app.detail}</p>}
          </div>
        </li>
      ))}
    </ul>
  );
}
