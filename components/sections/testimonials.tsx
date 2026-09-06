"use client";

import Image from "next/image";

import { RIDES, TESTIMONIALS } from "@/lib/content";
import Reveal from "@/components/effects/reveal";
import SectionHead from "@/components/ui/section-head";

/**
 * Testimonials as pull quotes rather than chat bubbles: the client's line at
 * display size, the studio's reply beneath it in mono. Same words, read as
 * editorial instead of as a screenshot.
 */
export default function Testimonials({ surface = "ink" }: { surface?: "ink" | "paper" }) {
  const ink = surface === "ink";

  return (
    <section
      data-surface={ink ? "ink" : undefined}
      className={`${ink ? "surface-ink text-paper" : "text-ink"} relative px-[var(--gutter)] py-[7em]`}
    >
      <SectionHead
        marker={TESTIMONIALS.sign}
        title={TESTIMONIALS.question}
        sub={TESTIMONIALS.sub}
        className="mb-[4em]"
      />

      <div className="rule border-t">
        {TESTIMONIALS.threads.map((thread, index) => (
          <div
            key={thread.client}
            className="rule grid grid-cols-[4em_1fr_26%] items-start gap-[1.5em] border-b py-[2.5em] max-tablet:grid-cols-1 max-tablet:gap-[0.75em]"
          >
            <span className="label opacity-60">
              ({String(index + 1).padStart(2, "0")})
            </span>

            <div>
              <Reveal as="p" className="statement max-w-[16em] text-[clamp(22px,3vw,44px)]">
                &ldquo;{thread.client}&rdquo;
              </Reveal>
              <p className="label mt-[1.25em] max-w-[34em] normal-case opacity-60">
                Social Yatri — {thread.us}
              </p>
            </div>

            {/* The ride the thread is about, as a still. */}
            <div className="relative aspect-[4/5] overflow-hidden max-tablet:hidden">
              <Image
                src={RIDES[[0, 2, 6][index % 3]].frame}
                alt=""
                fill
                sizes="26vw"
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
