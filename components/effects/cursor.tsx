"use client";

import { useEffect, useRef } from "react";

/**
 * The brand-yellow dot that trails the pointer. Over anything clickable it
 * opens into a ring: the one place the colour says "this can be acted on".
 *
 * Mounted only for fine pointers, and it adds `has-cursor` to <html> itself,
 * so a touch device, or a browser that never fires a mousemove, keeps its own
 * cursor instead of being left with none.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    // A dot that chases the pointer is motion, and it also replaces the native
    // cursor, so for reduced-motion users leave their own cursor alone.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = dot.current;
    if (!el) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let frame = 0;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.classList.add("is--on");
    };
    const onLeave = () => el.classList.remove("is--on");

    const loop = () => {
      cx += (x - cx) * 0.25;
      cy += (y - cy) * 0.25;
      el.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
      frame = requestAnimationFrame(loop);
    };

    // Delegated, so cards and links added later (filtered work grid, route
    // changes) still swell the cursor without re-binding anything.
    const HOVER = "a, button, [data-cursor='big']";
    const onOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER)) el.classList.add("is--big");
    };
    const onOut = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest?.(HOVER)) el.classList.remove("is--big");
    };

    document.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });
    document.addEventListener("mouseout", onOut, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      root.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={dot} className="cursor-dot" aria-hidden />;
}
