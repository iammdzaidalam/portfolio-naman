import type { Metadata } from "next";
import Image from "next/image";

import { ABOUT, RIDES, SITE } from "@/lib/content";
import SectionHead from "@/components/ui/section-head";
import Reveal from "@/components/effects/reveal";
import Kolkata from "@/components/sections/kolkata";
import Team from "@/components/sections/team";
import Testimonials from "@/components/sections/testimonials";
import MarqueeStrip from "@/components/sections/marquee-strip";

export const metadata: Metadata = {
  title: "Studio",
  description: SITE.description,
};

/** The client's notes carry emoji; the words are the copy. */
const words = (note: string) =>
  note.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}]/gu, "").trim();

export default function StudioPage() {
  return (
    <main>
      <section className="text-ink px-[var(--gutter)] pt-[calc(var(--corner)+96px)] pb-[5em]">
        <SectionHead
          marker={ABOUT.sign}
          title={ABOUT.question}
          titleAs="h1"
          size="xl"
        />

        <div className="mt-[4em] grid grid-cols-[42%_1fr] items-start gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[2em]">
          <div>
            <Reveal
              as="p"
              className="statement max-w-[13em] text-[clamp(24px,3vw,44px)] line-through decoration-[0.06em] opacity-60"
            >
              {ABOUT.struck}
            </Reveal>
            <Reveal
              as="p"
              className="statement mt-[0.35em] max-w-[13em] text-[clamp(24px,3vw,44px)]"
            >
              {ABOUT.claim}
            </Reveal>
          </div>

          <div className="max-w-[32em]">
            {ABOUT.body.map((paragraph) => (
              <Reveal key={paragraph} as="p" className="mt-[1em] text-[1.0625em] opacity-70">
                {paragraph}
              </Reveal>
            ))}

            <div className="rule mt-[2.5em] flex flex-wrap gap-x-[1.5em] gap-y-[0.4em] border-t pt-[1em]">
              {ABOUT.annotations.map((note) => (
                <span key={note} className="label opacity-60">
                  {words(note)}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Two frames from the road, so the studio is seen and not only described. */}
      <section className="text-ink px-[var(--gutter)] pb-[7em]">
        <div className="grid grid-cols-[42%_1fr] items-end gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[2em]">
          <div className="w-full max-w-[420px] justify-self-end max-tablet:max-w-none max-tablet:justify-self-start">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={RIDES[6].frame}
                alt=""
                fill
                sizes="(max-width: 992px) 100vw, 30vw"
                className="object-cover"
              />
            </div>
            <p className="label-xs mt-[14px] opacity-60">( {words(ABOUT.annotations[1])} )</p>
          </div>

          <div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={RIDES[1].frame}
                alt=""
                fill
                sizes="(max-width: 992px) 100vw, 56vw"
                className="object-cover"
              />
            </div>
            <p className="label-xs mt-[14px] flex justify-between gap-[1em] opacity-60">
              <span>( {words(ABOUT.annotations[2])} )</span>
              <span>{SITE.city}</span>
            </p>
          </div>
        </div>
      </section>

      <MarqueeStrip />
      <Kolkata />
      <Team />
      <Testimonials surface="paper" />
    </main>
  );
}
