import { site, tools } from '@/content/site';
import { Reveal } from '../reveal';

export function Tools() {
  return (
    <section className="sec bg-white" id="tools" aria-labelledby="tools-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="tools-title">
            {tools.title}
          </h2>
          <p className="measure">{tools.intro}</p>
          <a className="link inline-flex min-h-11 items-center" href={site.toolsUrl}>
            Access All Tools Free
          </a>
        </div>
        <ul className="split-body grid grid-cols-[repeat(auto-fit,minmax(min(300px,100%),1fr))] gap-x-6">
          {tools.items.map((name) => (
            <li key={name} className="row h3">
              {name}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
