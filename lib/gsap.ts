"use client";

import { gsap } from "gsap";
import { CustomEase } from "gsap/CustomEase";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Flip } from "gsap/Flip";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

/**
 * One registration point for the whole app. Importing `gsap` from here instead
 * of from the package guarantees the plugins are registered before any timeline
 * that uses them is built.
 *
 * GSAP 3.13 moved the formerly paid plugins (DrawSVG, Flip, SplitText) into the
 * public package, so no Club token is needed.
 */
if (typeof window !== "undefined") {
  gsap.registerPlugin(CustomEase, DrawSVGPlugin, Flip, MotionPathPlugin, ScrollTrigger, SplitText);

  // The house ease. Every timed thing on the site uses it, including both
  // page transitions.
  if (!CustomEase.get("brand")) {
    CustomEase.create("brand", "0.625, 0.05, 0, 1");
  }

  gsap.defaults({ ease: "brand", duration: 0.6 });

  // A phone's address bar collapsing is a height-only resize; rebuilding every
  // scroll scene for it makes the page jump mid-scroll.
  ScrollTrigger.config({ ignoreMobileResize: true });
}

/** The cubic-bezier form of the house ease, for CSS transitions. */
export const EASE_CSS = "cubic-bezier(0.625, 0.05, 0, 1)";

export { gsap, CustomEase, DrawSVGPlugin, Flip, MotionPathPlugin, ScrollTrigger, SplitText };
