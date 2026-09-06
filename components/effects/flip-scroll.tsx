"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { Flip, gsap } from "@/lib/gsap";

/**
 * Scaling Element on Scroll (GSAP Flip) by Osmo
 * [https://www.osmo.supply/resource/scaling-element-on-scroll-gsap-flip]
 *
 * `[data-flip-element="wrapper"]` elements are waypoints. A single
 * `[data-flip-element="target"]` lives inside the first of them and, as you
 * scroll, `Flip.fit` retargets it onto each waypoint in turn — so one element
 * appears to grow, shrink and travel across the page.
 *
 * The two details that make it work, both from the resource:
 *
 * - Each leg's `duration` is the pixel distance between the two waypoints'
 *   document-space vertical *centres*. Feeding pixels in as seconds makes the
 *   timeline's internal proportions match the page's, so a scrubbed playhead
 *   moves the target at a constant rate no matter how unevenly the waypoints
 *   are spaced. `ease: "none"` for the same reason.
 * - `Flip.fit` is called with only `duration` and `ease`. Without `scale: true`
 *   it animates width and height, so waypoints of different aspect ratios
 *   resize the target rather than stretching its contents.
 *
 * Both elements sit in normal document flow, so the offset `Flip.fit` records
 * between them is scroll-invariant and the fit holds at any scroll position.
 */
export default function FlipScrollScene({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      const wrapperElements = gsap.utils.toArray<HTMLElement>(
        scope.querySelectorAll('[data-flip-element="wrapper"]'),
      );
      const targetEl = scope.querySelector<HTMLElement>(
        '[data-flip-element="target"]',
      );
      if (wrapperElements.length < 2 || !targetEl) return;

      // Reduced motion: the frame lands in its last waypoint at once, and the
      // interstitial section hides itself with `motion-reduce:hidden`.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        Flip.fit(targetEl, wrapperElements[wrapperElements.length - 1]);
        return;
      }

      let tl: gsap.core.Timeline | null = null;

      const flipTimeline = () => {
        if (tl) {
          tl.scrollTrigger?.kill();
          tl.kill();
          gsap.set(targetEl, { clearProps: "all" });
        }

        // First and last waypoints bracket the scroll range.
        tl = gsap.timeline({
          scrollTrigger: {
            trigger: wrapperElements[0],
            start: "center center",
            endTrigger: wrapperElements[wrapperElements.length - 1],
            end: "center center",
            scrub: 0.25,
          },
        });

        wrapperElements.forEach((element, index) => {
          const nextIndex = index + 1;
          if (nextIndex >= wrapperElements.length) return;

          const nextWrapperEl = wrapperElements[nextIndex];
          // Document-space vertical centres, so the leg length is the real
          // scroll distance between the two waypoints.
          const nextRect = nextWrapperEl.getBoundingClientRect();
          const thisRect = element.getBoundingClientRect();
          const nextDistance =
            nextRect.top + window.scrollY + nextWrapperEl.offsetHeight / 2;
          const thisDistance =
            thisRect.top + window.scrollY + element.offsetHeight / 2;
          const offset = nextDistance - thisDistance;

          tl!.add(
            Flip.fit(targetEl, nextWrapperEl, {
              duration: offset,
              ease: "none",
            }) as gsap.core.Tween,
          );
        });
      };

      flipTimeline();

      // Waypoint geometry is measured once, so anything that reflows the
      // page — a width change, the webfont, late images — rebuilds every leg.
      let resizeTimer: number | undefined;
      let lastWidth = window.innerWidth;
      const rebuild = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(flipTimeline, 100);
      };
      const onResize = () => {
        // Height-only changes (a phone's address bar) leave the geometry alone.
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        rebuild();
      };
      window.addEventListener("resize", onResize);
      window.addEventListener("load", rebuild);
      document.fonts.ready.then(rebuild);

      return () => {
        window.clearTimeout(resizeTimer);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("load", rebuild);
        tl?.scrollTrigger?.kill();
        tl?.kill();
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}
