"use client";

import {
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useGSAP } from "@gsap/react";

import { Flip, ScrollTrigger, gsap } from "@/lib/gsap";
import SocialYatriLogo from "@/components/logo/social-yatri-logo";

const LoadingContext = createContext(false);

/**
 * How long to let the intro run before finishing it without animation. The
 * timeline itself is 5.55s; this leaves generous headroom for a slow first
 * paint while still bounding how long the page can be held.
 */
const INTRO_BACKSTOP_MS = 9000;

/** True once the intro has finished and the page below is interactive. */
export function useLoaded() {
  return useContext(LoadingContext);
}

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [loaded, setLoaded] = useState(false);
  return (
    <LoadingContext.Provider value={loaded}>
      <Loader onDone={() => setLoaded(true)} />
      {children}
    </LoadingContext.Provider>
  );
}

/**
 * The intro.
 *
 * The wordmark is drawn rather than faded in: every shape in the logo is a
 * closed outline, so DrawSVGPlugin can stroke them one after another: the
 * road first as a single continuous pen stroke, then the lane markings, then
 * the letters left to right, then the pin. Only once a group is fully drawn
 * does its fill flood in and its outline drop away, which is what gives the
 * "being inked" feel rather than a plain reveal.
 *
 * It ends by handing the mark over to the header: `Flip.fit` measures the small
 * logo in the nav and animates the big one onto that exact box, so the two
 * never both exist on screen and there is no jump at the swap.
 */
