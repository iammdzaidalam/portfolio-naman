"use client";

import { useCallback, useRef, useState } from "react";

import Reel from "./reel";
import type { Reel as ReelData } from "@/lib/reels";

/**
 * The cut, not a still of it.
 *
 * These were shot vertically for a feed and they are shown vertically. A 9:16
 * clip dropped into the page's 16:9 hero would lose most of the frame, which is
 * the whole reason this is a shelf of its own rather than a swap.
 *
 * It borrows the shoot carousel's track so the scrolling, snapping and gutter
 * behave identically; with only a handful of clips it simply does not overflow.
 *
 * Sound rides the hover. Nothing plays or makes a noise on its own, but a clip
 * you point at or open comes up with its audio, because these were cut for a
 * feed and half of them are somebody talking. The switch in the corner is there
 * for anyone who would rather watch them silently, and it is the only thing on
 * the strip that persists between clips.
 */
export default function ReelStrip({
  reels,
  title = "The reels",
}: {
  reels: ReelData[];
  title?: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  /*
   * Two copies of one fact. The ref is what each card reads at the moment it
   * starts playing, and the state is only there to re-render the label: a card
   * re-rendered mid-clip can drop its playback position.
   */
  const soundRef = useRef(true);
  const [sound, setSound] = useState(true);

  /*
   * Applied straight to the elements as well as to the ref, so a clip that is
   * already running changes at once instead of at its next play.
   */
  const toggle = useCallback(() => {
    const on = !soundRef.current;
    soundRef.current = on;
    setSound(on);
    trackRef.current?.querySelectorAll("video").forEach((video) => {
      video.muted = !on;
    });
  }, []);

  if (!reels.length) return null;

  return (
    <section className="pt-[3.5em]">
      <div className="px-[var(--gutter)]">
        <div className="rule mb-[1.5em] flex items-baseline justify-between gap-[1.5em] border-t pt-[1.1em]">
          <h2 className="statement text-[clamp(18px,2vw,28px)]">{title}</h2>

          <div className="label flex shrink-0 items-baseline gap-[0.75em] opacity-60">
            <span>
              {reels.length} {reels.length === 1 ? "clip" : "clips"}
            </span>
            <span aria-hidden>·</span>
            <button
              type="button"
              onClick={toggle}
              aria-pressed={sound}
              className="underline decoration-transparent decoration-1 underline-offset-[5px] transition-[text-decoration-color,opacity] duration-300 hover:decoration-current hover:opacity-100"
            >
              Sound {sound ? "on" : "off"}
            </button>
          </div>
        </div>
      </div>

      <div
        ref={trackRef}
        className="carousel-track flex gap-[1.5vw] overflow-x-auto px-[var(--gutter)]"
      >
        {reels.map((reel) => (
          <figure key={reel.src} className="carousel-slide relative m-0 shrink-0">
            <Reel
              reel={reel}
              soundRef={soundRef}
              className="bg-ink h-full w-auto max-w-none"
            />
          </figure>
        ))}
      </div>
    </section>
  );
}
