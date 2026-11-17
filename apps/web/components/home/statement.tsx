import { hero, studentApps } from '@/content/site';
import { Fade, Float, Lines } from '../motion/reveal';
import { Shot } from './shot';

/** The live site's hero promise, set as a poster statement. */
export function Statement() {
  const support = hero.support.split('•').map((s) => s.trim());
  const krishi = studentApps.find((a) => a.name === 'KrishiDrishti')!;
  const converza = studentApps.find((a) => a.name === 'Converza')!;
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
      <Float speed={0.6} className="float" style={{ left: '4vw', top: '14%' }}>
        <Shot src={krishi.screenshots[0]} alt="KrishiDrishti, a student app" sizes="20vw" />
      </Float>
      <Float speed={1} className="float" style={{ ['--fc' as string]: 'var(--color-blue)', right: '4vw', top: '62%' }}>
        <Shot src={converza.screenshots[0]} alt="Converza, a student app" sizes="20vw" />
      </Float>
    </section>
  );
}
