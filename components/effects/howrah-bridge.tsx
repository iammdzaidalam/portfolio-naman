"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";

import { ScrollTrigger } from "@/lib/gsap";
import { BANDS, BRIDGE_VIEWBOX, CAMERA, FLIGHT } from "./howrah-bridge-geometry";

/**
 * Draw Path on Scroll by Osmo
 * [https://www.osmo.supply/resource/draw-path-on-scroll]
 * — the resource's behaviour, applied to a bridge that is also moving.
 *
 * The line is revealed in lockstep with the scrollbar, on the resource's own
 * trigger: `clamp()` on both ends so a section near the top of the document
 * cannot load part-drawn, and `invalidateOnRefresh` so the range survives a
 * resize. What it does not use is DrawSVGPlugin, and the reason is structural:
 * DrawSVG strokes a path by measuring its length once and animating a dash.
 * Here the camera orbits while the reader scrolls, so every point is
 * re-projected each frame and the path's length changes with it — a dash
 * measured on the first frame would be wrong on the second. The reveal is
 * therefore cut from the polyline itself, which is exact at any camera angle.
 *
 * The shot: a side elevation of the bridge, far off and square on, swinging
 * round and rising until it is looking down the length of the deck. The
 * structure inks in near to far ahead of the reader, a paper plane rides the
 * head of the near top chord, and the whole drawing fades out as the last of
 * the eight stages is read.
 *
 * Geometry, camera and framing are in `howrah-bridge-geometry.ts`.
 */

/** Reveal window for one slice of structure, as a fraction of the scroll. */
const BAND_LEAD = 0.042;
const BAND_SPAN = 0.3;
/** The plane sets off just after the drawing starts and lands before the fade. */
const FLIGHT_START = 0.02;
const FLIGHT_SPAN = 0.84;
/** Where the drawing begins to leave. */
const FADE_FROM = 0.88;

