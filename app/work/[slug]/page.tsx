import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { RIDES, SITE, WORK_FILTERS, ridePhoto } from "@/lib/content";
import { GALLERY } from "@/lib/gallery";
import { REELS } from "@/lib/reels";
import Poster from "@/components/work/poster";
import ShootViewer from "@/components/work/shoot-viewer";
import ReelStrip from "@/components/work/reel-strip";
import Reveal from "@/components/effects/reveal";
import BubbleButton from "@/components/effects/bubble-button";
import TransitionLink from "@/components/transition/transition-link";
import { Marker } from "@/components/ui/section-head";

type Params = { slug: string };

/** Every ride is known at build time, so the detail pages are static. */
export function generateStaticParams(): Params[] {
  return RIDES.map((ride) => ({ slug: ride.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const ride = RIDES.find((item) => item.slug === slug);
  if (!ride) return { title: "Not found" };

  return {
    title: ride.title,
    description: `${ride.title}. ${ride.tag}, by ${SITE.name}.`,
  };
}

export default async function RidePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const ride = RIDES.find((item) => item.slug === slug);
  if (!ride) notFound();

  const index = RIDES.indexOf(ride);
  const next = RIDES[(index + 1) % RIDES.length];
  const after = RIDES[(index + 2) % RIDES.length];
  const category = WORK_FILTERS.find((filter) => filter.id === ride.category);
  const shoot = GALLERY[ride.shoot];
  const reels = ride.reels ? (REELS[ride.reels] ?? []) : [];

  return (
    <main className="text-ink">
      <section className="px-[var(--gutter)] pt-[calc(var(--corner)+96px)] pb-[3em]">
        <Marker>{ride.tag}</Marker>

        <Reveal as="h1" className="display mt-[0.6em] text-[clamp(44px,8vw,140px)]">
          {ride.title}
        </Reveal>

      </section>

      {/*
        The shoot: one frame held large with the whole set beneath it. The
        piece's own frame opens the display, and choosing from the strip
        replaces it.
      */}
      <ShootViewer shoot={shoot} openingSrc={ride.frame} />

      <ReelStrip reels={reels} />

      {/* The facts, then the next two stops on the route. */}
      <section className="px-[var(--gutter)] pt-[3em] pb-[7em]">
        <dl className="grid grid-cols-3 max-mobile:grid-cols-1">
          {[
            { term: "Category", value: category?.label ?? "None" },
            { term: "Made in", value: SITE.city },
            {
              term: "Stop",
              value: `${String(index + 1).padStart(2, "0")} / ${String(RIDES.length).padStart(2, "0")}`,
            },
          ].map((item) => (
            <div key={item.term} className="rule border-t pt-[1em] pr-[1.5em] pb-[2em]">
              <dt className="label opacity-60">{item.term}</dt>
              <dd className="statement mt-[0.75em] text-[1.375em]">{item.value}</dd>
            </div>
          ))}
        </dl>

        {/*
          The still stands in for the reel; the real cut replaces `frame` on this
          ride's entry in lib/content.ts and nothing else changes.
        */}
        <div className="mt-[4em] grid grid-cols-2 gap-[4vw] max-mobile:grid-cols-1">
          {[next, after].map((ride) => (
            <TransitionLink
              key={ride.slug}
              href={`/work/${ride.slug}`}
              className="group block"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Poster photo={ridePhoto(ride)} sizes="(max-width: 767px) 100vw, 48vw" />
              </div>
              <p className="label-xs mt-[14px] flex justify-between gap-[1em] opacity-60 transition-opacity duration-300 group-hover:opacity-100">
                <span>{ride.title}</span>
                <span className="group-hover:text-accent transition-colors duration-300">
                  {ride.tag}
                </span>
              </p>
            </TransitionLink>
          ))}
        </div>

        <div className="mt-[4em] flex flex-wrap items-center gap-[1.5em]">
          <BubbleButton href="/work" invert>
            All work
          </BubbleButton>
          <TransitionLink
            href={`/work/${next.slug}`}
            className="label opacity-65 transition-opacity duration-300 hover:opacity-100"
          >
            Next · {next.title} ↗
          </TransitionLink>
        </div>
      </section>
    </main>
  );
}
