"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { HERO, RIDES } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import { useLoaded } from "@/components/loader";
import ProgressiveBlur from "@/components/effects/progressive-blur";
import SpiralGallery from "@/components/effects/spiral-gallery";

/**
 * The hero.
 *
 * One viewport. The work spirals through the middle and is driven by scroll;
 * everything else is furniture pinned to the corners: the studio statement
 * bottom-left in mono and the numbers as a column on the right at mid-height.
 * Nothing decorative that looks like a control: the reference's play mark was
 * dropped rather than shipped as a button that does nothing.
 * There is no large headline here on purpose —
 * neither reference has one — so the page's h1 is the statement itself.
 */
export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const loaded = useLoaded();

  useGSAP(
    () => {
      if (!loaded) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const q = gsap.utils.selector(root);
      const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
      // The scrub writes `opacity` on the furniture and the cards themselves,
      // so the intro animates their children and never fights it.
      tl.from(q("[data-hero-fade] > *"), { y: 14, opacity: 0, duration: 1, stagger: 0.06 });
      tl.from(q("[data-spiral-card] > *"), { opacity: 0, duration: 1.2, stagger: 0.05 }, 0);

      const backstop = window.setTimeout(() => {
        if (tl.progress() < 1) tl.progress(1);
      }, 6000);
      return () => window.clearTimeout(backstop);
    },
    { scope: root, dependencies: [loaded] },
  );

  const lede2 = HERO.lede2.replace(" No boring shit.", "");

  return (
    <section ref={root} data-hero className="gradient-paper text-ink relative">
      <SpiralGallery
        rides={RIDES}
        onProgress={(p) => {
          // The corner furniture belongs to the pinned screen. Take it out in
          // the last stretch of the scrub so nothing scrolls away over the mark.
          const fade = p < 0.86 ? 1 : Math.max(0, 1 - (p - 0.86) / 0.1);
          root.current
            ?.querySelectorAll<HTMLElement>("[data-hero-fade]")
            .forEach((el) => (el.style.opacity = fade.toFixed(3)));
        }}
      />

      {/*
        Progressive blur. The lowest cards of the helix dissolve into
        the foot of the viewport rather than being cut by it.
      */}
      <ProgressiveBlur edge="bottom" height="14em" />

      {/* Bottom-left statement, in mono. */}
      <h1
        data-hero-fade
        className="label pointer-events-none absolute bottom-[var(--corner)] left-[var(--corner)] z-[41] max-w-[300px]"
      >
        <span className="block">{HERO.eyebrow}</span>
        <span className="block opacity-70">{HERO.lede}</span>
        <span className="block opacity-70">{lede2}</span>
        <span className="block">No boring shit.</span>
      </h1>

      {/* Right column at mid-height: the numbers. */}
      <ul
        data-hero-fade
        className="pointer-events-none absolute top-1/2 right-[var(--corner)] z-[41] flex -translate-y-1/2 flex-col items-end max-tablet:hidden"
      >
        {HERO.stats.map((stat) => (
          <li key={stat.value} className="label relative">
            <span>
              {stat.value} <span className="opacity-65">{stat.label}</span>
            </span>
          </li>
        ))}
      </ul>

    </section>
  );
}