function Loader({ onDone }: { onDone: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const countRef = useRef<HTMLSpanElement>(null);
  /**
   * Held in a ref, not a local, so React's Strict Mode double-invoke in
   * development cannot reset it and mark the app loaded twice.
   */
  const finishedRef = useRef(false);
  const [hidden, setHidden] = useState(false);
  /** Drives the scroll lock. See the layout effect below. */
  const [locked, setLocked] = useState(true);

  /*
   * The scroll lock.
   *
   * This has to be a *layout* effect, and it has to be driven by state rather
   * than written imperatively from the timeline. `useGSAP` runs inside a layout
   * effect, which React fires before every passive `useEffect`, so when the
   * intro is skipped and the timeline finishes synchronously during mount (the
   * `prefers-reduced-motion` path), an imperative `removeAttribute` there ran
   * *before* a passive effect had added the attribute. The lock was then set
   * with nothing left to lift it, and the page could never be scrolled again.
   *
   * Keyed on `locked`, the ordering cannot invert: whatever runs first, the
   * last write always reflects the current state.
   */
  useLayoutEffect(() => {
    const root = document.documentElement;
    if (!locked) {
      root.removeAttribute("data-loading");
      return;
    }
    root.setAttribute("data-loading", "");
    return () => root.removeAttribute("data-loading");
  }, [locked]);

  useGSAP(
    () => {
      const scope = root.current;
      if (!scope) return;

      /**
       * The header mark is outside this component's GSAP scope, and a scoped
       * `gsap.set` on it is dropped with an "invalid scope" warning. Write the
       * styles directly instead: `autoAlpha` is only visibility plus opacity.
       */
      const revealHeaderLogo = () => {
        document
          .querySelectorAll<HTMLElement>("[data-header-logo]")
          .forEach((el) => {
            el.style.visibility = "visible";
            el.style.opacity = "1";
          });
      };

      /** Idempotent: the timeline calls it, and so does teardown. */
      const finish = () => {
        if (finishedRef.current) return;
        finishedRef.current = true;
        setLocked(false);
        ScrollTrigger.refresh();
        onDone();
      };

      // The intro plays on every load: it is the site's front door, and the
      // client asked for it every time. Only reduced motion skips it.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        setHidden(true);
        revealHeaderLogo();
        finish();
        return;
      }

      const q = gsap.utils.selector(scope);
      const road = q("[data-logo-road] path");
      const dashes = q("[data-logo-dashes] path");
      const letters = q("[data-logo-letter]");
      const letterPaths = q("[data-logo-letter] path");
      const pin = q("[data-logo-pin] path");
      const groups = q("[data-logo-road], [data-logo-dashes], [data-logo-pin-body], [data-logo-pin-ink]");

      // Everything starts undrawn and unfilled.
      gsap.set([...groups, ...letters], { fillOpacity: 0, strokeOpacity: 1 });
      gsap.set([...road, ...dashes, ...letterPaths, ...pin], { drawSVG: "0%" });
      gsap.set(q("[data-logo-pin]"), { transformOrigin: "50% 100%", scale: 0.7, opacity: 0 });

      const counter = { value: 0 };

      const tl = gsap.timeline({
        onUpdate: () => {
          if (countRef.current) {
            countRef.current.textContent = String(Math.round(counter.value)).padStart(3, "0");
          }
        },
      });

      // The number tracks the whole timeline, so it can't finish early or late.
      tl.to(counter, { value: 100, duration: 4.4, ease: "power1.inOut" }, 0);

      // Left to right, matching the panel's own exit and every reveal on the
      // pages underneath. A clip rather than a slide, because the two meta
      // labels sit at opposite ends of a `justify-between` row: sliding both
      // in from the left would walk the right-hand one across the header.
      tl.fromTo(
        q("[data-loader-meta]"),
        { clipPath: "inset(-0.35em 100% -0.35em 0)", xPercent: -6, opacity: 0 },
        {
          clipPath: "inset(-0.35em 0% -0.35em 0)",
          xPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.08,
          ease: "expo.out",
        },
      );

      // 1. The road draws as one continuous stroke.
      tl.to(road, { drawSVG: "100%", duration: 1.7, ease: "power2.inOut" }, 0.15);

      // 2. Lane markings pop in along it, trailing the pen.
      tl.to(
        dashes,
        { drawSVG: "100%", duration: 0.5, stagger: { amount: 0.7 }, ease: "power1.out" },
        0.9,
      );

      // 3. Letters draw left to right.
      tl.to(
        letterPaths,
        { drawSVG: "100%", duration: 0.7, stagger: { amount: 0.7 }, ease: "power2.out" },
        1.5,
      );

      // 4. The pin drops onto the road.
      tl.to(q("[data-logo-pin]"), { scale: 1, opacity: 1, duration: 0.8, ease: "back.out(2)" }, 2.1);
      tl.to(pin, { drawSVG: "100%", duration: 0.6, ease: "power2.out" }, 2.1);

      // 5. Ink floods the outlines and the pen lines drop away.
      tl.to(q("[data-logo-road]"), { fillOpacity: 1, duration: 0.7 }, 2.0);
      tl.to(q("[data-logo-dashes]"), { fillOpacity: 1, duration: 0.5 }, 2.2);
      tl.to(letters, { fillOpacity: 1, duration: 0.5, stagger: { amount: 0.4 } }, 2.4);
      tl.to(q("[data-logo-pin-body], [data-logo-pin-ink]"), { fillOpacity: 1, duration: 0.5 }, 2.6);
      tl.to([...groups, ...letters], { strokeOpacity: 0, duration: 0.6 }, 2.9);

      tl.to(q("[data-loader-tagline]"), { opacity: 1, duration: 0.6 }, 3.0);

      // 6. Hand the mark to the header and pull the panel off the page.
      tl.add(() => {
        const target = document.querySelector<HTMLElement>("[data-header-logo]");
        const source = scope.querySelector<HTMLElement>("[data-loader-logo]");
        if (!target || !source) return;

        Flip.fit(source, target, {
          duration: 1.15,
          ease: "brand",
          scale: true,
          absolute: true,
          onComplete: () => {
            revealHeaderLogo();
            source.style.opacity = "0";
          },
        });
      }, 4.0);

      tl.to(q("[data-loader-meta], [data-loader-tagline]"), {
        opacity: 0,
        duration: 0.5,
        ease: "power2.in",
      }, 4.0);

      // Left to right, the axis every reveal on the site runs on: the panel's
      // visible region is squeezed off its own right edge, so the page beneath
      // is uncovered from the left. `inset(top right bottom left)`.
      tl.to(
        q("[data-loader-panel]"),
        {
          clipPath: "inset(0% 0% 0% 100%)",
          duration: 1.2,
          ease: "expo.inOut",
        },
        4.25,
      );

      tl.add(finish, 4.9);
      // After the wipe has fully cleared (4.25 + 1.2), not during it.
      tl.add(() => setHidden(true), 5.55);

      /*
       * Wall-clock backstop. GSAP advances on requestAnimationFrame, which a
       * browser suspends entirely while the tab is in the background, so a
       * page opened in a background tab can sit here with the intro frozen
       * part-way, the scroll still locked and the header mark still hidden.
       * Timers keep running (throttled, which is plenty at this scale), so if
       * the intro has not finished well past its own length, land it.
       */
      const backstop = window.setTimeout(() => {
        if (tl.progress() >= 1) return;
        tl.progress(1);
        revealHeaderLogo();
        finish();
        setHidden(true);
      }, INTRO_BACKSTOP_MS);

      return () => {
        window.clearTimeout(backstop);
        // Whatever interrupts the intro (a fast reload, an unmount mid-Flip,
        // a killed timeline) the page must never be left without its logo or
        // with the scroll still locked.
        //
        // Gated on the timeline having actually played: in development React's
        // Strict Mode mounts, tears down and remounts before the first frame,
        // and an ungated teardown here would hand the page over and reveal the
        // header mark while the real intro was still to come.
        if (tl.progress() === 0) return;
        revealHeaderLogo();
        finish();
      };
    },
    { scope: root },
  );

  if (hidden) return null;

  return (
    <div
      ref={root}
      className="pointer-events-auto fixed inset-0 z-[400] overflow-hidden"
      aria-hidden
    >
      <div
        data-loader-panel
        className="surface-paper absolute inset-0"
        style={{ clipPath: "inset(0% 0% 0% 0%)" }}
      />

      <div className="absolute inset-0 flex items-center justify-center px-[var(--gutter)]">
        <div data-loader-logo className="w-[min(64vw,52em)]">
          <SocialYatriLogo drawable fg="#141414" bg="#f2efe9" accent="#ffc72c" />
        </div>
      </div>

      <div className="text-ink absolute inset-0 flex flex-col justify-between p-[var(--gutter)]">
        <div className="flex justify-between overflow-hidden">
          <span data-loader-meta className="label block opacity-65">
            Social Yatri
          </span>
          <span data-loader-meta className="label block opacity-65">
            Kolkata, India
          </span>
        </div>

        <div className="flex items-end justify-between">
          <span data-loader-tagline className="label opacity-0">
            Plotting the route
          </span>

          {/* The count sits on the baseline of the page. */}
          <div className="overflow-hidden">
            <span data-loader-meta className="label block text-[1em]">
              <span ref={countRef}>000</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
