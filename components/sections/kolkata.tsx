"use client";

import { KOLKATA } from "@/lib/content";
import SectionHead from "@/components/ui/section-head";

/**
 * Home turf: the claim, then four ruled columns of context. Set on ink, with
 * the client's "Next stop → Viral." sticker in yellow under the marker — the
 * one place on the page the brand colour is allowed to be a graphic.
 */
export default function Kolkata() {
  return (
    <section
      data-surface="ink"
      className="surface-ink text-paper px-[var(--gutter)] py-[7em]"
    >
      <SectionHead
        marker={KOLKATA.sign}
        aside={
          <span className="bg-accent text-ink label-xs inline-block px-[10px] py-[6px]">
            {KOLKATA.sticker}
          </span>
        }
        title={KOLKATA.question}
      />

      <div className="mt-[4em] grid grid-cols-4 gap-[1.5em] max-tablet:grid-cols-2 max-mobile:grid-cols-1">
        {KOLKATA.cards.map((card, index) => (
          <div key={card.title} className="rule border-t pt-[1.1em]">
            <span className="label opacity-60">
              ({String(index + 1).padStart(2, "0")})
            </span>
            <h3 className="statement mt-[1.5em] text-[1.25em]">{card.title}</h3>
            <p className="mt-[0.5em] text-[0.9375em] opacity-70">{card.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
