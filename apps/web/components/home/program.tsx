import { program } from '@/content/site';
import { Reveal } from '../reveal';
import { ProgramTimeline } from './program-timeline';

export function Program() {
  return (
    <section className="sec bg-orange on-orange" id="program" aria-labelledby="program-title">
      <Reveal className="wrap split">
        <div className="split-head">
          <h2 className="h2" id="program-title">
            {program.title}
          </h2>
        </div>
        <div className="split-body flex flex-col gap-8">
          <p className="small self-start border-4 border-black bg-black px-6 py-4 text-white shadow-[8px_8px_0_0_#fff]">
            {program.banner}
          </p>
          <ProgramTimeline stages={program.stages} />
        </div>
      </Reveal>
    </section>
  );
}
