'use client';

import { useEffect, useRef, useState } from 'react';
import { announceIntroDone, introShouldPlay, markIntroSeen } from '@/lib/intro';
import { gsap } from '@/lib/motion';
import { Monogram } from '../wordmark';

/**
 * Opening sequence: the monogram wipes in, a phone rises, a counter runs to
 * 100%, then the blue curtain lifts to reveal the hero. It continues on its
 * own after the count, and can be skipped at any moment (click, Enter,
 * Space or Escape). It plays once per browser session and is skipped for
 * visitors who prefer reduced motion.
 *
 * It is part of the server HTML so there is no flash of the page behind it.
 * Visitors without JavaScript never see it (see the <noscript> rule in the
 * page), and everyone else has it removed as soon as the page is ready.
 */
export function IntroLoader() {
  const root = useRef<HTMLDivElement>(null);
  const [gone, setGone] = useState(false);
  const finishRef = useRef<() => void>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;

    if (!introShouldPlay()) {
      announceIntroDone();
      // Removing it is an external-system sync (the loader is decorative), not derived state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setGone(true);
      return;
    }

    document.body.classList.add('locked');
    window.__lenis?.stop();

    const pct = el.querySelector<HTMLElement>('.pct')!;
    const counter = { v: 0 };
    let finished = false;

    const finish = () => {
      if (finished) return;
      finished = true;
      markIntroSeen();
      intro.kill();
      gsap.timeline({
        onComplete: () => {
          document.body.classList.remove('locked');
          window.__lenis?.start();
          setGone(true);
          announceIntroDone();
        },
      })
        .to(el.querySelector('.count'), { opacity: 0, duration: 0.3 })
        .to(el.querySelector('.lphone'), { yPercent: -30, rotate: 6, duration: 1.1, ease: 'power4.inOut' }, 0)
        .to(el, { clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'power4.inOut' }, 0.05);
    };

    finishRef.current = finish;
    gsap.set(el.querySelectorAll('.mono polygon'), { clipPath: 'inset(0 100% 0 0)' });
    gsap.set(el.querySelector('.lphone'), { yPercent: 40, opacity: 0, rotate: 8 });

    const intro = gsap.timeline({ onComplete: () => { setTimeout(finish, 450); } })
      .to(el.querySelectorAll('.mono polygon'), { clipPath: 'inset(0 0% 0 0)', duration: 0.9, ease: 'power4.inOut', stagger: 0.12 }, 0.1)
      .to(el.querySelector('.lphone'), { yPercent: 0, opacity: 1, rotate: -4, duration: 1.4, ease: 'expo.out' }, 0.6)
      .to(counter, { v: 100, duration: 2.3, ease: 'power2.inOut', onUpdate: () => { pct.textContent = `${Math.round(counter.v)}%`; } }, 0)
      .to(pct, { yPercent: -100, duration: 0.5, ease: 'power3.in' })
      .to(el.querySelector('.enter'), { yPercent: -100, opacity: 1, duration: 0.6, ease: 'expo.out' }, '-=0.15');

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        finish();
      }
    };
    window.addEventListener('keydown', onKey);
    el.querySelector<HTMLElement>('.count')?.focus({ preventScroll: true });

    return () => {
      window.removeEventListener('keydown', onKey);
      intro.kill();
      document.body.classList.remove('locked');
      window.__lenis?.start();
    };
  }, []);

  if (gone) return null;
  return (
    <div className="loader" ref={root} role="status" aria-label="Loading Tactyqal Labs">
      <Monogram className="mono" />
      <div className="lphone" aria-hidden="true">
        <div className="phone">
          <div className="scr">
            <div className="appbar"><small>Week 1</small><b>Your idea</b></div>
            <div className="appbody">
              <div className="tile"><i style={{ background: '#ff8a57' }} /><span /></div>
              <div className="tile"><i style={{ background: '#7f95ee' }} /><span /></div>
              <div className="tile"><i style={{ background: '#9ccc6a' }} /><span /></div>
            </div>
          </div>
        </div>
      </div>
      <button type="button" className="count" onClick={() => finishRef.current?.()}>
        <i />
        <span className="lbl">
          <span className="pct">0%</span>
          <span className="enter">LET&apos;S BUILD</span>
        </span>
        <i />
        <span className="sr-only">Skip intro</span>
      </button>
      <span className="tag">Tactyqal Labs · 1:1 app mentorship for teens</span>
    </div>
  );
}
