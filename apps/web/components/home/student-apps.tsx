import { studentApps } from '@/content/site';
import { Reveal } from '../reveal';

export function StudentApps() {
  return (
    <section className="sec bg-purple on-purple" id="stories" aria-labelledby="stories-title">
      <Reveal className="wrap flex flex-col gap-10">
        <h2 className="h2" id="stories-title">
          Real Students. Real Apps. Real Success.
        </h2>
        <ul className="grid grid-cols-[repeat(auto-fit,minmax(min(320px,100%),1fr))] gap-6">
          {studentApps.map((app) => (
            <li key={app.name} className="card flex flex-col gap-2">
              <h3 className="h3">{app.name}</h3>
              <p>{app.description}</p>
              {app.detail && (
                <p className="small mt-auto border-t-2 border-black pt-4">{app.detail}</p>
              )}
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
