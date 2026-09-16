"use client";

import { useCallback, useEffect, useRef, useSyncExternalStore, type RefObject } from "react";
import { useGSAP } from "@gsap/react";

import type { ShowreelClip } from "@/lib/reels";
import { gsap } from "@/lib/gsap";
import { useMediaViewer, type ViewerItem } from "@/components/effects/media-viewer";

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
  clips,
  onProgress,
  soundRef,
}: {
  clips: ShowreelClip[];
  /** Called with the scrub position, 0 at the top of the pin, 1 at release. */
  onProgress?: (p: number) => void;
  /**
   * The hero's sound switch, read by each card at the moment it starts. A ref
   * rather than a value so flipping it does not re-render nine videos.
   */
  soundRef?: RefObject<boolean>;
}) {
  const viewer = useMediaViewer();
  // The whole reel goes to the viewer, so the arrows there move through it.
  const items = clips.map<ViewerItem>((clip) => ({
    kind: "video",
    src: clip.src,
    poster: clip.poster,
    alt: clip.alt,
    w: clip.w,
    h: clip.h,
  }));
  // Kept in a ref so the scrub's onUpdate always calls the latest callback
  // without the timeline having to be rebuilt; synced in an effect rather than
  // during render, which React's ref rules forbid.
  const progressRef = useRef(onProgress);
  useEffect(() => {
    progressRef.current = onProgress;
  }, [onProgress]);
  const root = useRef<HTMLDivElement>(null);
  const scene = useRef<HTMLDivElement>(null);
  /*
   * The helix holds still while a card is being watched. Without it the clip
   * you pointed at rotates away mid-shot, which makes the hover feel like a
   * mistake rather than a control.
   */
  const loopRef = useRef<gsap.core.Tween | null>(null);

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
      loopRef.current = loop;

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
          {clips.map((clip, i) => (
            <ShowreelCard
              key={clip.src}
              clip={clip}
              index={i}
              total={clips.length}
              soundRef={soundRef}
              onOpen={() => viewer.open(items, i, "Showreel")}
              onWatch={(watching) => {
                if (watching) loopRef.current?.pause();
                else loopRef.current?.play();
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * One card on the helix: the clip, and the furniture that names it.
 *
 * Hovering plays it in place, with the sound the hero's switch says. A click
 * opens it full screen in the viewer with the rest of the reel behind the
 * arrows, which is also the whole story on a touch screen, where there is no
 * hover. A click used to latch the clip playing inside the card; for footage
 * cut to fill a phone, a 300px card was the wrong place to leave it.
 *
 * `onWatch` tells the helix to hold still while this card is being watched.
 */
function ShowreelCard({
  clip,
  index,
  total,
  soundRef,
  onOpen,
  onWatch,
}: {
  clip: ShowreelClip;
  index: number;
  total: number;
  soundRef?: RefObject<boolean>;
  onOpen: () => void;
  onWatch: (watching: boolean) => void;
}) {
  const video = useRef<HTMLVideoElement>(null);

  const reduced = useSyncExternalStore(
    useCallback((notify: () => void) => {
      const query = window.matchMedia("(prefers-reduced-motion: reduce)");
      query.addEventListener("change", notify);
      return () => query.removeEventListener("change", notify);
    }, []),
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );

  useEffect(() => {
    if (reduced) video.current?.pause();
  }, [reduced]);

  /*
   * Plays with the sound the switch asks for and falls back to muted. A
   * browser only permits unmuted playback once the page has had a real user
   * gesture, and a hover is not one, so before the first click this plays
   * silently rather than not at all.
   */
  const play = async () => {
    const el = video.current;
    if (!el) return;
    el.muted = soundRef ? !soundRef.current : false;
    try {
      await el.play();
    } catch {
      el.muted = true;
      try {
        await el.play();
      } catch {
        /* leave the poster showing */
      }
    }
  };

  const start = () => {
    if (reduced) return;
    onWatch(true);
    void play();
  };
  const stop = () => {
    onWatch(false);
    video.current?.pause();
  };
  const open = () => {
    // The card's own copy stops before the viewer's starts, or the same clip
    // plays twice, one of them behind the scrim.
    video.current?.pause();
    onOpen();
  };

  return (
    <button
      type="button"
      data-spiral-card
      onClick={open}
      onMouseEnter={start}
      onMouseLeave={stop}
      onFocus={start}
      onBlur={stop}
      aria-label={`Open full screen: ${clip.alt}`}
      /*
       * 9:16, the shape the footage was cut in, so nothing is cropped off a
       * frame built for a phone. The width is three quarters of what the old
       * 3:4 card had, which keeps the card the same height on the helix.
       */
      className="group bg-ink absolute top-0 left-0 block aspect-[9/16] w-[min(19.5vw,300px)] cursor-pointer overflow-hidden will-change-transform select-none max-tablet:w-[29vw] max-mobile:w-[40vw]"
      style={{ backfaceVisibility: "hidden" }}
    >
      <video
        ref={video}
        poster={clip.poster}
        muted
        loop
        playsInline
        preload="none"
        tabIndex={-1}
        aria-hidden
        className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.04]"
        style={{ transitionTimingFunction: "var(--ease-brand)" }}
      >
        <source src={clip.src} type="video/mp4" />
      </video>

      {/*
        The furniture is white and the footage is not reliably dark behind it, so
        this scrim darkens only the two bands the text occupies and leaves the
        middle of the frame alone.
      */}
      <div
        aria-hidden
        className="from-ink/60 to-ink/70 pointer-events-none absolute inset-0 bg-gradient-to-b via-transparent via-35%"
      />

      <div className="text-paper pointer-events-none absolute inset-0 flex flex-col justify-between p-[1em] max-mobile:p-[0.75em]">
        <div className="label-xs flex justify-end max-mobile:text-[clamp(11px,0.75vw,13px)]">
          <span>
            {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
          </span>
        </div>

        <div>
          <div className="display text-[clamp(15px,2.45vw,38px)] uppercase">
            {clip.title}
          </div>
          {/*
            A still frame with no affordance reads as an image, not a clip, so
            the card says it can be watched. It clears on hover, because by
            then the motion says it for itself.
          */}
          <span className="label-xs mt-[0.75em] flex items-center gap-[0.5em] opacity-80 transition-opacity duration-300 group-hover:opacity-0">
            <span className="border-paper/70 flex h-[18px] w-[18px] items-center justify-center rounded-full border text-[8px] leading-none">
              ▶
            </span>
            Watch
          </span>
        </div>
      </div>
      <span className="sr-only">{`${index + 1} of ${total}`}</span>
    </button>
  );
}
