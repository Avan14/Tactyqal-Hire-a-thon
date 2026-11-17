import { hero } from '@/content/site';
import { Fade, Float, Lines } from '../motion/reveal';

/** The live site's hero promise, set as a poster statement. */
export function Statement() {
  const support = hero.support.split('•').map((s) => s.trim());
  return (
    <section className="st bg-cream" data-hdr="dark" style={{ minHeight: '130vh' }} aria-labelledby="promise-title">
      <Fade as="p" className="eyebrow relative z-2 mb-[4vh] text-blue">Why parents come to us</Fade>
      <Lines
        as="h2"
        id="promise-title"
        className="big disp text-blue"
        lines={['Empower your kid', 'to build the next app', 'that impacts millions.']}
        lineClasses={[undefined, undefined, 'text-orange']}
      />
      <Fade as="ul" className="relative z-2 mt-[6vh] flex max-w-[52ch] flex-wrap justify-center gap-x-3 gap-y-2">
        {support.map((s) => (
          <li key={s} className="chip pointer-events-none">{s}</li>
        ))}
      </Fade>
      <Float speed={0.6} className="float" style={{ left: '6vw', top: '18%' }}>
        <div className="ph g3"><div className="bar">Idea</div><div className="lines"><span /><span /><span /></div></div>
      </Float>
      <Float speed={1} className="float" style={{ ['--fc' as string]: 'var(--color-blue)', right: '7vw', top: '58%', width: 'clamp(100px,9vw,150px)' }}>
        <div className="ph g1" style={{ ['--ar' as string]: '1' }}><div className="bar">Launch</div><div className="lines"><span /><span /></div></div>
      </Float>
    </section>
  );
}
