"use client";

import { useRef, type CSSProperties, type ElementType, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { gsap, SplitText } from "@/lib/gsap";
import { useLoaded } from "@/components/loader";
import { useTransition } from "@/components/transition/transition-provider";

type Props = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /** Split into lines and stagger them, or lift the whole block as one piece. */
  splitLines?: boolean;
  delay?: number;
  stagger?: number;
  /** Where in the viewport the reveal fires. ScrollTrigger `start` syntax. */
  start?: string;
  /** Play immediately on mount instead of waiting for the scroll position. */
  immediate?: boolean;
};

/**
 * Masked line reveal.
 *
 * SplitText wraps each rendered line in its own overflow-hidden mask, then the
 * lines rise out from under it. The split waits on `document.fonts.ready`:
 * measuring earlier gives the line breaks of the fallback face, which re-wrap
 * when the real face arrives and leave words clipped by stale masks.
 *
 * `[data-reveal]` stays hidden by CSS until the timeline exists, so the copy is
 * never briefly visible in its finished position.
 */
export default function Reveal({
  children,
  as: Tag = "div",
  className,
  style,
  splitLines = true,
  delay = 0,
  stagger = 0.08,
  start = "top 85%",
  immediate = false,
}: Props) {
  const root = useRef<HTMLElement>(null);
  // Nothing reveals under the intro panel or under a page cover: the build
  // waits for both handoffs, so the copy rises once it can actually be seen.
  const loaded = useLoaded();
  const { isBusy } = useTransition();

  useGSAP(
    () => {
      const el = root.current;
      if (!el) return;
      if (!loaded || isBusy) return;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        el.classList.add("is--ready");
        return;
      }

      let split: SplitText | null = null;
      let tween: gsap.core.Tween | null = null;
      let cancelled = false;

      // The split has to wait for fonts, which puts the tween outside the GSAP
      // context's synchronous capture window — so `useGSAP` never learns about
      // it and cannot revert it. Hold it here and kill it by hand instead,
      // otherwise every Reveal leaks a live ScrollTrigger on each route change.
      const build = () => {
        if (cancelled || !root.current) return;

        let targets: Element[];
        if (splitLines) {
          split = new SplitText(el, { type: "lines", mask: "lines" });
          targets = split.lines;

          // A mask is sized to its line's box, which sits on the baseline — so
          // by default it shears the descenders off every g, j, p and y. Pad
          // the clip box down and pull the next line back up by the same
          // amount, so the leading is unchanged but nothing is cut.
          gsap.set(split.masks, {
            paddingBottom: "0.16em",
            marginBottom: "-0.16em",
          });
        } else {
          targets = [el];
        }

        el.classList.add("is--ready");

        // Masked lines rise from under their clip. An unmasked block has no
        // clip to hide behind, so a 110% drop would sit in plain view over
        // whatever is beneath it until the trigger fires — it fades up a
        // short way instead.
        tween = gsap.from(targets, {
          ...(splitLines ? { yPercent: 110 } : { y: "0.5em", autoAlpha: 0 }),
          duration: 1.1,
          ease: "expo.out",
          delay,
          stagger,
          scrollTrigger: immediate ? undefined : { trigger: el, start, once: true },
        });
      };

      const teardown = () => {
        tween?.scrollTrigger?.kill();
        tween?.kill();
        split?.revert();
        tween = null;
        split = null;
      };

      // Lines are split for one width. When the width changes the split is
      // undone so the copy reflows; if it had not played yet it is rebuilt.
      let lastWidth = window.innerWidth;
      let timer: number | undefined;
      const onResize = () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;
        window.clearTimeout(timer);
        timer = window.setTimeout(() => {
          const played = !tween || tween.progress() === 1;
          teardown();
          if (!played) build();
        }, 150);
      };
      window.addEventListener("resize", onResize);

      document.fonts.ready.then(build);

      return () => {
        cancelled = true;
        window.clearTimeout(timer);
        window.removeEventListener("resize", onResize);
        teardown();
      };
    },
    { scope: root, dependencies: [loaded, isBusy, splitLines, delay, stagger, start, immediate] },
  );

  return (
    <Tag ref={root} data-reveal className={className} style={style}>
      {children}
    </Tag>
  );
}
