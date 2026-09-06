"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";

import { gsap } from "@/lib/gsap";

/**
 * Pulls its child towards the cursor while the pointer is inside it, then lets
 * it spring back.
 *
 * The source file did this by writing `style.transform` directly on mousemove,
 * which snaps and fights React. Here GSAP owns the transform via `quickTo`, so
 * the motion is interpolated and the release eases out.
 */
export default function Magnetic({
  children,
  strength = 0.35,
  className,
}: {
  children: ReactNode;
  /** Fraction of the pointer's offset from centre that the element follows. */
  strength?: number;
  className?: string;
}) {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = root.current?.firstElementChild as HTMLElement | null;
      if (!el) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      const xTo = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const yTo = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });

      const onMove = (event: PointerEvent) => {
        const rect = el.getBoundingClientRect();
        xTo((event.clientX - rect.left - rect.width / 2) * strength);
        yTo((event.clientY - rect.top - rect.height / 2) * strength);
      };
      const onLeave = () => {
        xTo(0);
        yTo(0);
      };

      el.addEventListener("pointermove", onMove);
      el.addEventListener("pointerleave", onLeave);
      return () => {
        el.removeEventListener("pointermove", onMove);
        el.removeEventListener("pointerleave", onLeave);
      };
    },
    { scope: root, dependencies: [strength] },
  );

  return (
    <div ref={root} className={`inline-flex${className ? ` ${className}` : ""}`}>
      {children}
    </div>
  );
}
