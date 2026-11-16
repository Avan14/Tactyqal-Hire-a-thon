import { testimonials } from '@/content/site';
import { Reveal } from '../reveal';

export function Testimonials() {
  return (
    <section className="sec" aria-labelledby="say-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="say-title">
            What Our Students Say
          </h2>
        </div>
        <ul className="split-body grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-6">
          {testimonials.map((t) => (
            <li key={t.name} className="row">
              <figure className="flex flex-col gap-3">
                <blockquote className="quote">“{t.quote}”</blockquote>
                <figcaption className="small">{t.name}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
