"use client";

import { GROWTH } from "@/lib/content";
import Counter from "@/components/effects/counter";
import SectionHead from "@/components/ui/section-head";

/** The numbers, set as large as the headline and ruled off from each other. */
export default function Growth() {
  return (
    <section className="text-ink relative px-[var(--gutter)] py-[7em]">
      <SectionHead
        marker={GROWTH.sign}
        title={GROWTH.question}
        sub={GROWTH.sub}
        className="mb-[4em]"
      />

      {/* Before / after, as one line of display type. */}
      <div className="rule flex flex-wrap items-baseline gap-[0.6em] border-t pt-[1.5em]">
        <span className="flex flex-col">
          <span className="label opacity-60">{GROWTH.before.label}</span>
          <span className="display text-[clamp(32px,5vw,80px)] opacity-40">
            {GROWTH.before.value}
          </span>
        </span>
        <span className="display self-end text-[clamp(32px,5vw,80px)] opacity-40">→</span>
        <span className="flex flex-col">
          <span className="label opacity-60">{GROWTH.after.label}</span>
          <span className="display text-[clamp(32px,5vw,80px)]">{GROWTH.after.value}</span>
        </span>
        <span className="label mb-[0.6em] opacity-60">{GROWTH.after.unit}</span>
        <span className="display text-accent ml-auto text-[clamp(32px,5vw,80px)]">
          {GROWTH.delta}
        </span>
      </div>

      <div className="mt-[3.5em] grid grid-cols-4 max-tablet:grid-cols-2 max-mobile:grid-cols-1">
        {GROWTH.cells.map((cell) => (
          <div key={cell.label} className="rule border-t pt-[1.1em] pr-[1.5em] pb-[2em]">
            <div className="display text-[clamp(30px,3.6vw,58px)]">
              <Counter target={cell.target} suffix={cell.suffix} />
            </div>
            <div className="label mt-[0.9em] opacity-40">{cell.label}</div>
          </div>
        ))}
      </div>

    </section>
  );
}
