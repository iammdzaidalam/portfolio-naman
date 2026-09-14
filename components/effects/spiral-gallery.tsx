"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import Image from "next/image";

import type { Ride } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import TransitionLink from "@/components/transition/transition-link";

/**
 * The spiral.
 *
 * Every poster sits on a helix: card `i` is `i` steps around the axis and `i`
 * steps down it. Scrolling advances the whole helix by `N - 1` steps, so each
 * card in turn arrives at the front, flat to the viewer, while the ones either
 * side are turned away like pages of a carousel. The section is pinned for the
 * duration and the motion is scrubbed, so the helix is exactly as far along as
 * the reader is.
 *
 * It also turns on its own. The helix wraps modulo the card count, which makes
 * it endless, and a looping tween walks it forward whenever the section is on
 * screen (so the spiral is alive before anybody touches the page, and scroll
 * steers something already in motion rather than starting it.
 *
 * The scene is translated back by the helix radius so the front card sits at
 * z = 0) at the perspective's natural size: rather than being blown up by
 * being nearer the camera than the page.
 */

/** Degrees between neighbouring cards around the axis. */
const STEP_DEG = 45;
/** Vertical distance between neighbouring cards, in viewport-height units. */
const PITCH_VH = 22;
const PITCH_VH_MOBILE = 30;
/** Radius of the helix, as a fraction of the viewport width. */
const RADIUS_VW = 0.34;
const RADIUS_VW_MOBILE = 0.62;
/**
 * The gap the helix keeps between neighbouring cards, as a multiple of a card's
 * width. The radius is raised until the chord between two neighbours clears
 * this, so a card that is wide relative to its viewport (which is every card
 * on a phone) pushes the helix open instead of overlapping the cards beside it.
 */
const CLEARANCE = 1.08;
/** Cards this far round the back are hidden rather than drawn mirrored. */
const HIDE_BEYOND_DEG = 118;
const HIDE_BEYOND_DEG_MOBILE = 96;
/** How much scroll the pinned section consumes, per card. */
const SCROLL_PER_CARD_VH = 55;
/**
 * Seconds a card takes to hand its place to the next one while nobody is
 * scrolling. Slow enough to read as drift rather than as a carousel advancing.
 */
const SECONDS_PER_CARD = 4.5;

