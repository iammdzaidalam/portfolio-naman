"use client";

import { useEffect } from "react";
import Lenis from "lenis";

import { gsap, ScrollTrigger } from "@/lib/gsap";

/**
 * Lenis, driven off GSAP's ticker rather than its own rAF loop.
 *
 * Two things matter here:
 * ScrollTrigger has to be told to `update` on every Lenis frame or scrubbed
 * timelines lag a frame behind the content, and Lenis must not run a second
 * requestAnimationFrame loop alongside GSAP's or the two fight over the same
 * budget. `syncTouch` is the resource's recommendation for keeping scrubbed
 * animations from juddering on iOS.
 */
let instance: Lenis | null = null;

/** The running Lenis, for code that has to reset the scroll (route changes). */
export function getLenis() {
  return instance;
}

export default function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: true,
      touchMultiplier: 1.4,
    });

    lenis.on("scroll", ScrollTrigger.update);
    instance = lenis;

    // `overflow` on <html> only stops the user's own scrolling; Lenis scrolls
    // programmatically and has to be told to stop while the intro panel or the
    // menu is up.
    const root = document.documentElement;
    const sync = () => {
      if (root.hasAttribute("data-loading") || root.hasAttribute("data-menu-open")) lenis.stop();
      else lenis.start();
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["data-loading", "data-menu-open"] });

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    // Anything measured against page position (the Flip waypoints, the drawn
    // path) needs a recount once fonts and images have settled.
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener("load", refresh);

    return () => {
      observer.disconnect();
      window.removeEventListener("load", refresh);
      gsap.ticker.remove(raf);
      lenis.destroy();
      instance = null;
    };
  }, []);

  return null;
}
