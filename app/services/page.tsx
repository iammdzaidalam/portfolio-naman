import type { Metadata } from "next";
import Image from "next/image";

import { RIDES, SERVICES, SERVICES_INTRO } from "@/lib/content";
import { StickyTab, StickyTabGroup } from "@/components/effects/sticky-tabs";
import SectionHead from "@/components/ui/section-head";
import Reveal from "@/components/effects/reveal";
import RouteSteps from "@/components/sections/route-steps";
import MarqueeStrip from "@/components/sections/marquee-strip";
import TransitionLink from "@/components/transition/transition-link";

export const metadata: Metadata = {
  title: "Services",
  description: SERVICES_INTRO.sub,
};

/** What each stop actually involves, beyond the one-liner. */
const DETAIL: Record<string, string[]> = {
  "Social Media": [
    "Content pillars built around your audience, not a template.",
    "A posting rhythm that fits how you actually work.",
    "Community management that sounds like you in the replies.",
  ],
  Content: [
    "Formats chosen for the platform, not resized after the fact.",
    "Hooks written to survive the first second of a scroll.",
    "Enough volume to learn from, not one hero post a month.",
  ],
  Video: [
    "Shoot days planned around a shot list, not vibes.",
    "Edits cut for sound-off viewing first.",
    "Vertical, horizontal and stills out of the same day.",
  ],
  Strategy: [
    "Where the brand is losing people right now, and why.",
    "What the audience already follows and saves.",
    "A plan with a number attached to it.",
  ],
  Branding: [
    "A visual system that survives being cropped to a thumbnail.",
    "A voice you can hand to someone else and still sound like you.",
    "Templates the team can actually use.",
  ],
  "Organic Growth": [
    "Reach, saves and shares tracked as the leading signals.",
    "More of what worked, less of what didn’t, monthly.",
    "Growth that compounds instead of spiking and dying.",
  ],
  "Personal Branding": [
    "One-to-one, built around the founder’s actual calendar.",
    "A point of view worth following, not just a posting habit.",
    "Content that survives you being busy for a week.",
  ],
};

/** The ride that shows each stop best, as an index into `RIDES`. */
const SAMPLE: Record<string, number> = {
  "Social Media": 2,
  Content: 0,
  Video: 1,
  Strategy: 3,
  Branding: 7,
  "Organic Growth": 5,
  "Personal Branding": 4,
};

export default function ServicesPage() {
  return (
    <main>
      <section className="text-ink px-[var(--gutter)] pt-[calc(var(--corner)+96px)] pb-[1.5em]">
        <SectionHead
          marker={SERVICES_INTRO.sign}
          title={SERVICES_INTRO.question}
          sub={SERVICES_INTRO.sub}
          titleAs="h1"
          size="xl"
        />
      </section>

      {/*
        Sticky Section Tabs by Osmo. Each stop's header pins under the site
        header and the next arrives on top of it, so the list reads as a stack
        of tabs. The header row shares its grid with the services index on the
        home page — index, name, tag — and each body puts a still in the marker
        column and the copy on the headline's axis, so the page keeps one grid.
      */}
      <StickyTabGroup>
        {SERVICES.map((service) => {
          const ride = RIDES[SAMPLE[service.name]];

          return (
            <StickyTab
              key={service.no}
              className="text-ink"
              header={
                <div className="surface-paper border-ink/15 grid grid-cols-[4em_1fr_10em] items-baseline gap-[1.5em] border-y px-[var(--gutter)] py-[0.9em] max-tablet:grid-cols-[3em_1fr]">
                  <span className="label opacity-60">({service.no})</span>
                  <h2 className="display text-[clamp(26px,4vw,60px)]">{service.name}</h2>
                  <span className="label justify-self-end opacity-60 max-tablet:hidden">
                    {service.tag}
                  </span>
                </div>
              }
            >
              <div className="grid grid-cols-[42%_1fr] gap-[4vw] px-[var(--gutter)] pt-[2.5em] pb-[5em] max-tablet:grid-cols-1 max-tablet:gap-[2.5em]">
                {/* A ride that came out of this stop, in colour. */}
                <TransitionLink
                  href={`/work/${ride.slug}`}
                  mode="shutter"
                  className="group block"
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    <Image
                      src={ride.frame}
                      alt=""
                      fill
                      sizes="(max-width: 992px) 100vw, 42vw"
                      className="object-cover transition-transform duration-[1100ms] group-hover:scale-[1.03]"
                      style={{ transitionTimingFunction: "var(--ease-osmo)" }}
                    />
                  </div>
                  <p className="label-xs mt-[14px] flex justify-between gap-[1em] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                    <span>{ride.title}</span>
                    <span className="group-hover:text-accent transition-colors duration-300">
                      {ride.views} ↗
                    </span>
                  </p>
                </TransitionLink>

                <div>
                  <p className="statement max-w-[14em] text-[clamp(20px,2.4vw,34px)] opacity-70">
                    {service.desc}
                  </p>

                  <ul className="mt-[2.5em] max-w-[30em]">
                    {DETAIL[service.name].map((line) => (
                      <li key={line} className="rule border-t py-[0.9em]">
                        <Reveal
                          as="span"
                          splitLines={false}
                          className="block text-[1.0625em] opacity-60"
                        >
                          {line}
                        </Reveal>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StickyTab>
          );
        })}
      </StickyTabGroup>

      <MarqueeStrip />
      <RouteSteps />
    </main>
  );
}
