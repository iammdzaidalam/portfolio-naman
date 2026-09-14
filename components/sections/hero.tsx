"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { HERO, SITE } from "@/lib/content";
import { SHOWREEL } from "@/lib/reels";
import { gsap } from "@/lib/gsap";
import { useLoaded } from "@/components/loader";
import ProgressiveBlur from "@/components/effects/progressive-blur";
import SpiralGallery from "@/components/effects/spiral-gallery";

/**
 * The hero.
 *
 * One viewport. The client's showreel spirals through the middle, driven by
 * scroll and by a slow loop of its own;
 * everything else is furniture pinned to the corners: the studio statement
 * bottom-left in mono and the numbers as a column on the right at mid-height.
 * Nothing decorative that looks like a control: the reference's play mark was
 * dropped rather than shipped as a button that does nothing.
 * There is no large headline here on purpose:
 * neither reference has one, so the page's h1 is the statement itself.
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

  return (
    <section ref={root} data-hero className="gradient-paper text-ink relative">
      <SpiralGallery
        clips={SHOWREEL}
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

      {/*
        Bottom-left statement, in three steps: marker, claim, signature.

        The claim is `.statement`, not `.display`. Display is tuned for the
        6.6vw page headings, and its 0.9 line-height and -0.035em tracking read
        as a cramped imitation of one at this size. Using the statement voice is
        what keeps this a corner block rather than a hero headline, which is the
        page's whole character: the work is the hero and the type is furniture.

        The cap is 56px, set against the cards rather than the viewport. The
        longer line sets around 478px there, which is why the block is capped at
        500px: the nearest card column begins about 540px from the left edge, so
        this is the largest the claim goes before the two start sharing space.

        The marker says what the agency does rather than announcing a stop. The
        four words are the client's own, from the line in their services section
        about combining content, strategy, branding, technology and performance.

        The break after "brands" is authored rather than left to the wrapper, so
        it sets as two lines at every width, and `<br />` keeps the accessible
        name one sentence.

        No accent anywhere in here. #ffc72c on paper is about 1.4:1 and would
        read as a printing fault, and the side nav's current-item tick is
        already accent on this same left rail: a second yellow mark a hundred
        pixels below it reads as two "you are here" flags.

        The 65% on the signature is near a hard floor rather than a taste call:
        ink at 60% on paper is 4.6:1 and passes AA at 14px, 55% is 4.0:1 and
        does not, and that line sits over the blur.

        The paper halo is phone-only. At 400px the spiral is 52vw wide and
        shares x-space with this block, so a card drifting low enough to pass
        behind line two gets a halo to separate against. It is invisible on
        paper at every other width.
      */}
      <h1
        data-hero-fade
        className="pointer-events-none absolute bottom-[var(--corner)] left-[var(--corner)] z-[41] max-w-[min(500px,calc(100vw_-_2*var(--corner)))] max-mobile:[text-shadow:0_0_16px_var(--paper)]"
      >
        <span className="label-xs mb-[1.6em] block">{HERO.eyebrow}</span>

        <span className="statement block text-[clamp(32px,3.8vw,56px)]">
          {HERO.lede[0]}
          <br />
          {HERO.lede[1]}
        </span>

        <span className="label mt-[1.55em] block opacity-65" lang="hi-Latn">
          {SITE.tagline}
        </span>
      </h1>


    </section>
  );
}
