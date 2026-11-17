'use client';

import { useEffect, useRef } from 'react';
import type { StudentApp } from '@/content/site';
import { gsap, prefersReducedMotion } from '@/lib/motion';

const palette = ['g2', 'g4', 'g3', 'g6', 'g1', 'g5'];
const tilt = [-9, 7, -5, 10];
const rest = [-2, 1.5, -1, 2];

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
      {apps.map((app, i) => (
        <li key={app.name} className="acard">
          <div className={`ph ${palette[i % palette.length]}`} style={{ ['--ar' as string]: '4/3' }}>
            <div className="bar">{app.name}</div>
            <div className="lines"><span /><span /><span /></div>
          </div>
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
