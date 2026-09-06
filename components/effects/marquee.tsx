"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * A seamless ticker whose direction flips with the scroll direction.
 *
 * The track holds two identical copies of the content and is wrapped with
 * `gsap.utils.wrap` over the width of one copy, so the loop has no seam and no
 * measurement of individual items is needed.
 */
export default function Marquee({
  children,
  speed = 60,
  className,
}: {
  children: ReactNode;
  /** Pixels per second at rest. */
  speed?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = root.current?.querySelector<HTMLElement>(".marquee-track");
      if (!track) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const measure = () => track.scrollWidth / 2;

      // The items are sized in `em` and the root font size is derived from the
      // viewport, so the width of one copy changes on resize and again when
      // the real face replaces the fallback. A wrap distance measured once
      // would drift out of step with the content and open a visible seam.
      let half = measure();
      let wrap = gsap.utils.wrap(-half, 0);
      // The direction is eased rather than flipped, so a change of scroll
      // direction turns the strip around instead of snapping it.
      const dir = { v: 1 };

      const tick = gsap.quickSetter(track, "x", "px");
      let offset = 0;

      const remeasure = () => {
        const next = measure();
        if (!next || next === half) return;
        // Carry the current position across as a proportion, so re-measuring
        // does not make the strip jump.
        offset = half ? (offset / half) * next : 0;
        half = next;
        wrap = gsap.utils.wrap(-half, 0);
      };

      const ticker = (_time: number, delta: number) => {
        offset -= ((speed * dir.v) / 1000) * delta;
        tick(wrap(offset));
      };

      gsap.ticker.add(ticker);

      const trigger = ScrollTrigger.create({
        onUpdate: (self) => {
          gsap.to(dir, { v: self.direction, duration: 0.6, ease: "power2.out", overwrite: true });
        },
      });

      let resizeTimer: number | undefined;
      const onResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(remeasure, 100);
      };
      window.addEventListener("resize", onResize);
      document.fonts.ready.then(remeasure);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        gsap.ticker.remove(ticker);
        trigger.kill();
      };
    },
    { scope: root, dependencies: [speed] },
  );

  return (
    <div ref={root} className={`overflow-hidden${className ? ` ${className}` : ""}`}>
      <div className="marquee-track" aria-hidden>
        {children}
        {children}
      </div>
    </div>
  );
}
