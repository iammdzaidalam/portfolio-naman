"use client";

import { HERO, SITE, WORKS, workCover } from "@/lib/content";
import WorkCard from "@/components/work/work-card";
import Reveal from "@/components/effects/reveal";
import SpreadLabel from "@/components/effects/spread-label";
import TransitionLink from "@/components/transition/transition-link";

/**
 * The work.
 *
 * The section label sticks to the top and spreads its letters across the page
 * as you scroll, then gathers in the right corner. Below it the pieces run in
 * two columns that are deliberately out of step: the right column starts with
 * the page's one large statement and each item carries a different top offset,
 * so the eye moves down the page in a zigzag rather than a grid. Every item is
 * a tiny mono caption, a sentence-case title, then the image.
 */

/** Alternating aspect ratios and offsets, so no two neighbours align. */
const SHAPES = [
  { aspect: "aspect-[4/3]", offset: "mt-[8vh]" },
  { aspect: "aspect-[3/4]", offset: "mt-[18vh]" },
  { aspect: "aspect-[1/1]", offset: "mt-[4vh]" },
  { aspect: "aspect-[4/3]", offset: "mt-[22vh]" },
  { aspect: "aspect-[3/4]", offset: "mt-[10vh]" },
  { aspect: "aspect-[4/3]", offset: "mt-[14vh]" },
];

function WorkItem({
  work,
  shape,
  index,
}: {
  work: (typeof WORKS)[number];
  shape: (typeof SHAPES)[number];
  index: number;
}) {
  const cover = workCover(work);

  return (
    <TransitionLink
      href={`/work/${work.slug}`}
      className={`group block ${shape.offset} ${index % 2 ? "w-[82%] justify-self-end" : "w-[88%]"} max-tablet:w-full`}
      // When the two columns collapse into one, the items interleave in
      // their original order with the statement second, instead of one whole
      // column followed by the other.
      style={{ order: index === 0 ? 0 : index + 1 }}
    >
      <p className="label-xs opacity-60 transition-[color,opacity] duration-300 group-hover:text-accent group-hover:opacity-100">
        ({String(index + 1).padStart(2, "0")})
      </p>
      <Reveal as="h3" splitLines={false} className="statement mt-[10px] text-[22px]">
        {work.title}
      </Reveal>
      <div className={`relative mt-[18px] overflow-hidden ${shape.aspect}`}>
        <WorkCard cover={cover} sizes="(max-width: 992px) 100vw, 44vw" />
      </div>
    </TransitionLink>
  );
}

export default function Works() {
  const featured = WORKS.slice(0, 6);
  const left = featured.filter((_, i) => i % 2 === 0);
  const right = featured.filter((_, i) => i % 2 === 1);

  // The section starts where the running head sticks, so the label never has
  // to jump to its sticky offset and the first row clears it.
  return (
    <section className="text-ink relative px-[var(--gutter)] pt-[calc(var(--corner)+56px)] pb-[10vh]">
      <SpreadLabel>Work</SpreadLabel>

      <div className="mt-[10vh] grid grid-cols-2 gap-x-[4vw] max-tablet:grid-cols-1">
        <div className="grid content-start max-tablet:contents">
          {left.map((work, i) => (
            <WorkItem key={work.slug} work={work} shape={SHAPES[i * 2]} index={i * 2} />
          ))}
        </div>

        <div className="grid content-start max-tablet:contents">
          {/* The one large statement on the page. */}
          <Reveal as="p" className="display mt-[4vh] max-w-[9em] text-[clamp(34px,3.4vw,52px)]" style={{ order: 1 }}>
            {HERO.headline[0]} {HERO.headline[1]}
          </Reveal>

          {right.map((work, i) => (
            <WorkItem key={work.slug} work={work} shape={SHAPES[i * 2 + 1]} index={i * 2 + 1} />
          ))}
        </div>
      </div>

      {/* The closing row: link, count, mark. */}
      <div className="mt-[16vh] grid grid-cols-2 items-baseline gap-x-[4vw] max-tablet:grid-cols-1 max-tablet:gap-y-[1em]">
        <TransitionLink
          href="/work"
          className="statement group text-[clamp(28px,3vw,44px)] opacity-60 transition-opacity duration-300 hover:opacity-100"
        >
          View all <span aria-hidden className="transition-colors duration-300 group-hover:text-accent">↳</span>
        </TransitionLink>
        <div className="flex items-baseline justify-between">
          <span className="label opacity-60">({String(WORKS.length).padStart(2, "0")})</span>
          <span className="label opacity-60">{SITE.copyright.replace("Social Yatri", "").trim()}</span>
        </div>
      </div>
    </section>
  );
}