export default function SpiralGallery({
  rides,
  onProgress,
}: {
  rides: Ride[];
  /** Called with the scrub position, 0 at the top of the pin, 1 at release. */
  onProgress?: (p: number) => void;
}) {
  // Kept in a ref so the scrub's onUpdate always calls the latest callback
  // without the timeline having to be rebuilt; synced in an effect rather than
  // during render, which React's ref rules forbid.
  const progressRef = useRef(onProgress);
  useEffect(() => {
    progressRef.current = onProgress;
  }, [onProgress]);
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const wrap = root.current;
      const stage = scene.current;
      if (!wrap || !stage) return;

      const cards = gsap.utils.toArray<HTMLElement>(stage.querySelectorAll("[data-spiral-card]"));
      const count = cards.length;
      if (!count) return;

      // Two independent contributions to the same helix: `p` is how far the
      // reader has scrolled through the pin, `drift` is the loop that runs on
      // its own. They are summed, so scrolling steers a spiral that is already
      // turning instead of fighting it.
      const state = { p: 0 };
      const drift = { v: 0 };

      const layout = () => {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const mobile = vw < 768;

        // The card's rendered width is an input, not an assumption: the chord
        // between two neighbours has to clear it or the spiral collides.
        const cardW = cards[0].offsetWidth || vw * 0.3;
        const minRadius =
          (cardW * CLEARANCE) / (2 * Math.sin((STEP_DEG * Math.PI) / 360));
        const radius = Math.max(vw * (mobile ? RADIUS_VW_MOBILE : RADIUS_VW), minRadius);
        const pitch = (vh * (mobile ? PITCH_VH_MOBILE : PITCH_VH)) / 100;
        const hideBeyond = mobile ? HIDE_BEYOND_DEG_MOBILE : HIDE_BEYOND_DEG;

        stage.style.transform = `translateZ(${-radius}px)`;

        cards.forEach((card, i) => {
          /*
           * Position along the helix, in card-steps, relative to the front,
           * wrapped into a window centred on zero so the spiral has no ends.
           *
           * The wrap is what makes the loop possible: without it `drift` would
           * march every card off the bottom of the helix and never bring one
           * back. A card crosses the seam at +/- count/2 steps, which at 45
           * degrees a step is far beyond the angle at which cards are already
           * hidden, so the recycling is never seen.
           */
          let t = i - state.p * (count - 1) - drift.v;
          t = ((t % count) + count) % count;
          if (t > count / 2) t -= count;
          const angle = t * STEP_DEG;
          const y = t * pitch;
          const visible = Math.abs(angle) < hideBeyond;

          // Cards further round the helix recede in opacity as well as depth,
          // which is what stops the back of the spiral reading as clutter.
          const fade = 1 - Math.min(1, Math.abs(angle) / hideBeyond) * 0.75;

          card.style.transform =
            `translate(-50%, -50%) translateY(${y.toFixed(1)}px) ` +
            `rotateY(${angle.toFixed(2)}deg) translateZ(${radius.toFixed(1)}px) ` +
            `rotate(${(t * 1.6).toFixed(2)}deg)`;
          card.style.opacity = visible ? fade.toFixed(3) : "0";
          card.style.visibility = visible ? "visible" : "hidden";
          card.style.zIndex = String(Math.round(1000 - Math.abs(angle) * 10));
        });

        progressRef.current?.(state.p);
      };

      layout();

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;

      // The loop. One full cycle is `count` steps, and because the wrap above
      // is modulo `count`, the tween restarting at zero lands on exactly the
      // position it left, so the repeat is seamless.
      const loop = gsap.to(drift, {
        v: count,
        duration: count * SECONDS_PER_CARD,
        ease: "none",
        repeat: -1,
        onUpdate: layout,
      });

      // Pin the hero section itself when there is one, so the corner
      // furniture and the blur that sit around the spiral hold with it.
      const pinEl = wrap.closest<HTMLElement>("[data-hero]") ?? wrap;

      gsap.to(state, {
        p: 1,
        ease: "none",
        scrollTrigger: {
          trigger: pinEl,
          pin: pinEl,
          start: "top top",
          // ScrollTrigger reads a bare number as px and has no vh unit, so the
          // distance is resolved here; `invalidateOnRefresh` re-resolves it.
          end: () => `+=${(count * SCROLL_PER_CARD_VH * window.innerHeight) / 100}`,
          scrub: 0.6,
          invalidateOnRefresh: true,
          // The side navigation only exists while the spiral is on screen, and
          // so does the loop: a helix turning in a section nobody is looking at
          // is a rAF callback and nine style writes a frame, for nothing.
          onToggle: (self) => {
            document.documentElement.toggleAttribute("data-spiral-active", self.isActive);
            if (self.isActive) loop.play();
            else loop.pause();
          },
        },
        onUpdate: layout,
      });

      let timer: number | undefined;
      const onResize = () => {
        window.clearTimeout(timer);
        timer = window.setTimeout(layout, 100);
      };
      window.addEventListener("resize", onResize);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        loop.kill();
        document.documentElement.removeAttribute("data-spiral-active");
      };
    },
    { scope: root },
  );

  return (
    <div ref={root} className="relative h-dvh w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{ perspective: "1400px", perspectiveOrigin: "50% 50%" }}
      >
        <div
          ref={scene}
          className="absolute top-1/2 left-1/2 h-0 w-0"
          style={{ transformStyle: "preserve-3d" }}
        >
          {rides.map((ride, i) => (
            <TransitionLink
              key={ride.slug}
              href={`/work/${ride.slug}`}
              data-spiral-card
              className="group absolute top-0 left-0 block aspect-[3/4] w-[min(26vw,400px)] overflow-hidden bg-ink will-change-transform select-none max-tablet:w-[38vw] max-mobile:w-[52vw]"
              style={{ backfaceVisibility: "hidden" }}
              aria-label={`${ride.title}: ${ride.tag}`}
            >
              <Image
                src={ride.frame}
                alt=""
                fill
                sizes="(max-width: 768px) 52vw, (max-width: 992px) 38vw, 26vw"
                priority={i < 3}
                className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
                style={{
                  transitionTimingFunction: "var(--ease-brand)",
                  objectPosition: ride.focus,
                }}
                draggable={false}
              />

              {/*
                The furniture is white, and the photography is not reliably
                dark behind it: a pale sky or a white cyclorama swallowed the
                tag and the title whole. This scrim only darkens the two bands
                the text actually occupies, so the middle of the frame is left
                alone.
              */}
              <div
                aria-hidden
                className="from-ink/60 to-ink/70 pointer-events-none absolute inset-0 bg-gradient-to-b via-transparent via-35%"
              />

              {/*
                Poster furniture: tag top-left, stop number top-right, title at
                foot. Set a step below the page's own sizes on purpose. This
                type rides a moving, rotating card and sits over photography, so
                at the page's label size it competed with the picture instead of
                captioning it.
              */}
              <div className="text-paper absolute inset-0 flex flex-col justify-between p-[1em] max-mobile:p-[0.75em]">
                <div className="label-xs flex justify-between max-mobile:text-[10px]">
                  <span>{ride.tag.split(" · ")[0]}</span>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="display text-[clamp(15px,2.45vw,38px)] uppercase">
                  {ride.title}
                </div>
              </div>
            </TransitionLink>
          ))}
        </div>
      </div>
    </div>
  );
}
