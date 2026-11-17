import { benefits, pricing } from '@/content/site';
import { Pops } from '../motion/pops';
import { Fade, Float, Lines } from '../motion/reveal';
import { GiantWord, GrowthRise } from './stats-motion';

/** The track record and the 1:1 promise, as the live site states them. */
export function Stats() {
  const outcomes = [...pricing.includes.filter((i) => i !== '8 weeks of 1:1 mentoring'), 'Pitch & presentation skills'];
  return (
    <>
      <GrowthRise />
      <section className="st bg-blue" data-hdr="light" style={{ minHeight: '150vh', paddingTop: '6vh' }} aria-labelledby="track-title">
        <Pops zone="stats" />
        <Lines
          as="h2"
          id="track-title"
          className="big disp"
          style={{ fontSize: 'min(15vw,28vh)' }}
          lines={['50+', 'successful', 'students']}
          lineClasses={['text-lime']}
        />
        <Fade as="p" className="lead relative z-2 mt-[4vh] max-w-[40ch]">{benefits[2].text}</Fade>
        <Float speed={0.7} className="float" style={{ ['--fc' as string]: 'var(--color-lime)', right: '12vw', top: '26%' }}>
          <div className="ph g5"><div className="bar">Student app</div><div className="lines"><span /><span /></div></div>
        </Float>
        <Lines
          as="p"
          className="big disp mt-[20vh]"
          style={{ fontSize: 'min(7vw,12vh)' }}
          lines={['1:1 personalized', 'mentoring.', 'No group classes.']}
          lineClasses={[undefined, undefined, 'text-lime']}
        />
      </section>
      <section className="st bg-orange" data-hdr="dark" style={{ minHeight: '160vh' }} id="why" aria-labelledby="outcomes-title">
        <Fade as="p" className="eyebrow mb-[4vh]" id="outcomes-title">What your teen walks away with</Fade>
        <Lines as="ul" className="big disp" style={{ fontSize: 'min(6.5vw,11vh)' }} lines={outcomes} />
        <GiantWord word="Launched." />
      </section>
    </>
  );
}
