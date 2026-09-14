"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";

/**
 * Counts up to `target` the first time it scrolls into view.
 *
 * The source file eased with `1 - (1-p)^3`, which is `power3.out`; using GSAP's
 * own tween instead keeps the count on the same ticker as everything else, so
 * it can't drift when the tab is throttled.
 *
 * Grouped `en-IN`, because the client writes their figures that way (4,50,000
 * rather than 450,000) and the audience reads them that way.
 */
export default function Counter({
  target,
  suffix = "",
  className,
}: {
  target: number;
  suffix?: string;
  className?: string;
}) {
  const el = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const node = el.current;
      if (!node) return;

      const format = (value: number) =>
        `${Math.floor(value).toLocaleString("en-IN")}${suffix}`;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        node.textContent = format(target);
        return;
      }

      const state = { value: 0 };
      node.textContent = format(0);

      gsap.to(state, {
        value: target,
        duration: 1.4,
        ease: "power3.out",
        onUpdate: () => {
          node.textContent = format(state.value);
        },
        scrollTrigger: { trigger: node, start: "top 80%", once: true },
      });
    },
    { scope: el, dependencies: [target, suffix] },
  );

  return (
    <span ref={el} className={className}>
      0{suffix}
    </span>
  );
}
