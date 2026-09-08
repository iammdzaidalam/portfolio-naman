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

import { gsap, MotionPathPlugin, ScrollTrigger } from "@/lib/gsap";
import { getLenis } from "@/components/effects/smooth-scroll";
import { SHUTTER_COUNT, TRANSITION_PATH, TRANSITION_VIEWBOX } from "./transition-paths";

export type TransitionMode = "draw" | "shutter";

type TransitionContextValue = {
  /** Cover the screen, navigate, then uncover. Falls back to a plain push. */
  navigate: (href: string, mode?: TransitionMode) => void;
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

type Pending = { href: string; mode: TransitionMode } | null;

/**
 * How long to wait for a cover animation before continuing without it. Longer
 * than any of the timelines it guards — draw leave 1s, draw enter 1.75s,
 * shutter leave 0.8s — with room to spare.
 */
const LEAVE_GUARD_MS = 3000;

/**
 * How far along the spiral the paper plane flies during the leave. The stroke
 * itself draws to 85%; the plane's centre rides that same point, so its nose
 * leads the head of the line by half its own length.
 */
const PLANE_END = 0.85;

export default function TransitionProvider({
  children,
  chrome,
}: {
  children: ReactNode;
  /**
   * Fixed furniture — the header, the progress rail. Rendered outside the
   * animated wrapper, because a transformed ancestor turns `position: fixed`
   * into scroll-following and the header would slide away mid-transition.
   */
  chrome?: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const wrapRef = useRef<HTMLDivElement>(null);
  const drawPathRef = useRef<SVGPathElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);
  const shutterWrapRef = useRef<HTMLDivElement>(null);

  /** Set while the screen is covered and we are waiting on the new route. */
  const pendingRef = useRef<Pending>(null);
  /**
   * The uncover currently playing, and the function that finishes it. A second
   * navigation started mid-uncover has to stop the first one before it runs its
   * own cover: otherwise two timelines drive the same overlay path, and the
   * stale one's terminal `set(path, {opacity: 0})` blanks the new cover halfway
   * through, showing the reader the page swap.
   */
  const enterRef = useRef<gsap.core.Timeline | null>(null);
  const settleRef = useRef<(() => void) | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const reducedMotion = useRef(false);
  useEffect(() => {
    reducedMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);

  /* ---------------------------------------------------------------------
   * The drawn page transition.
   *
   * Every value below is the resource's own, from its published demo.
   *
   * Leave: the spiral draws to 85% of its length over 1s while the stroke
   * fattens from 5% to 30% of the viewBox — the fattening is what covers the
   * screen, the drawing is what makes it feel authored.
   *
   * Enter: the stroke thins back to 5% while `drawSVG` runs from "0% 100%" to
   * "100% 100%" — the line is erased from its own start, so the cover retreats
   * along the path it arrived on instead of simply fading.
   *
   * Leave and enter run in sequence rather than concurrently: the router has a
   * single container and enter cannot start until the new route has committed,
   * so an offset between the two would be dead time.
   *
   * This site's addition: a paper plane flies the head of the line as it is
   * drawn — the yatri on the road. It is an HTML element rather than a child
   * of the SVG, because the overlay's SVG is stretched to the viewport with
   * `preserveAspectRatio="none"` and anything inside it would be stretched
   * (and, once rotated, sheared) with it. Instead the point on the path is
   * read in viewBox units and mapped through the SVG's own screen matrix, so
   * the plane sits exactly on the stroke at its true proportions.
   * ------------------------------------------------------------------- */
  const drawLeave = useCallback(() => {
    const path = drawPathRef.current;
    const plane = planeRef.current;
    const tl = gsap.timeline();
    if (!path) return tl;

    tl.set(path, { opacity: 1, strokeWidth: "5%", drawSVG: "0% 0%" });

    tl.to(path, {
      duration: 1,
      drawSVG: "0% 85%",
      ease: "power1.inOut",
    });

    tl.to(
      path,
      { strokeWidth: "30%", duration: 0.75, ease: "power1.inOut" },
      "< 0.25",
    );

    const svg = path.ownerSVGElement;
    if (plane && svg) {
      const raw = MotionPathPlugin.cacheRawPathMeasurements(
        MotionPathPlugin.getRawPath(path),
      );

      const place = (progress: number) => {
        const ctm = svg.getScreenCTM();
        if (!ctm) return;
        const here = MotionPathPlugin.getPositionOnPath(raw, progress);
        const ahead = MotionPathPlugin.getPositionOnPath(
          raw,
          Math.min(1, progress + 0.004),
        );
        const a = new DOMPoint(here.x, here.y).matrixTransform(ctm);
        const b = new DOMPoint(ahead.x, ahead.y).matrixTransform(ctm);
        gsap.set(plane, {
          x: a.x,
          y: a.y,
          xPercent: -50,
          yPercent: -50,
          rotation: (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI,
        });
      };

      const flight = { progress: 0 };
      place(0);
      tl.set(plane, { autoAlpha: 1 }, 0);
      tl.to(
        flight,
        {
          progress: PLANE_END,
          duration: 1,
          ease: "power1.inOut",
          onUpdate: () => place(flight.progress),
        },
        0,
      );
      // The stroke has swallowed the screen by now; the plane goes with it.
      tl.to(plane, { autoAlpha: 0, duration: 0.25, ease: "power1.in" }, 0.78);
    }

    return tl;
  }, []);

  const drawEnter = useCallback(() => {
    const path = drawPathRef.current;
    const wrap = wrapRef.current;
    const tl = gsap.timeline();
    if (!path) return tl;

    // Reveal the incoming page. Done synchronously rather than as a timeline
    // step: if the ticker is asleep —
    // a backgrounded tab throttles rAF to nothing — a queued `set` would leave
    // the page invisible until the reader came back.
    if (wrap) gsap.set(wrap, { autoAlpha: 1 });
    // The plane never rides the uncover; make sure a cut-short leave has not
    // left it hanging mid-screen.
    if (planeRef.current) gsap.set(planeRef.current, { autoAlpha: 0 });

    tl.set(path, { drawSVG: "0% 100%" });

    tl.to(path, {
      duration: 1.25,
      drawSVG: "100% 100%",
      strokeWidth: "5%",
      ease: "power1.inOut",
    });

    // The resource lifts the incoming page's h1 as the cover retreats.
    const heading = wrap?.querySelector("h1, [data-page-heading]");
    if (heading) {
      tl.fromTo(
        heading,
        { yPercent: 25, autoAlpha: 0 },
        { yPercent: 0, autoAlpha: 1, ease: "expo.out", duration: 1 },
        "< 0.75",
      );
    }

    tl.set(path, { opacity: 0 });

    return tl;
  }, []);

  /* ---------------------------------------------------------------------
   * The shutter page transition.
   *
   * Ten shutters, 0.5s each, staggered across 0.3s from the end, with the
   * outgoing page sliding 15vh up under them and the incoming page arriving
   * from 20vh below.
   * ------------------------------------------------------------------- */
  const shutterLeave = useCallback(() => {
    const shutters = gsap.utils.toArray<HTMLElement>(
      shutterWrapRef.current?.querySelectorAll("[data-transition-shutter]") ?? [],
    );
    const wrap = wrapRef.current;
    const tl = gsap.timeline();
    if (!shutters.length) return tl;

    tl.set(shutters, { opacity: 1 });
    tl.fromTo(
      shutters,
      {
        yPercent: 50,
        scale: 1.02,
        clipPath: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
      },
      {
        yPercent: 0,
        scale: 1.02,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
        duration: 0.5,
        ease: "power3.in",
        stagger: { amount: 0.3, from: "end" },
      },
    );
    // A transformed wrap becomes the containing block of every `position:
    // fixed` descendant, which is how ScrollTrigger pins — so while the spiral
    // is pinned the page slide is skipped rather than have the pin jump.
    const pinned = ScrollTrigger.getAll().some((t) => t.pin && t.isActive);
    if (wrap && !pinned) tl.to(wrap, { y: "-15vh", duration: 0.8, ease: "power3.in" }, 0);
    return tl;
  }, []);

  const shutterEnter = useCallback(() => {
    const shutters = gsap.utils.toArray<HTMLElement>(
      shutterWrapRef.current?.querySelectorAll("[data-transition-shutter]") ?? [],
    );
    const wrap = wrapRef.current;
    const tl = gsap.timeline();
    if (!shutters.length) return tl;

    tl.fromTo(
      shutters,
      {
        yPercent: 0,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
      },
      {
        yPercent: -50,
        clipPath: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
        duration: 0.5,
        ease: "expo.out",
        stagger: { amount: 0.3, from: "end" },
      },
    );
    if (wrap) {
      tl.fromTo(
        wrap,
        { y: "20vh" },
        { y: "0vh", duration: 0.8, ease: "expo.out", clearProps: "transform" },
        0,
      );
    }
    tl.set(shutters, { opacity: 0 });
    return tl;
  }, []);

  const navigate = useCallback(
    (href: string, mode: TransitionMode = "draw") => {
      if (pendingRef.current) return;

      // A hash or query on the current path does not change `pathname`, so the
      // uncover effect would never fire and the cover would sit there forever.
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

      // Interrupting an uncover is allowed; leaving it running is not.
      enterRef.current?.kill();
      enterRef.current = null;
      settleRef.current?.();
      settleRef.current = null;

      pendingRef.current = { href, mode };
      setIsBusy(true);
      document.documentElement.setAttribute("data-transitioning", "");

      // Prefetching during the cover is free time — by the time the leave
      // animation ends the route is usually already in the client cache.
      router.prefetch(href);

      const leave = mode === "shutter" ? shutterLeave() : drawLeave();

      // The push happens when the cover animation finishes — or when the guard
      // fires, whichever comes first. Without the guard a timeline that never
      // completes (a tab backgrounded mid-transition suspends rAF, so GSAP
      // stops advancing) would leave `pendingRef` set forever and every later
      // link click would be swallowed.
      let committed = false;
      const commit = () => {
        if (committed) return;
        committed = true;
        window.clearTimeout(guard);
        leave.kill();

        // Hidden until the enter timeline reveals it, so the new route cannot
        // be glimpsed through the thinning stroke before its own intro runs.
        if (mode === "draw" && wrapRef.current) {
          gsap.set(wrapRef.current, { autoAlpha: 0 });
        }
        router.push(href);
      };

      const guard = window.setTimeout(commit, LEAVE_GUARD_MS);
      leave.eventCallback("onComplete", commit);
    },
    [drawLeave, pathname, router, shutterLeave],
  );

  // The new route has committed. Reset the scroll position under the cover,
  // then uncover. `pathname` only changes once React has rendered the new page,
  // so there is nothing half-painted underneath when this runs.
  useEffect(() => {
    const pending = pendingRef.current;
    if (!pending || pending.href.split("#")[0] !== pathname) return;

    pendingRef.current = null;
    // Lenis may still be easing towards the old page's target; reset it too.
    getLenis()?.scrollTo(0, { immediate: true, force: true });
    window.scrollTo(0, 0);
    ScrollTrigger.refresh();

    const enter = pending.mode === "shutter" ? shutterEnter() : drawEnter();
    enterRef.current = enter;

    let settled = false;
    const settle = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(guard);
      enterRef.current = null;
      settleRef.current = null;
      setIsBusy(false);
      document.documentElement.removeAttribute("data-transitioning");
      // Belt and braces: the page must be visible and untransformed whether the
      // uncover ran to completion or was cut short.
      if (wrapRef.current) {
        gsap.set(wrapRef.current, { autoAlpha: 1, clearProps: "transform" });
      }
      ScrollTrigger.refresh();
    };

    const guard = window.setTimeout(settle, LEAVE_GUARD_MS);
    settleRef.current = settle;
    enter.eventCallback("onComplete", settle);

    return () => {
      window.clearTimeout(guard);
      enter.kill();
    };
  }, [drawEnter, pathname, shutterEnter]);

  return (
    <TransitionContext.Provider value={{ navigate, isBusy }}>
      {chrome}

      {/*
        One stacking context for the whole page, so nothing inside it — however
        high its own z-index — can paint over the menu or the covers. Isolation
        does not affect fixed positioning, so ScrollTrigger's pins are unmoved.
      */}
      <div ref={wrapRef} data-page-wrap id="main" className="relative z-[1] isolate">
        {children}
      </div>

      {/* Draw SVG overlay. */}
      <div className="transition-overlay" aria-hidden>
        <div className="transition__shape" style={{ color: "var(--ink)" }}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="100%"
            viewBox={TRANSITION_VIEWBOX}
            fill="none"
            preserveAspectRatio="none"
            className="transition__svg"
          >
            <path
              ref={drawPathRef}
              d={TRANSITION_PATH}
              stroke="currentColor"
              strokeWidth="0"
              strokeLinecap="round"
              strokeLinejoin="round"
              opacity={0}
            />
          </svg>
        </div>
      </div>

      {/* The paper plane at the head of the drawn line. Nose points +x. */}
      <div ref={planeRef} className="transition__plane" aria-hidden>
        <svg viewBox="0 0 48 32" width="100%" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M2 4 L46 16 L2 28 L14 16 Z"
            fill="var(--accent)"
            stroke="var(--ink)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M14 16 L46 16" stroke="var(--ink)" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Shutter overlay. */}
      <div className="transition-overlay" aria-hidden ref={shutterWrapRef}>
        <div className="transition__panel">
          {Array.from({ length: SHUTTER_COUNT }, (_, i) => (
            <div key={i} data-transition-shutter className="transition__shutter" />
          ))}
        </div>
      </div>
    </TransitionContext.Provider>
  );
}
