"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { WORKS, workCover } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import TransitionLink from "@/components/transition/transition-link";
import WorkCard from "./work-card";

/**
 * The work wall: the client's categories, one card each.
 *
 * There is no filter above it any more. The control used to sort nine pieces
 * by the shoot folder they came out of, which was the only grouping that
 * existed at the time. The categories are that grouping now, so a filter over
 * them would be a control that sorts categories by category.
 */
export default function WorkGrid() {
  const grid = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (!grid.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Left to right, like every other reveal on the site.
      gsap.from(grid.current.children, {
        opacity: 0,
        xPercent: -6,
        duration: 0.8,
        ease: "expo.out",
        stagger: { amount: 0.35 },
      });
    },
    { scope: grid },
  );

  return (
    <div
      ref={grid}
      // An odd last card takes the whole row as a wide frame instead of
      // leaving an empty cell beside it.
      className="grid grid-cols-3 gap-x-[1.5em] gap-y-[3.5em] max-tablet:grid-cols-2 max-mobile:grid-cols-1"
    >
      {WORKS.map((work, index) => {
        const cover = workCover(work);
        return (
          <TransitionLink
            key={work.slug}
            href={`/work/${work.slug}`}
            className="group block"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <WorkCard cover={cover} sizes="(max-width: 768px) 100vw, 30vw" />
            </div>

            <div className="rule mt-[0.9em] flex items-baseline justify-between border-t pt-[0.7em]">
              <h3 className="statement text-[clamp(18px,1.7vw,26px)] transition-colors duration-300 group-hover:text-accent">
                {work.title}
              </h3>
              <span className="label opacity-60">
                ({String(index + 1).padStart(2, "0")})
              </span>
            </div>
          </TransitionLink>
        );
      })}
    </div>
  );
}
