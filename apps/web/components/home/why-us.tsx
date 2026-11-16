import { benefits } from '@/content/site';
import { Reveal } from '../reveal';

export function WhyUs() {
  return (
    <section className="sec bg-white" id="why" aria-labelledby="why-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="why-title">
            Why Parents Choose Tactyqal Labs
          </h2>
        </div>
        <ul className="split-body rows">
          {benefits.map((b) => (
            <li key={b.title} className="row flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <span className="h3">{b.title}</span>
              <span>{b.text}</span>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
