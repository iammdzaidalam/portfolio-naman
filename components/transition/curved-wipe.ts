/**
 * Geometry and casting for the curved wipe page transition.
 *
 * The shape is a band that sweeps across the screen from the left with a domed
 * leading edge: the curve arrives at the middle of the screen first and the
 * corners last.
 *
 * The curve itself is not invented. Osmo's resource is behind their paywall,
 * so the arc was measured off the preview still they publish openly
 * (`curved-wipe-page-transition-1440x900-v3.avif`): the panel is a flat fill,
 * which makes its edge recoverable by colour-matching each column. 1316
 * samples came back symmetric about the centre line, apex 223px above the
 * frame's bottom, meeting it at x = 62 and x = 1377.
 *
 * Fitting those samples settled the curve family. A half-ellipse spanning the
 * screen is far too deep at the shoulders; a parabola lands within 2px RMS but
 * drifts systematically; a circular arc of radius 0.77 x the span fits to
 * 0.65px RMS: sub-pixel, so the edge is circular and the arc we see is a
 * shallow segment of a circle much larger than the screen.
 *
 * The one departure from the resource is the axis. Osmo's wipe climbs, and its
 * arc therefore spans the viewport's width; this one travels left to right, so
 * the same arc is turned a quarter turn and spans the viewport's height
 * instead. The ratio is the measured one either way, which is what keeps the
 * dome the same shape on a phone as on a 27" display, rather than flattening
 * out or turning into a hemisphere.
 */

/** Arc radius, as a fraction of the span it crosses. Measured, not chosen. */
export const WIPE_RADIUS_RATIO = 0.77;

/**
 * The two clips the wipe carries, taken in turn on successive navigations.
 *
 * The client's own animations, drawn for this. Both run on pure white and both
 * travel left to right, which is why the panel is white and why the wipe goes
 * the way it does: the vehicle and the panel are moving together, not past each
 * other.
 *
 * Every number here is measured off the file, not chosen by eye. A page
 * transition can afford about a second and a half; these clips run 2.4 and
 * 3.8, so each is scrubbed to `start` and run at `rate` so the part that
 * matters lands inside the window.
 *
 *   taxi  Mean luminance sampled every eighth of a second: the exhaust blacks
 *         the frame out at 1.88s (grey 5 of 255) and it is clear white again by
 *         2.25. That blackout is the swap the client drew. Started at 0.95 and
 *         run at 1.15x, the smoke is already building as the panel arrives,
 *         the frame goes black behind it, and the panel leaves the moment the
 *         smoke has cleared: `exitAt` is that clearing.
 *   tram  Never covers at all; its darkest frame is still 60% grey. The panel
 *         does the covering and the tram rides it. What the tram has instead
 *         is a coupling hook on its rear, and the rear's position was measured
 *         frame by frame: it enters the left edge at 2.15s and crosses at a
 *         constant 0.632 frame-widths per second (every sample within 0.4% of
 *         that line). The reveal is driven off that: the panel's trailing edge
 *         is pinned to the tram's rear, so the page is pulled in by the hook.
 *         `start` puts the rear at the left edge just as the cover completes.
 *
 * `crop` says whether there is anything in the frame worth losing, measured
 * by where the ink falls: the taxi runs from 39% to 100% of the frame, so the
 * top two fifths are sky and can go, and its subject is the exhaust rather
 * than the car, so on a phone the sides can go too and the smoke fills the
 * screen; the tram runs 0% to 100%, pole to wheels, and is contained at every
 * size.
 */
export const WIPE_CLIPS = [
  {
    src: "/video/taxi.mp4",
    label: "taxi",
    start: 0.95,
    rate: 1.15,
    crop: "headroom",
    /** Clip time at which the exhaust has cleared and the panel may leave. */
    exitAt: 2.22,
  },
  {
    src: "/video/tram.mp4",
    label: "tram",
    start: 1.48,
    rate: 1.35,
    crop: "none",
    /** Clip time at which the tram's rear edge reaches the left of the frame. */
    rearEntersAt: 2.15,
    /** Frame widths per second the rear edge then travels at. */
    rearSpeed: 0.632,
  },
] as const;

export type WipeClip = (typeof WIPE_CLIPS)[number];

/** Where the tram's rear edge is, as a fraction of the frame width. */
export function tramRear(clip: WipeClip, time: number): number {
  if (!("rearEntersAt" in clip)) return 1;
  return (time - clip.rearEntersAt) * clip.rearSpeed;
}

/**
 * The clip's rendered box inside a viewport, under the same rules the CSS
 * applies: cover anchored to the bottom for the clip with headroom, contained
 * for the other. Needed so a position measured as a fraction of the frame can
 * be put on screen in pixels.
 */
export function clipBox(
  clip: WipeClip,
  width: number,
  height: number,
): { left: number; top: number; width: number; height: number } {
  const ratio = 16 / 9;
  const wide = width / height > ratio;
  if (clip.crop === "headroom") {
    if (wide) {
      const h = width / ratio;
      return { left: 0, top: height - h, width, height: h };
    }
    const w = height * ratio;
    return { left: width - w, top: 0, width: w, height };
  }
  if (wide) {
    const w = height * ratio;
    return { left: (width - w) / 2, top: 0, width: w, height };
  }
  const h = width / ratio;
  return { left: 0, top: (height - h) / 2, width, height: h };
}

export type BandMetrics = {
  /** Band width: a screenful plus the over-travel, and never less than the dome. */
  width: number;
  /** Band height: the arc's full diameter, so the screen only ever sees its crown. */
  height: number;
  /** Horizontal radius of the dome. */
  radius: number;
  /**
   * Sagitta: how far the arc falls back from its apex to where it crosses the
   * screen's top and bottom edges. The over-travel below is this: the band has
   * to push a sagitta past the obvious stopping point for the far corners,
   * which the dome reaches last, to go under.
   */
  sagitta: number;
  /** Band x with the whole band parked off the left edge. */
  before: number;
  /** Band x at full coverage: apex a sagitta past the right edge. */
  covered: number;
  /** Band x once the band's trailing edge has cleared the right edge. */
  after: number;
};

/**
 * Resolve the band for a viewport. Called at the start of each phase rather
 * than cached, so a window resized between two navigations gets the right
 * geometry without a resize listener.
 */
export function bandMetrics(width: number, height: number): BandMetrics {
  const radius = height * WIPE_RADIUS_RATIO;
  // Sagitta of the chord the viewport's height cuts across that circle.
  const sagitta = radius - Math.sqrt(radius * radius - (height / 2) ** 2);

  /*
   * A little past the trailing edge, so a viewport that changes size
   * mid-transition cannot open a sliver of the old page behind the band.
   */
  const overhang = Math.max(24, width * 0.04);

  /*
   * Wide enough that the trailing edge is still off-screen once the apex has
   * over-travelled, and never narrower than the dome's own radius. That second
   * floor is not cosmetic: once two border-radii on one side add up to more
   * than that side's length, CSS scales *every* radius on the box down in
   * concert, which would quietly flatten the measured arc on tall, narrow
   * viewports and nowhere else.
   */
  const band = Math.max(width + sagitta, radius) + overhang;

  return {
    // The dome is a true semicircle only while the band is exactly two radii
    // tall, which is what lets `border-radius` describe it: see the provider.
    width: band,
    height: radius * 2,
    radius,
    sagitta,
    before: -band,
    covered: width - band + sagitta,
    after: width,
  };
}
