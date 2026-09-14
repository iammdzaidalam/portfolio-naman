"use client";

import { useState } from "react";
import Image from "next/image";

import Carousel from "./carousel";
import type { Shoot } from "@/lib/gallery";

/**
 * The shoot: one frame held large, with the rest of the set as a strip beneath
 * it. Clicking a frame in the strip promotes it to the display.
 *
 * The strip sits directly under the display on purpose. It used to be further
 * down the page with the reels in between, which meant choosing a frame changed
 * something the reader could no longer see.
 *
 * The display holds a constant HEIGHT and lets the width follow the frame. A
 * fixed 16:9 box was the obvious thing and it was wrong: this set is mostly
 * portrait, so `object-contain` put a wall of ink down either side of nearly
 * every frame, and `object-cover` would have cropped the tops off people. A
 * fixed height keeps every frame whole at its own proportions while the page
 * below stays exactly where it was, which is the only thing the fixed box was
 * really buying.
 */
export default function ShootViewer({
  shoot,
  /**
   * The piece's own frame, which opens the display. It is always one of the
   * shoot's own photos, so it is passed by source and resolved to an index
   * here: that way the strip can mark the opening frame from the start instead
   * of showing nothing as current.
   */
  openingSrc,
}: {
  shoot: Shoot;
  openingSrc: string;
}) {
  const photos = [...shoot.photos];
  const opening = Math.max(
    0,
    photos.findIndex((photo) => photo.src === openingSrc),
  );
  const [active, setActive] = useState(opening);

  const shown = photos[active];

  return (
    <section aria-label={shoot.label}>
      <div className="flex h-[min(72vh,680px)] items-center justify-center px-[var(--gutter)] max-mobile:h-[min(62vh,520px)]">
        {/*
          Keyed on the source so a new frame mounts fresh and runs the fade in.
          A CSS animation rather than a transition on state, so there is no
          second render to schedule and nothing to reset between frames.
        */}
        <div
          className="relative h-full"
          style={{ aspectRatio: `${shown.w} / ${shown.h}` }}
        >
          <Image
            key={shown.src}
            src={shown.src}
            alt={shown.alt}
            fill
            sizes="(max-width: 768px) 100vw, 72vh"
            priority
            className="animate-[frame-in_0.5s_var(--ease-brand)] object-cover"
          />
        </div>
      </div>

      <div className="px-[var(--gutter)]">
        <p className="rule label mt-[1.1em] flex items-baseline justify-between gap-[1.5em] border-t pt-[1.1em] opacity-60">
          <span>{shoot.label}</span>
          <span aria-live="polite">
            {String(active + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}
          </span>
        </p>
      </div>

      <div className="mt-[1.5em]">
        <Carousel
          photos={photos}
          label={shoot.label}
          activeIndex={active}
          onSelect={setActive}
        />
      </div>
    </section>
  );
}