const GHOST_OPACITY = 0.13;
const INK_OPACITY = 0.52;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export default function HowrahBridge({ className }: { className?: string }) {
  const root = useRef<SVGSVGElement>(null);
  const ghost = useRef<SVGGElement>(null);
  const ink = useRef<SVGGElement>(null);
  const flight = useRef<SVGPathElement>(null);
  const flightGhost = useRef<SVGPathElement>(null);
  const plane = useRef<SVGGElement>(null);

  useGSAP(
    () => {
      const svg = root.current;
      if (!svg) return;

      const ghostPaths = Array.from(
        ghost.current?.querySelectorAll("path") ?? [],
      ) as SVGPathElement[];
      const inkPaths = Array.from(
        ink.current?.querySelectorAll("path") ?? [],
      ) as SVGPathElement[];

      // Scratch buffers, reused every frame so a scrub allocates nothing.
      const sx: number[] = [];
      const sy: number[] = [];

      const render = (t: number) => {
        // --- camera: interpolate the nearest two keys, framing included
        const span = CAMERA.length - 1;
        const k = clamp01(t) * span;
        const i = Math.min(span - 1, Math.floor(k));
        const f = k - i;
        const A = CAMERA[i];
        const B = CAMERA[i + 1];
        const mix = (a: number, b: number) => a + (b - a) * f;

        const ex = mix(A.eye[0], B.eye[0]);
        const ey = mix(A.eye[1], B.eye[1]);
        const ez = mix(A.eye[2], B.eye[2]);
        const scale = mix(A.scale, B.scale);
        const ox = mix(A.ox, B.ox);
        const oy = mix(A.oy, B.oy);

        // --- basis. R is cross(forward, up) and has no y, which drops a
        // multiply from every point below.
        let fx = mix(A.target[0], B.target[0]) - ex;
        let fy = mix(A.target[1], B.target[1]) - ey;
        let fz = mix(A.target[2], B.target[2]) - ez;
        let len = Math.hypot(fx, fy, fz);
        fx /= len;
        fy /= len;
        fz /= len;

        let rx = -fz;
        let rz = fx;
        len = Math.hypot(rx, rz);
        rx /= len;
        rz /= len;

        const ux = -rz * fy;
        const uy = rz * fx - rx * fz;
        const uz = rx * fy;

        /** Project one member into the scratch buffers. Returns the count. */
        const project = (m: readonly number[]) => {
          let n = 0;
          for (let p = 0; p < m.length; p += 3) {
            const dx = m[p] - ex;
            const dy = m[p + 1] - ey;
            const dz = m[p + 2] - ez;
            const zc = dx * fx + dy * fy + dz * fz;
            if (zc < 5) return n; // behind the lens: stop this member here
            sx[n] = ((dx * rx + dz * rz) / zc) * scale + ox;
            sy[n] = -((dx * ux + dy * uy + dz * uz) / zc) * scale + oy;
            n += 1;
          }
          return n;
        };

        /** Append the first `frac` of the projected member to `out`. */
        const trace = (out: string[], n: number, frac: number) => {
          if (n < 2 || frac <= 0) return;
          let total = 0;
          for (let p = 1; p < n; p += 1) {
            total += Math.hypot(sx[p] - sx[p - 1], sy[p] - sy[p - 1]);
          }
          const want = total * frac;
          out.push("M", sx[0].toFixed(1), " ", sy[0].toFixed(1));
          let run = 0;
          for (let p = 1; p < n; p += 1) {
            const seg = Math.hypot(sx[p] - sx[p - 1], sy[p] - sy[p - 1]);
            if (run + seg >= want) {
              const u = seg > 0 ? (want - run) / seg : 0;
              out.push(
                "L",
                (sx[p - 1] + (sx[p] - sx[p - 1]) * u).toFixed(1),
                " ",
                (sy[p - 1] + (sy[p] - sy[p - 1]) * u).toFixed(1),
              );
              return;
            }
            run += seg;
            out.push("L", sx[p].toFixed(1), " ", sy[p].toFixed(1));
          }
        };

        // --- structure, slice by slice, near to far
        for (let b = 0; b < BANDS.length; b += 1) {
          const frac = clamp01((t - b * BAND_LEAD) / BAND_SPAN);
          const full: string[] = [];
          const cut: string[] = [];
          for (const member of BANDS[b]) {
            const n = project(member);
            trace(full, n, 1);
            trace(cut, n, frac);
          }
          ghostPaths[b]?.setAttribute("d", full.join(""));
          inkPaths[b]?.setAttribute("d", cut.join(""));
        }

        // --- the flight line, and the plane at its head
        const flown = clamp01((t - FLIGHT_START) / FLIGHT_SPAN);
        const n = project(FLIGHT);
        const full: string[] = [];
        const cut: string[] = [];
        trace(full, n, 1);
        trace(cut, n, flown);
        flightGhost.current?.setAttribute("d", full.join(""));
        flight.current?.setAttribute("d", cut.join(""));

        const fade = t < FADE_FROM ? 1 : clamp01(1 - (t - FADE_FROM) / (1 - FADE_FROM));

        if (plane.current) {
          if (flown > 0.004 && flown < 1 && fade > 0.02 && n > 1) {
            let total = 0;
            for (let p = 1; p < n; p += 1) {
              total += Math.hypot(sx[p] - sx[p - 1], sy[p] - sy[p - 1]);
            }
            const want = total * flown;
            let run = 0;
            let px = sx[0];
            let py = sy[0];
            let angle = 0;
            for (let p = 1; p < n; p += 1) {
              const dx = sx[p] - sx[p - 1];
              const dy = sy[p] - sy[p - 1];
              const seg = Math.hypot(dx, dy);
              if (run + seg >= want) {
                const u = seg > 0 ? (want - run) / seg : 0;
                px = sx[p - 1] + dx * u;
                py = sy[p - 1] + dy * u;
                angle = (Math.atan2(dy, dx) * 180) / Math.PI;
                break;
              }
              run += seg;
            }
            plane.current.setAttribute(
              "transform",
              `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${angle.toFixed(1)})`,
            );
            plane.current.style.opacity = String(fade);
          } else {
            plane.current.style.opacity = "0";
          }
        }

        if (ghost.current) ghost.current.style.opacity = String(GHOST_OPACITY * fade);
        if (ink.current) ink.current.style.opacity = String(INK_OPACITY * fade);
        if (flight.current) flight.current.style.opacity = String(fade);
      };

      // The steps set the pace: the drawing is triggered by the block they
      // share, so the plane crosses the bridge as the eight stages are read.
      const scene = svg.closest<HTMLElement>("[data-bridge-scene]") ?? svg;

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Land on the finished drawing, before it would begin to leave.
        render(FADE_FROM);
        return;
      }

      render(0);
      const trigger = ScrollTrigger.create({
        trigger: scene,
        start: "clamp(top center)",
        end: "clamp(bottom center)",
        invalidateOnRefresh: true,
        onUpdate: (self) => render(self.progress),
      });

      // The framing is measured in viewBox units, so a resize needs no rebuild
      // — but the trigger's range does.
      const onResize = () => ScrollTrigger.refresh();
      window.addEventListener("resize", onResize);
      return () => {
        window.removeEventListener("resize", onResize);
        trigger.kill();
      };
    },
    { scope: root },
  );

  return (
    <svg
      ref={root}
      viewBox={BRIDGE_VIEWBOX}
      preserveAspectRatio="xMidYMid meet"
      className={className}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* The bridge the reader has not reached yet. */}
      <g ref={ghost} stroke="currentColor" strokeWidth="0.9" opacity={GHOST_OPACITY}>
        {BANDS.map((_, i) => (
          <path key={i} />
        ))}
        <path ref={flightGhost} />
      </g>

      {/* Inked in, slice by slice. */}
      <g ref={ink} stroke="currentColor" strokeWidth="1" opacity={INK_OPACITY}>
        {BANDS.map((_, i) => (
          <path key={i} />
        ))}
      </g>

      <path ref={flight} stroke="var(--accent)" strokeWidth="2" />

      {/* Nose along +x; the render rotates it onto the line's tangent. */}
      <g ref={plane} style={{ opacity: 0 }}>
        <path
          d="M-11 -7 L13 0 L-11 7 L-5 0 Z"
          fill="var(--accent)"
          stroke="var(--ink)"
          strokeWidth="1.1"
        />
        <path d="M-5 0 L13 0" stroke="var(--ink)" strokeWidth="1.1" />
      </g>
    </svg>
  );
}
