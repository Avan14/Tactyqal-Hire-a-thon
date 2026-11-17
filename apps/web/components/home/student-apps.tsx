import { studentApps } from '@/content/site';
import { Pops } from '../motion/pops';
import { BigNumber, Fade, Float, Lines } from '../motion/reveal';
import { AppCards } from './app-cards';
import { Shot } from './shot';

const featured = [
  { name: 'One Last Chapter', age: '13', result: 'About INR 100,000 monthly revenue', bg: 'bg-orange', hdr: 'dark', numClass: '', fc: 'var(--color-ink)', g: 'g4', chip: 'bg-ink text-cream' },
  { name: 'Elenor Vegan Handbags', age: '16', result: 'INR 9,000 in its first week', bg: 'bg-blue', hdr: 'light', numClass: 'text-lime', fc: 'var(--color-lime)', g: 'g5', chip: 'bg-lime text-ink' },
];

/** Two featured student apps with their founders' ages, then the rest of the roster. */
export function StudentApps() {
  const rest = studentApps.filter((a) => !featured.some((f) => f.name === a.name));
  return (
    <>
      {featured.map((f, i) => {
        const app = studentApps.find((a) => a.name === f.name)!;
        return (
          <section key={f.name} className={`yb ${f.bg}`} id={i === 0 ? 'stories' : undefined} data-hdr={f.hdr} aria-labelledby={`showcase-${i}`}>
            <div className="l">
              <p className="eyebrow mb-[1vh]">Student showcase · 0{i + 1}</p>
              <BigNumber value={f.age} className={f.numClass} />
              <p className="agecap">years old when they started</p>
            </div>
            <div className="r" style={i === 1 ? { borderColor: 'rgba(244,241,232,.6)' } : undefined}>
              <Float speed={0.35} className="self-end mr-[4vw]" style={{ ['--fc' as string]: f.fc }}>
                <Shot src={app.screenshots[0]} alt={`${app.name}, the student's live app`} sizes="(max-width: 820px) 80vw, 32vw" />
              </Float>
              <div className="flex flex-col gap-[18px]">
                <Lines as="h3" id={`showcase-${i}`} className="disp" lines={[app.name]} />
                <Fade as="p">{app.description}</Fade>
                <Fade as="span" className={`badge self-start ${f.chip}`}>{f.result}</Fade>
              </div>
            </div>
          </section>
        );
      })}
      <section className="st bg-ink" data-hdr="light" style={{ minHeight: '100vh', paddingTop: '18vh' }} aria-labelledby="roster-title">
        <Pops zone="apps" />
        <Lines
          as="h2"
          id="roster-title"
          className="big disp"
          style={{ fontSize: 'min(12vw,22vh)' }}
          lines={['Real students.', 'Real apps.', 'Real success.']}
          lineClasses={[undefined, undefined, 'text-lime']}
        />
        <AppCards apps={rest} />
      </section>
    </>
  );
}
