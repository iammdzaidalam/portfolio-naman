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
import { WIPE_CLIPS, bandMetrics, clipBox, tramRear } from "./curved-wipe";

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

/*
 * Cover, then leave. A page transition is a cost the reader pays on every
 * click, and the whole thing is held to about a second and a half.
 *
 * The cover is a sweep. What happens after it is the clip's business: the taxi
 * leaves once its exhaust has cleared, and the tram's rear edge drags the panel
 * off itself. Both of those are read off the video's own clock, so the panel
 * and the picture cannot drift apart. `EXIT_S` is the only tween on the way
 * out and it is the taxi's; the tram has no tween at all.
 */
const COVER_S = 0.5;
const EXIT_S = 0.45;
/** The tween used on the way out when a clip is not actually playing. */
const FALLBACK_S = 0.9;
/** How long to wait on the taxi's smoke before leaving regardless. */
const EXIT_WAIT_MS = 1700;

/**
 * Scroll to the element a hash names, with its top sat just under the fixed
 * nav so a sticky section header lands exactly where it sticks. Returns false
 * if there is no such element, so the caller can fall back to the top.
 */
function scrollToHash(hash: string, immediate: boolean): boolean {
  if (!hash || hash.length < 2) return false;
  const el = document.getElementById(decodeURIComponent(hash.slice(1)));
  if (!el) return false;
  // `--nav-height` is a calc(), so it has to be resolved by an element rather
  // than parsed off the string.
  const probe = document.createElement("div");
  probe.style.cssText = "position:absolute;visibility:hidden;pointer-events:none;height:var(--nav-height)";
  document.body.appendChild(probe);
  const nav = probe.offsetHeight;
  probe.remove();
  const top = el.getBoundingClientRect().top + window.scrollY - nav;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(top, { immediate, force: true, duration: immediate ? 0 : 1.1 });
  else window.scrollTo({ top, behavior: immediate ? "auto" : "smooth" });
  return true;
}

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
  /** Which one is on screen now, which the reveal needs and `clipRef` has already passed. */
  const playingRef = useRef(0);
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
  /** Stops whatever is driving the current reveal off the video's clock. */
  const revealStopRef = useRef<(() => void) | null>(null);
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
    playingRef.current = index;
    clipRef.current = (index + 1) % WIPE_CLIPS.length;

    videoRefs.current.forEach((video, i) => {
      if (!video) return;
      gsap.set(video, { autoAlpha: i === index ? 1 : 0 });
      if (i !== index) {
        video.pause();
        return;
      }
      video.playbackRate = WIPE_CLIPS[index].rate;
      video.currentTime = WIPE_CLIPS[index].start;
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
   * Leave. The band carries on in the same direction and goes by the right
   * edge, so the wipe is one continuous travel interrupted by the route swap
   * rather than a cover that backs out the way it came.
   *
   * How it goes depends on which clip is on it, and both are read off the
   * video's own clock rather than timed to match it:
   *
   *   taxi  The panel waits for the exhaust to clear (the frame goes black
   *         and comes back to white behind it, the swap the client drew),
   *         then sweeps off.
   *   tram  No sweep. The panel's trailing edge is pinned, every frame, to
   *         where the tram's rear edge is in the picture, so the coupling hook
   *         on the back of it is what drags the page in. The client asked for
   *         exactly that, and with the position measured off the clip it can
   *         be done literally rather than suggested.
   *
   * If the clip is not actually playing (not decoded, a tab throttled to a
   * stop) neither of those can be trusted, and the panel leaves on a plain
   * tween instead. The reader gets the page either way.
   * ------------------------------------------------------------------- */
  const reveal = useCallback((): { tl: gsap.core.Timeline; stop: () => void } => {
    const tl = gsap.timeline({ paused: true });
    let stop = () => {};
    // Re-measure rather than reuse the cover's numbers: the screen is fully
    // covered at this point, so a window resized mid-transition can be taken
    // account of here without anything showing.
    const m = layout();
    const band = bandRef.current;
    const media = mediaRef.current;
    const wrap = wrapRef.current;
    if (!m || !band || !media) return { tl, stop };

    // Reveal the incoming page. Done synchronously rather than as a timeline
    // step: if the ticker is asleep (a backgrounded tab throttles rAF to
    // nothing) a queued `set` would leave the page invisible until the reader
    // came back.
    if (wrap) gsap.set(wrap, { autoAlpha: 1 });

    const clip = WIPE_CLIPS[playingRef.current];
    const video = videoRefs.current[playingRef.current];
    const live = !!video && video.readyState >= 2 && !video.paused && !video.ended;
    const box = clipBox(clip, window.innerWidth, window.innerHeight);

    // The incoming page's h1 wipes in from the left as the panel goes, on the
    // same left-to-right gesture every reveal on the site runs: see
    // `components/effects/reveal.tsx`. The vertical inset keeps ascenders and
    // descenders outside the clip.
    const heading = wrap?.querySelector("h1, [data-page-heading]");
    const bringHeading = (duration: number) => {
      if (!heading) return;
      gsap.fromTo(
        heading,
        { clipPath: "inset(-0.35em 100% -0.35em 0)", xPercent: -6 },
        { clipPath: "inset(-0.35em 0% -0.35em 0)", xPercent: 0, ease: "power3.out", duration },
      );
    };

    // The last steps, shared by every way out.
    const finish = () => {
      stop();
      gsap.set(band, { autoAlpha: 0 });
      stopFilm();
      tl.play();
    };
    tl.call(() => {});

    // The plain way out: a sweep.
    const sweep = (duration: number) => {
      bringHeading(Math.max(0.8, duration));
      gsap.to(band, { x: m.after, duration, ease: "brand" });
      gsap.to(media, { x: -m.after, duration, ease: "brand", onComplete: finish });
    };

    if (live && "rearEntersAt" in clip) {
      /*
       * The tram. Each frame, put the panel's trailing edge where the tram's
       * rear edge is. The clip is pinned to the viewport, so a fraction of the
       * frame maps straight to pixels through the rendered box; the band's
       * `x` *is* its trailing edge, and the media is counter-translated by the
       * same amount as always so the picture holds still under the moving
       * panel. Stalls are watched for: a clock that stops advancing for half
       * a second hands over to the sweep rather than leaving the screen stuck.
       */
      bringHeading(1.0);
      let last = -1;
      let stalled = 0;
      const tick = () => {
        const t = video.currentTime;
        if (t === last) {
          stalled += 1;
          if (stalled > 30) {
            stop();
            sweep(FALLBACK_S * 0.6);
            return;
          }
        } else {
          stalled = 0;
          last = t;
        }
        const seam = box.left + tramRear(clip, t) * box.width;
        const x = Math.max(m.covered, Math.min(m.after, seam));
        gsap.set(band, { x });
        gsap.set(media, { x: -x });
        if (x >= m.after) finish();
      };
      gsap.ticker.add(tick);
      stop = () => gsap.ticker.remove(tick);
    } else if (live && "exitAt" in clip) {
      /*
       * The taxi. Hold the panel until the exhaust has cleared, then leave.
       * The blackout happens on the way: that is the swap, and it is the one
       * moment the client's own animation was built around.
       */
      const began = performance.now();
      const tick = () => {
        if (video.currentTime >= clip.exitAt || performance.now() - began > EXIT_WAIT_MS) {
          stop();
          sweep(EXIT_S);
        }
      };
      gsap.ticker.add(tick);
      stop = () => gsap.ticker.remove(tick);
    } else {
      sweep(FALLBACK_S);
    }

    return { tl, stop };
  }, [layout, stopFilm]);

  const navigate = useCallback(
    (href: string) => {
      if (pendingRef.current) return;

      // A hash or query on the current path does not change `pathname`, so the
      // reveal effect would never fire and the band would sit there forever.
      // Those navigations go straight through: a hash on this page is a
      // smooth scroll to its section, and the address follows.
      const target = href.split("#")[0].split("?")[0];
      if (target === pathname) {
        const hash = href.includes("#") ? href.slice(href.indexOf("#")) : "";
        if (hash && scrollToHash(hash, false)) {
          window.history.pushState(null, "", href);
          return;
        }
        router.push(href);
        return;
      }

      if (reducedMotion.current) {
        router.push(href);
        return;
      }

      // Interrupting a reveal is allowed; leaving it running is not.
      revealStopRef.current?.();
      revealStopRef.current = null;
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
    // A hash on the new address lands the page on that section instead, done
    // under the cover so the panel lifts on the section already in place.
    if (!scrollToHash(window.location.hash, true)) {
      getLenis()?.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    }
    ScrollTrigger.refresh();

    const { tl, stop } = reveal();
    revealRef.current = tl;
    revealStopRef.current = stop;

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(guard);
      stop();
      revealRef.current = null;
      revealStopRef.current = null;
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
      stop();
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
                data-crop={clip.crop}
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