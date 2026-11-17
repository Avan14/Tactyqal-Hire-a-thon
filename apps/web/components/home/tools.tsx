import { site, tools } from '@/content/site';
import { Fade, Lines } from '../motion/reveal';

export function Tools() {
  return (
    <section className="bg-lime" id="tools" data-hdr="dark" aria-labelledby="tools-title">
      <div className="tools">
        <div className="flex flex-col gap-[3vh]">
          <p className="eyebrow">Not ready to book?</p>
          <Lines as="h2" id="tools-title" className="disp" style={{ fontSize: 'min(9vw,16vh)' }} lines={['Free tools', 'to get', 'started.']} />
          <p className="lead max-w-[36ch]">{tools.intro}.</p>
          <a href={site.toolsUrl} target="_blank" rel="noopener noreferrer" className="pill btn-ink self-start" style={{ background: 'var(--color-ink)', color: 'var(--color-lime)' }}>
            Access all tools free →
          </a>
        </div>
        <Fade as="ul" className="chips" aria-label="Free tools">
          {tools.items.map((t) => (
            <li key={t.name}>
              <a href={t.href} target="_blank" rel="noopener noreferrer">
                {t.name} <span aria-hidden="true">↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
          ))}
        </Fade>
      </div>
    </section>
  );
}
