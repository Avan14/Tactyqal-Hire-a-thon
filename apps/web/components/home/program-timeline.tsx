'use client';

import { useState } from 'react';
import type { ProgramStage } from '@/content/site';
import { PlusIcon } from '../icons';

/**
 * The signature interaction: an 8-week timeline where one stage is open at a
 * time. Each stage is a real button with aria-expanded/aria-controls, so it
 * works with keyboard and screen readers.
 */
export function ProgramTimeline({ stages }: { stages: ProgramStage[] }) {
  const [open, setOpen] = useState(0);

  return (
    <ol className="tl">
      {stages.map((stage, i) => {
        const isOpen = open === i;
        const panelId = `stage-${i + 1}`;
        return (
          <li
            key={stage.name}
            className="tl-item"
            data-open={isOpen}
            style={i === stages.length - 1 ? { paddingBottom: 0 } : undefined}
          >
            <span className="tl-dot" aria-hidden="true" />
            <h3 className="font-[inherit]">
              <button
                type="button"
                className="tl-btn"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? -1 : i)}
              >
                <span className="flex flex-col gap-0.5">
                  <span className="small">
                    Stage {i + 1} · {stage.weeks}
                  </span>
                  <span className="h3">{stage.name}</span>
                </span>
                <PlusIcon />
              </button>
            </h3>
            <div id={panelId} hidden={!isOpen}>
              {isOpen && (
                <div className="tl-panel flex flex-col gap-4">
                  {stage.points.map((point) => (
                    <p key={point}>{point}</p>
                  ))}
                  {stage.tools.length > 0 && (
                    <p className="small">Free tools for this stage: {stage.tools.join(' · ')}</p>
                  )}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
