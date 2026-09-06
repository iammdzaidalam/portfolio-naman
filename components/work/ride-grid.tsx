"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";

import { RIDES, WORK_FILTERS } from "@/lib/content";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import OptionWheel from "@/components/effects/option-wheel";
import TransitionLink from "@/components/transition/transition-link";
import Poster from "./poster";

const LABELS = WORK_FILTERS.map((filter) => filter.label);

/**
 * The work wall, filtered by React Bits' OptionWheel.
 *
 * The wheel replaces a row of pills. It earns the swap because the categories
 * are a single-choice list read top to bottom, which is the shape the wheel is
 * for, and it holds the eye on one axis while the grid re-forms beside it.
 *
 * Below 992px it is dropped for a plain list: the wheel owns the wheel event
 * in order to spin, which on a small screen means a full-width strip that
 * swallows the page scroll.
 */
export default function RideGrid() {
  const [filter, setFilter] = useState<string>("all");
  const grid = useRef<HTMLDivElement>(null);

  // A ride belongs to a filter by its category or by any word in its tag, so
  // "Hospitality" and "Food" find the rides that carry them in the tag line.
  const visible = useMemo(() => {
    if (filter === "all") return RIDES;
    const label = WORK_FILTERS.find((item) => item.id === filter)?.label.toLowerCase() ?? "";
    return RIDES.filter(
      (ride) => ride.category === filter || ride.tag.toLowerCase().includes(label),
    );
  }, [filter]);

  // The grid changes height with the filter; everything measured below it
  // (the footer's reveals) has to be told.
  useEffect(() => {
    ScrollTrigger.refresh();
  }, [filter]);

  useGSAP(
    () => {
      if (!grid.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      gsap.from(grid.current.children, {
        opacity: 0,
        yPercent: 6,
        duration: 0.8,
        ease: "expo.out",
        stagger: { amount: 0.35 },
      });
    },
    { scope: grid, dependencies: [filter], revertOnUpdate: true },
  );

  return (
    <div className="grid grid-cols-[20em_1fr] items-start gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[2em]">
      <div className="sticky top-[calc(var(--nav-height)+1.5em)] max-tablet:static">
        {/* Indented to the wheel's own inset, so the label and the
            selected option share a left edge. */}
        <p className="label mb-[0.75em] pl-[40px] opacity-60">Filter</p>

        {/*
          The wheel sizes its rows in `rem`, the untouched 16px root, while this
          column is in `em` derived from the viewport. Set large — it is the
          page's one control, not a caption — in a column just wide enough for
          the longest entry at 992px, where the two scales are furthest apart.
          Any wider and the wall loses the width it needs.
        */}
        <div
          className="h-[17em] max-tablet:hidden"
          // The options nearest the edge are still legible when they reach it,
          // so the box fades them out rather than cutting them in half.
          style={{
            maskImage:
              "linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent)",
            WebkitMaskImage:
              "linear-gradient(to bottom, transparent, #000 20%, #000 80%, transparent)",
          }}
        >
          <OptionWheel
            items={LABELS}
            defaultSelected={0}
            side="left"
            inset={40}
            fontSize={2.1}
            spacing={1.35}
            tilt={8}
            curve={1}
            blur={0.5}
            fade={0.12}
            minOpacity={0.28}
            textColor="rgba(20,20,20,0.45)"
            activeColor="#ffc72c"
            // The vendored root carries `outline-none`, which both removes the
            // outline and pins `--tw-outline-style: none` — so a width utility
            // alone still resolves to `outline-style: none`. `outline-solid`
            // is what puts the keyboard focus ring back.
            className="focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            onChange={(index) => setFilter(WORK_FILTERS[index].id)}
          />
        </div>

        <p className="label mt-[0.75em] pl-[40px] opacity-60 max-tablet:hidden">
          ({String(visible.length).padStart(2, "0")} / {String(RIDES.length).padStart(2, "0")})
        </p>

        <div className="hidden flex-wrap gap-x-[1.25em] gap-y-[0.4em] max-tablet:flex">
          {WORK_FILTERS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setFilter(item.id)}
              aria-pressed={filter === item.id}
              className={`label transition-[opacity,color] duration-300 ${
                filter === item.id ? "text-accent opacity-100" : "opacity-60 hover:opacity-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="statement text-[1.25em] opacity-70">
          Nothing on this route yet. Pick another stop.
        </p>
      ) : null}

      <div
        ref={grid}
        // An odd last ride takes the whole row as a wide frame instead of
        // leaving an empty cell beside it.
        className="grid grid-cols-2 gap-x-[1.5em] gap-y-[3.5em] max-mobile:grid-cols-1 [&>a:last-child:nth-child(odd)]:col-span-2 [&>a:last-child:nth-child(odd)>div:first-child]:aspect-[21/9] max-mobile:[&>a:last-child:nth-child(odd)]:col-span-1 max-mobile:[&>a:last-child:nth-child(odd)>div:first-child]:aspect-[4/3]"
      >
        {visible.map((ride, index) => (
          <TransitionLink
            key={ride.slug}
            href={`/work/${ride.slug}`}
            mode="shutter"
            className="group block"
          >
            <div className="relative aspect-[4/3] overflow-hidden">
              <Poster ride={ride} sizes="(max-width: 768px) 100vw, 40vw" />
            </div>

            <div className="rule mt-[0.9em] flex items-baseline justify-between border-t pt-[0.7em]">
              <span className="label opacity-60 transition-[color,opacity] duration-300 group-hover:text-accent group-hover:opacity-100">{ride.tag}</span>
              <span className="label opacity-60">
                ({String(index + 1).padStart(2, "0")})
              </span>
            </div>

            <h3 className="statement mt-[0.35em] text-[clamp(20px,2.1vw,32px)]">
              {ride.title}
            </h3>
            <p className="label mt-[0.5em] opacity-60">{ride.views}</p>
          </TransitionLink>
        ))}
      </div>
    </div>
  );
}
