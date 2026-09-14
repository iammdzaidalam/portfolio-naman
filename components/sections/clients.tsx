"use client";

import Image from "next/image";

import { CLIENTS } from "@/lib/content";
import { REELS } from "@/lib/reels";
import ReelStrip from "@/components/work/reel-strip";
import type { ReelKey } from "@/lib/reels";
import Reveal from "@/components/effects/reveal";
import SectionHead from "@/components/ui/section-head";

/**
 * The client results.
 *
 * The client gave two worked case studies with real figures rather than
 * quotes, so this is set as editorial: claim at display size, the story
 * beneath it, and the numbers ruled off on their own so they can be read
 * without reading the prose. Every figure here is theirs; where they gave no
 * number, none is shown.
 *
 * Each case keeps the page's two-column opening (label and still at 42%, the
 * argument on the headline's axis) so it sits on the same grid as every other
 * section rather than reading as a separate template.
 */
/** A brand's clips, or nothing at all if that folder yielded none. */
const reelsFor = (key?: ReelKey) => (key ? (REELS[key] ?? []) : []);

export default function Clients({ surface = "ink" }: { surface?: "ink" | "paper" }) {
  const ink = surface === "ink";

  return (
    <section
      data-surface={ink ? "ink" : undefined}
      className={`${ink ? "surface-ink text-paper" : "text-ink"} relative px-[var(--gutter)] py-[7em]`}
    >
      <SectionHead
        marker={CLIENTS.sign}
        title={CLIENTS.question}
        sub={CLIENTS.sub}
        className="mb-[3em]"
      />

      <div className="grid grid-cols-[42%_1fr] gap-[4vw] max-tablet:grid-cols-1">
        <div />
        <div className="max-w-[34em]">
          {CLIENTS.body.map((paragraph) => (
            <Reveal key={paragraph} as="p" className="mt-[1em] text-[1.0625em] opacity-70">
              {paragraph}
            </Reveal>
          ))}
        </div>
      </div>

      <div className="mt-[5em]">
        {CLIENTS.cases.map((study, index) => (
          <article
            key={study.name}
            className="rule grid grid-cols-[42%_1fr] gap-[4vw] border-t pt-[1.5em] pb-[5em] max-tablet:grid-cols-1 max-tablet:gap-[2em]"
          >
            <div>
              <p className="label opacity-60">
                ({String(index + 1).padStart(2, "0")}) {study.name}
              </p>

              <div className="relative mt-[1.5em] aspect-[4/5] w-full max-w-[420px] overflow-hidden max-tablet:max-w-none">
                <Image
                  src={study.frame}
                  alt={study.alt}
                  fill
                  sizes="(max-width: 992px) 100vw, 34vw"
                  className="object-cover"
                />
              </div>
            </div>

            <div>
              <Reveal as="h3" className="display max-w-[11em] text-[clamp(26px,3.4vw,52px)]">
                {study.claim}
              </Reveal>

              <div className="mt-[1.5em] max-w-[34em]">
                {study.intro.map((paragraph) => (
                  <Reveal
                    key={paragraph}
                    as="p"
                    className="mt-[1em] text-[1.0625em] opacity-70"
                  >
                    {paragraph}
                  </Reveal>
                ))}
              </div>

              {/* The figures, given room of their own. */}
              <div className="mt-[3em] grid grid-cols-2 gap-x-[2.5vw] gap-y-[1.5em] max-mobile:grid-cols-1">
                {study.metrics.map((metric) => (
                  <div key={metric.label} className="rule border-t pt-[1.1em]">
                    <p className="label opacity-60">{metric.label}</p>
                    <p className="display mt-[0.5em] text-[clamp(24px,2.6vw,40px)]">
                      {metric.value}
                    </p>
                    <p className="mt-[1em] text-[0.9375em] opacity-60">{metric.note}</p>
                  </div>
                ))}
              </div>

              <div className="mt-[3em] grid grid-cols-2 gap-[2.5vw] max-mobile:grid-cols-1">
                <div>
                  <p className="label opacity-60">What we did</p>
                  <ul className="mt-[0.5em]">
                    {study.did.map((item) => (
                      <li key={item} className="rule border-b py-[0.6em] text-[0.9375em] opacity-70">
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="label opacity-60">The result</p>
                  {study.result.map((paragraph) => (
                    <p key={paragraph} className="mt-[1em] text-[0.9375em] opacity-70">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {reelsFor(study.reels).length ? (
              <div className="col-span-2 max-tablet:col-span-1">
                <ReelStrip
                  reels={reelsFor(study.reels)}
                  title={`${study.name}: the reels`}
                />
              </div>
            ) : null}
          </article>
        ))}
      </div>

      {/* The client's closing pitch. */}
      <div className="rule grid grid-cols-[42%_1fr] gap-[4vw] border-t pt-[2.5em] max-tablet:grid-cols-1 max-tablet:gap-[2em]">
        <div>
          <Reveal as="p" className="display max-w-[8em] text-[clamp(28px,3.4vw,52px)]">
            {CLIENTS.closing.title[0]}
          </Reveal>
          <Reveal
            as="p"
            className="display text-accent max-w-[8em] text-[clamp(28px,3.4vw,52px)]"
          >
            {CLIENTS.closing.title[1]}
          </Reveal>
        </div>

        <div className="max-w-[34em]">
          {CLIENTS.closing.body.map((paragraph) => (
            <Reveal key={paragraph} as="p" className="mt-[1em] text-[1.0625em] opacity-70">
              {paragraph}
            </Reveal>
          ))}

          <p className="label mt-[2.5em] opacity-60">{CLIENTS.closing.goalsLead}</p>
          {/*
            One goal per line, as the client set them. Run together on a wrapped
            row they read as a single run-on sentence and the repetition of
            "More" (which is the whole rhetorical point) stops landing.
          */}
          <ul className="mt-[0.75em]">
            {CLIENTS.closing.goals.map((goal) => (
              <li key={goal} className="rule statement border-t py-[0.5em] text-[1.25em]">
                {goal}
              </li>
            ))}
          </ul>
          <p className="mt-[1.5em] text-[1.0625em] opacity-70">
            {CLIENTS.closing.goalsClose}
          </p>
        </div>
      </div>
    </section>
  );
}
