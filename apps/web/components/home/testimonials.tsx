import { testimonials } from '@/content/site';
import { Fade, Lines } from '../motion/reveal';
import { Marquee } from './marquee';

export function Testimonials() {
  return (
    <>
      <section className="st bg-cream" data-hdr="dark" style={{ minHeight: 'auto', padding: '16vh 4vw 14vh' }} aria-labelledby="say-title">
        <Fade as="p" className="eyebrow mb-[3vh] text-blue">In their words</Fade>
        <Lines
          as="h2"
          id="say-title"
          className="big disp text-blue"
          style={{ fontSize: 'min(8vw,15vh)' }}
          lines={['What our', 'students say.']}
          lineClasses={[undefined, 'text-orange']}
        />
        <ul className="quotes">
          {testimonials.map((t, i) => (
            <Fade as="li" key={t.name} delay={(i % 3) * 0.08}>
              <figure className={`qcard h-full ${i % 3 === 2 ? 'blue' : ''}`}>
                <blockquote>“{t.quote}”</blockquote>
                <figcaption><i aria-hidden="true">{t.name.split(' ').map((w) => w[0]).join('')}</i><span><b>{t.name}</b><br />Student</span></figcaption>
              </figure>
            </Fade>
          ))}
        </ul>
      </section>
      <Marquee items={['No code', '1:1 mentor', 'Real revenue', '8 weeks', '15 spots a month']} />
    </>
  );
}
