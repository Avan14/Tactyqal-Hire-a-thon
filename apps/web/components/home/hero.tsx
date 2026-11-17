'use client';

import Link from 'next/link';
import { useEffect, useRef } from 'react';
import { hero, program, studentApps } from '@/content/site';
import { gsap, isPhone, prefersReducedMotion, vh, vw } from '@/lib/motion';
import { Pops } from '../motion/pops';
import { scrollToTarget } from '../motion/smooth-scroll';

const HEADLINE = ['IDEA', 'TO', 'FULL', 'APP.'];
const chapters = [
  { name: 'Idea', weeks: 'weeks 1–2' },
  { name: 'Design', weeks: 'weeks 3–4' },
  { name: 'Build', weeks: 'weeks 5–6' },
  { name: 'Launch', weeks: 'weeks 7–8' },
];
const olc = studentApps.find((a) => a.name === 'One Last Chapter');

/**
 * The hero is one pinned scene. Scrolling lifts the headline, zooms the phone,
 * then clips the blue scene down to a postcard of a student's app while the
 * stage names and the four program chapters slide in around it.
 * Without JavaScript (or with reduced motion) the scene simply sits there.
 */
export function Hero() {
  const root = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const reduce = prefersReducedMotion();

    const cardRect = () => {
      const W = innerWidth, H = innerHeight;
      let h = H * 0.46, w = h * 0.62;
      if (w > W * 0.5) { w = W * 0.5; h = w / 0.62; }
      const top = H * 0.11, left = (W - w) / 2;
      return { t: (top / H) * 100, l: (left / W) * 100, r: (left / W) * 100, b: ((H - top - h) / H) * 100, top, left, w, h };
    };
    const landRect = () => {
      const W = innerWidth, H = innerHeight, m = isPhone();
      const w = m ? W * 0.86 : W * 0.5, h = m ? H * 0.46 : H * 0.64, top = H * 0.12, left = (W - w) / 2;
      return { t: (top / H) * 100, l: (left / W) * 100, r: (left / W) * 100, b: ((H - top - h) / H) * 100 };
    };
    const setVars = () => {
      const c = cardRect();
      el.style.setProperty('--ct', `${c.top}px`);
      el.style.setProperty('--cl', `${c.left}px`);
      el.style.setProperty('--cw', `${c.w}px`);
      el.style.setProperty('--chh', `${c.h}px`);
    };
    setVars();

    const ctx = gsap.context(() => {
      const scene = el.querySelector<HTMLElement>('.scene')!;
      const frame = el.querySelector<HTMLElement>('.frame')!;
      const ins = { t: 0, r: 0, b: 0, l: 0 };
      const apply = () => {
        scene.style.clipPath = `inset(${ins.t}% ${ins.r}% ${ins.b}% ${ins.l}%)`;
        frame.style.top = `calc(${ins.t}% - 9px)`; frame.style.right = `calc(${ins.r}% - 9px)`;
        frame.style.bottom = `calc(${ins.b}% - 9px)`; frame.style.left = `calc(${ins.l}% - 9px)`;
      };

      // Entry: headline letters, phone and controls arrive once.
      gsap.set('.names .nm-l', { x: vw(-70) });
      gsap.set('.names .nm-r', { x: vw(70) });
      gsap.set('.chapters .ln > span', { yPercent: 110 });
      if (!reduce) {
        gsap.timeline()
          .fromTo('#zin', { y: vh(60), rotate: 10 }, { y: 0, rotate: 0, duration: 1.6, ease: 'expo.out' }, 0.1)
          .fromTo('.htitle .chi', { yPercent: 110 }, { yPercent: 0, duration: 1.2, ease: 'expo.out', stagger: 0.05 }, 0.15)
          .fromTo('.htitle .tagline', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 0.7)
          .fromTo('.hbook', { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.7, ease: 'expo.out' }, 0.8)
          .fromTo('.hcta', { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: 'expo.out' }, 0.85)
          .fromTo('.cue', { opacity: 0 }, { opacity: 1, duration: 0.6 }, 1.3);
      } else {
        gsap.set(['.htitle .tagline', '.hbook', '.hcta'], { opacity: 1 });
      }

      // Reduced motion: the hero stays a still, readable scene. No pin, no scrubbing.
      if (reduce) return;

      // Scroll: pinned timeline from blue scene to postcard.
      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: el, start: 'top top', end: '+=320%', pin: true, scrub: 1, invalidateOnRefresh: true, onRefreshInit: setVars },
      });
      tl.fromTo('.htitle', { y: 0, opacity: 1 }, { y: vh(-40), opacity: 0, duration: 1 }, 0)
        .fromTo(['.hbook', '.hcta', '.cue'], { opacity: 1 }, { opacity: 0, duration: 0.3 }, 0)
        .fromTo('.zoom', { scale: 1, y: 0 }, { scale: 1.35, y: vh(-22), duration: 1.2, ease: 'power1.inOut' }, 0)
        .to('.zoom', { scale: 1.15, y: vh(-36), duration: 1.3, ease: 'power3.inOut' }, 1.15)
        .to(ins, { t: () => landRect().t, r: () => landRect().r, b: () => landRect().b, l: () => landRect().l, duration: 1.1, ease: 'power3.inOut', onUpdate: apply }, 1.15)
        .to(frame, { opacity: 1, duration: 0.35 }, 1.85)
        .to(ins, { t: () => cardRect().t, r: () => cardRect().r, b: () => cardRect().b, l: () => cardRect().l, duration: 0.8, ease: 'power3.inOut', onUpdate: apply }, 2.4)
        .to('.names .nm', { x: 0, duration: 1.1, ease: 'power3.out' }, 2.3)
        .to('.cardp', { clipPath: 'circle(150% at 50% 100%)', duration: 0.9, ease: 'power2.inOut' }, 3.05)
        .to(scene, { opacity: 0, duration: 0.3 }, 3.8)
        .to('.chapters .ln > span', { yPercent: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }, 3.4)
        .to('.names .nm-l', { x: vw(-4), duration: 1 }, 3.5)
        .to('.names .nm-r', { x: vw(4), duration: 1 }, 3.5);

      // Header colour: light over the blue scene, dark once the card lands.
      tl.scrollTrigger!.vars.onUpdate = (self) => {
        document.querySelector('.hdr')?.classList.toggle('dark', self.progress > 0.36);
      };

      // Mouse parallax on desktop.
      if (!reduce && matchMedia('(pointer:fine)').matches) {
        const px = gsap.quickTo('.hphone', 'x', { duration: 1.2, ease: 'power3' });
        const py = gsap.quickTo('.hphone', 'y', { duration: 1.2, ease: 'power3' });
        const onMove = (e: MouseEvent) => { px((e.clientX / innerWidth - 0.5) * 20); py((e.clientY / innerHeight - 0.5) * 11); };
        addEventListener('mousemove', onMove);
        return () => removeEventListener('mousemove', onMove);
      }
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section className="hero" id="top" ref={root} aria-labelledby="hero-title">
      {/* cream stage revealed at the end of the scroll */}
      <div className="stage" aria-hidden="true">
        <div className="names disp">
          <span className="nm nm-l">IDEA</span>
          <span className="nm nm-r">LAUNCH</span>
        </div>
        <ul className="chapters disp">
          {chapters.map((c) => (
            <li key={c.name} className="ln">
              <span>
                <Link href="/#program" onClick={(e) => { e.preventDefault(); scrollToTarget('#program'); }} tabIndex={-1}>
                  {c.name}
                  <small>{c.weeks}</small>
                </Link>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* blue scene */}
      <div className="scene">
        <Pops zone="hero" every={1500} />
        <div className="htitle">
          <h1 className="disp" id="hero-title" aria-label={hero.title}>
            <span className="tagline" aria-hidden="true">{program.title} · 1:1 mentoring · no coding</span>
            {HEADLINE.map((word, wi) => (
              <span key={word} aria-hidden="true">
                <span className="word">
                  {[...word].map((ch, i) => (
                    <span key={i} className="chm">
                      <span className="chi">{ch}</span>
                    </span>
                  ))}
                </span>
                {wi < HEADLINE.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
        </div>
        <div className="zoom">
          <div className="zin" id="zin">
            <div className="desk" />
            <div className="hphone">
              <div className="phone">
                <div className="scr">
                  <div className="appbar"><small>Built by your teen</small><b>My first app</b></div>
                  <div className="appbody">
                    <div className="tile"><i style={{ background: '#ff8a57' }} /><span /></div>
                    <div className="tile"><i style={{ background: '#7f95ee' }} /><span /></div>
                    <div className="tile"><i style={{ background: '#9ccc6a' }} /><span /></div>
                    <div className="abtn">Launch</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hcta">
          <div className="rowc">
            <span className="fact">{hero.facts[0].value}</span>
            <span className="fact">{hero.facts[3].value}</span>
          </div>
          <p>{hero.facts[1].value}. {hero.facts[2].value}.</p>
        </div>
        <Link className="ghost-link hbook" href="/#contact" onClick={(e) => { e.preventDefault(); scrollToTarget('#contact'); }}>
          <i /><span>Book a free call</span><i />
        </Link>
        <div className="cue" aria-hidden="true"><span>Scroll</span><i /></div>
      </div>

      {/* postcard that the scene shrinks into */}
      <div className="over" aria-hidden="true">
        <div className="cardp">
          <div className="olc">
            <div className="top"><small>Student app · started at 13</small><b>One Last Chapter</b></div>
            <div className="books">
              <i style={{ background: '#ff8a57' }} /><i style={{ background: '#7f95ee' }} /><i style={{ background: '#f5c84a' }} />
            </div>
            <div className="stat"><small>Monthly revenue</small><b>About INR 1,00,000</b></div>
            <p className="sr-only">{olc?.description}</p>
          </div>
        </div>
        <div className="frame" />
      </div>
    </section>
  );
}
