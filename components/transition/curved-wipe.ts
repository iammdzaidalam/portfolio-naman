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

/** The two clips the wipe carries, taken in turn on successive navigations. */
export const WIPE_CLIPS = [
  { src: "/video/taxi.mp4", label: "taxi" },
  { src: "/video/tram.mp4", label: "tram" },
] as const;

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
