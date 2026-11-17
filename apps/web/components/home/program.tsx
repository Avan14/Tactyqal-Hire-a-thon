'use client';

import { useEffect, useRef } from 'react';
import { program, studentApps, tools } from '@/content/site';
import { gsap, ScrollTrigger, prefersReducedMotion } from '@/lib/motion';

import { Shot } from './shot';

/** One real student app per stage, shown as an example of student work (not as that stage's literal output). */
const stageApps = ['KrishiDrishti', 'Converza', 'Elenor Vegan Handbags', 'One Last Chapter'].map(
  (name) => studentApps.find((a) => a.name === name)!,
);
const toolHref = (name: string) => tools.items.find((t) => t.name === name)?.href;

/**
 * The four program stages on a sideways track that scrolls with the page on
 * desktop. On phones and under reduced motion the panels simply stack.
 */
export function Program() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const track = el.querySelector<HTMLElement>('.htrack')!;
    const fill = el.querySelector<HTMLElement>('.hprog i');
    const label = el.querySelector<HTMLElement>('.hprog-l');
    const mm = gsap.matchMedia();
    mm.add({ wide: '(min-width: 821px) and (prefers-reduced-motion: no-preference)', narrow: '(max-width: 820px), (prefers-reduced-motion: reduce)' }, (ctx) => {
      const wide = !!ctx.conditions?.wide;
      let tween: gsap.core.Tween | null = null;
      if (wide) {
        tween = gsap.to(track, {
          x: () => -(track.scrollWidth - innerWidth),
          ease: 'none',
          scrollTrigger: {
            trigger: el, pin: true, scrub: 1, start: 'top top', end: () => `+=${track.scrollWidth - innerWidth}`, invalidateOnRefresh: true,
            onUpdate: (self) => {
              if (fill) gsap.set(fill, { scaleX: self.progress });
              if (label) label.textContent = `0${Math.min(4, Math.floor(self.progress * 4) + 1)} / 04`;
            },
          },
        });
      }
      if (prefersReducedMotion()) return;
      el.querySelectorAll<HTMLElement>('.hp').forEach((p, i) => {
        const st = !wide ? { trigger: p, start: 'top 80%' } : i === 0 ? { trigger: el, start: 'top 40%' } : { trigger: p, containerAnimation: tween!, start: 'left 85%' };
        gsap.from(p.querySelectorAll('.nch'), { yPercent: 110, rotate: 6, duration: 1, stagger: 0.09, ease: 'expo.out', scrollTrigger: { ...st, once: true } });
        gsap.from(p.querySelectorAll('.r > *'), { opacity: 0, y: 24, stagger: 0.08, duration: 0.8, ease: 'expo.out', scrollTrigger: { ...st } });
        gsap.fromTo(p.querySelector('.fr'), { clipPath: 'inset(100% -2% -2% -2%)' }, { clipPath: 'inset(-2% -2% -2% -2%)', duration: 1, ease: 'expo.out', scrollTrigger: { ...st } });
      });
      gsap.from(el.querySelectorAll('.hintro .ln > span'), { yPercent: 105, duration: 0.9, stagger: 0.08, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 80%' } });
    });
    ScrollTrigger.refresh();
    return () => mm.revert();
  }, []);

  return (
    <section className="hwrap bg-cream" id="program" ref={root} data-hdr="dark" aria-labelledby="program-title">
      <div className="hprog" aria-hidden="true"><i /></div>
      <span className="hprog-l" aria-hidden="true">01 / 04</span>
      <div className="htrack">
        <div className="hintro">
          <p className="eyebrow text-blue">How the 8 weeks work</p>
          <h2 className="disp text-blue" id="program-title">
            <span className="ln"><span>From idea</span></span>
            <span className="ln"><span>to full app</span></span>
            <span className="ln"><span className="text-orange">in 8 weeks.</span></span>
          </h2>
          <p>{program.banner}</p>
        </div>
        {program.stages.map((stage, i) => {
          const weeks = stage.weeks.replace('Week ', '');
          return (
            <article key={stage.name} className="hp" aria-label={`${stage.weeks}: ${stage.name}`}>
              <div className="l">
                <span className="ital text-[16px]">Weeks</span>
                <div className="num disp text-blue" aria-label={weeks}>
                  <span className="nmask"><span className="nin" aria-hidden="true">{[...weeks].map((c, k) => <span key={k} className="nch">{c}</span>)}</span></span>
                </div>
                <h3 className="disp">{stage.name}</h3>
              </div>
              <div className="r">
                <figure className="fr m-0" style={{ ['--fc' as string]: 'var(--color-orange)' }}>
                  <Shot src={stageApps[i].screenshots[i === 0 ? 1 : 0]} alt={`${stageApps[i].name}, built by a Tactyqal student`} sizes="(max-width: 820px) 90vw, 26vw" />
                  <figcaption className="small mt-2 text-[11px]">Student app · {stageApps[i].name}</figcaption>
                </figure>
                <div className="flex flex-col gap-3">
                  {stage.points.map((pt) => <p key={pt}>{pt}</p>)}
                </div>
                {stage.tools.length > 0 && (
                  <div className="see">
                    Free tools for this stage
                    <b>
                      {stage.tools.map((t, k) => {
                        const href = toolHref(t);
                        return (
                          <span key={t}>
                            {k > 0 && ' · '}
                            {href ? (
                              <a className="underline decoration-[1.5px] underline-offset-4" href={href} target="_blank" rel="noopener noreferrer">
                                {t}
                              </a>
                            ) : (
                              t
                            )}
                          </span>
                        );
                      })}
                    </b>
                  </div>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
