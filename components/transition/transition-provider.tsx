"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";

import { gsap, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/components/effects/smooth-scroll";
import { useLoaded } from "@/components/loader";
import { WIPE_CLIPS, bandMetrics } from "./curved-wipe";

type TransitionContextValue = {
  /** Cover the screen, navigate, then wipe away. Falls back to a plain push. */
  navigate: (href: string) => void;
  isBusy: boolean;
};

const TransitionContext = createContext<TransitionContextValue | null>(null);

export function useTransition() {
  const ctx = useContext(TransitionContext);
  if (!ctx) {
    throw new Error("useTransition must be used inside <TransitionProvider>");
  }
  return ctx;
}

/**
 * How long to wait for a phase before continuing without it. Longer than
 * either timeline (cover 0.9s, reveal 1.15s) with room for a slow route.
 */
const GUARD_MS = 3000;

/** Cover: the band climbs from below the fold until the screen is its. */
const COVER_S = 0.9;
/** Reveal: it keeps climbing, and the new page comes out from under it. */
const REVEAL_S = 1.15;

export default function TransitionProvider({
  children,
  chrome,
}: {
  children: ReactNode;
  /**
   * Fixed furniture: the header, the progress rail. Rendered outside the
   * animated wrapper, because a transformed ancestor turns `position: fixed`
   * into scroll-following and the header would slide away mid-transition.
   */
  chrome?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const loaded = useLoaded();

  const wrapRef = useRef<HTMLDivElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);

  /** Which clip the next navigation takes. The two alternate, strictly. */
  const clipRef = useRef(0);
  /** Set while the screen is covered and we are waiting on the new route. */
  const pendingRef = useRef<string | null>(null);
  /**
   * The reveal currently playing, and the function that finishes it. A second
   * navigation started mid-reveal has to stop the first one before it runs its
   * own cover: otherwise two timelines drive the same band, and the stale one's
   * terminal `set` parks it off-screen halfway through the new cover, showing
   * the reader the page swap.
   */
  const revealRef = useRef<gsap.core.Timeline | null>(null);
  const settleRef = useRef<(() => void) | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /*
   * The clips are only wanted once someone can actually click a link, and they
   * are several megabytes between them, so they stay unfetched until the intro
   * has finished rather than competing with it for bandwidth. By the time a
   * first navigation happens they are buffered, which is why the band never
   * shows its ink backstop in practice.
   */
  useEffect(() => {
    if (!loaded) return;
    for (const video of videoRefs.current) {
      if (!video) continue;
      video.preload = "auto";
      video.load();
    }
  }, [loaded]);

  /**
   * Lay the band out for the current viewport and put it wherever the phase
   * about to run needs it to start.
   *
   * The media inside is counter-translated by exactly the band's own `x`, at
   * matching duration and ease, which pins the footage to the viewport while
   * the band slides over it. So the curve reads as a shutter opening onto a
   * shot that was already running, not as a video sliding up the screen: the
   * difference between the two is most of the effect.
   */
  const layout = useCallback(() => {
    const band = bandRef.current;
    const media = mediaRef.current;
    if (!band || !media) return null;

    const m = bandMetrics(window.innerWidth, window.innerHeight);
    gsap.set(band, { width: m.width, height: m.height, yPercent: -50 });

    /*
     * Dome on the leading edge only: the right-hand one, since the band
     * travels left to right. The trailing edge stays square, so the reveal
     * runs the full width of the screen with no dead travel.
     *
     * The vertical radius is 50%, which with a band exactly two radii tall
     * makes the edge a true semicircle of `m.radius` rather than an ellipse.
     *
     * Assigned to the element rather than through `gsap.set`, which is not
     * optional: GSAP's CSS parser drops the `/ vertical` half of a two-axis
     * border-radius shorthand. That still renders a dome (the missing axis
     * silently falls back) so nothing looks broken, it is just the wrong arc.
     * Setting it here keeps both axes.
     */
    band.style.borderRadius = `0 ${m.radius}px ${m.radius}px 0 / 0 50% 50% 0`;
    // `yPercent` rather than a CSS translate, so GSAP owns the whole transform
    // and the `x` tweens below cannot blow the centring away.
    gsap.set(media, {
      width: window.innerWidth,
      height: window.innerHeight,
      yPercent: -50,
    });
    return m;
  }, []);

  /** Start whichever clip is next in the rotation, from its first frame. */
  const rollFilm = useCallback(() => {
    const index = clipRef.current;
    clipRef.current = (index + 1) % WIPE_CLIPS.length;

    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      gsap.set(video, { autoAlpha: i === index ? 1 : 0 });
      if (i !== index) {
        video.pause();
        return;
      }
      video.currentTime = 0;
      // Muted and inline, and this is downstream of a click, so the play
      // promise resolves, but a rejected one must not break the navigation.
      void video.play().catch(() => {});
    });
  }, []);

  const stopFilm = useCallback(() => {
    for (const video of videoRefs.current) video?.pause();
  }, []);

  /* ---------------------------------------------------------------------
   * Cover. The band starts a full screen off to the left and crosses until its
   * apex sits one sagitta past the right edge: the extra being what it takes
   * for the corners, which the dome reaches last, to go under.
   * ------------------------------------------------------------------- */
  const cover = useCallback(() => {
    const tl = gsap.timeline();
    const m = layout();
    const band = bandRef.current;
    const media = mediaRef.current;
    if (!m || !band || !media) return tl;

    rollFilm();

    tl.set(band, { autoAlpha: 1, x: m.before });
    tl.set(media, { x: -m.before });

    tl.to(band, { x: m.covered, duration: COVER_S, ease: "brand" }, 0);
    tl.to(media, { x: -m.covered, duration: COVER_S, ease: "brand" }, 0);

    return tl;
  }, [layout, rollFilm]);

  /* ---------------------------------------------------------------------
   * Reveal. The band carries on in the same direction and leaves by the right
   * edge, so the wipe is one continuous travel interrupted by the route swap
   * rather than a cover that backs out the way it came.
   * ------------------------------------------------------------------- */
  const reveal = useCallback(() => {
    const tl = gsap.timeline();
    // Re-measure rather than reuse the cover's numbers: the screen is fully
    // covered at this point, so a window resized mid-transition can be taken
    // account of here without anything showing.
    const m = layout();
    const band = bandRef.current;
    const media = mediaRef.current;
    const wrap = wrapRef.current;
    if (!m || !band || !media) return tl;

    // Reveal the incoming page. Done synchronously rather than as a timeline
    // step: if the ticker is asleep (a backgrounded tab throttles rAF to
    // nothing) a queued `set` would leave the page invisible until the reader
    // came back.
    if (wrap) gsap.set(wrap, { autoAlpha: 1 });

    tl.to(band, { x: m.after, duration: REVEAL_S, ease: "brand" }, 0);
    tl.to(media, { x: -m.after, duration: REVEAL_S, ease: "brand" }, 0);

    // The incoming page's h1 wipes in from the left as the band leaves, on the
    // same left-to-right gesture every reveal on the site runs: see
    // `components/effects/reveal.tsx`. The vertical inset keeps ascenders and
    // descenders outside the clip.
    const heading = wrap?.querySelector("h1, [data-page-heading]");
    if (heading) {
      tl.fromTo(
        heading,
        { clipPath: "inset(-0.35em 100% -0.35em 0)", xPercent: -4 },
        {
          clipPath: "inset(-0.35em 0% -0.35em 0)",
          xPercent: 0,
          ease: "expo.out",
          duration: 1,
        },
        0.45,
      );
    }

    tl.set(band, { autoAlpha: 0 });
    tl.call(stopFilm);

    return tl;
  }, [layout, stopFilm]);

  const navigate = useCallback(
    (href: string) => {
      if (pendingRef.current) return;

      // A hash or query on the current path does not change `pathname`, so the
      // reveal effect would never fire and the band would sit there forever.
      // Those navigations go straight through.
      const target = href.split("#")[0].split("?")[0];
      if (target === pathname) {
        router.push(href);
        return;
      }

      if (reducedMotion.current) {
        router.push(href);
        return;
      }

      // Interrupting a reveal is allowed; leaving it running is not.
      revealRef.current?.kill();
      revealRef.current = null;
      settleRef.current?.();
      settleRef.current = null;

      pendingRef.current = href;
      setIsBusy(true);
      document.documentElement.setAttribute("data-transitioning", "");

      // Prefetching during the cover is free time (by the time the band has
      // finished climbing the route is usually already in the client cache.
      router.prefetch(href);

      const tl = cover();

      // The push happens when the cover finishes) or when the guard fires,
      // whichever comes first. Without the guard a timeline that never
      // completes (a tab backgrounded mid-transition suspends rAF, so GSAP
      // stops advancing) would leave `pendingRef` set forever and every later
      // link click would be swallowed.
      let committed = false;
      const commit = () => {
        if (committed) return;
        committed = true;
        window.clearTimeout(guard);
        tl.kill();

        // Hidden until the reveal shows it, so the new route cannot be glimpsed
        // past the band's shoulders before its own intro runs.
        if (wrapRef.current) gsap.set(wrapRef.current, { autoAlpha: 0 });
        router.push(href);
      };

      const guard = window.setTimeout(commit, GUARD_MS);
      tl.eventCallback("onComplete", commit);
    },
    [cover, pathname, router],
  );

  // The new route has committed. Reset the scroll position under the band,
  // then wipe it away. `pathname` only changes once React has rendered the new
  // page, so there is nothing half-painted underneath when this runs.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || pending.split("#")[0] !== pathname) return;

    pendingRef.current = null;
    // Lenis may still be easing towards the old page's target; reset it too.
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();

    const tl = reveal();
    revealRef.current = tl;

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(guard);
      revealRef.current = null;
      settleRef.current = null;
      setIsBusy(false);
      document.documentElement.removeAttribute("data-transitioning");
      stopFilm();
      // Belt and braces: the page must be visible and the band gone whether the
      // reveal ran to completion or was cut short.
      if (wrapRef.current) {
        gsap.set(wrapRef.current, { autoAlpha: 1, clearProps: "transform" });
      }
      if (bandRef.current) gsap.set(bandRef.current, { autoAlpha: 0 });
      ScrollTrigger.refresh();
    };

    const guard = window.setTimeout(settle, GUARD_MS);
    settleRef.current = settle;
    tl.eventCallback("onComplete", settle);

    return () => {
      window.clearTimeout(guard);
      tl.kill();
    };
  }, [pathname, reveal, stopFilm]);

  return (
    <TransitionContext.Provider value={{ navigate, isBusy }}>
      {chrome}

      {/*
        One stacking context for the whole page, so nothing inside it (however
        high its own z-index) can paint over the menu or the band. Isolation
        does not affect fixed positioning, so ScrollTrigger's pins are unmoved.
      */}
      <div ref={wrapRef} data-page-wrap id="main" className="relative z-[1] isolate">
        {children}
      </div>

      <div className="transition-overlay" aria-hidden>
        {/*
          The band. Sized and positioned entirely by GSAP: the arc's radius is
          a function of viewport width, so leaving it to CSS would mean
          repeating the same constant in two places and letting them drift.
          Ink underneath the footage, so a clip that fails to load still covers.
        */}
        <div ref={bandRef} className="wipe__band">
          <div ref={mediaRef} className="wipe__media">
            {WIPE_CLIPS.map((clip, i) => (
              <video
                key={clip.src}
                ref={(el) => {
                  videoRefs.current[i] = el;
                }}
                className="wipe__video"
                src={clip.src}
                muted
                playsInline
                preload="none"
                aria-hidden
                tabIndex={-1}
              />
            ))}
          </div>
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
