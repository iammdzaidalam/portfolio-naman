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
 * `start` is where each clip is scrubbed to when a navigation begins, and it is
 * the whole reason the transition reads. A page transition can afford about a
 * second and a half; these run 2.4 and 3.8. Played from zero you get the empty
 * lead-in and the panel leaves before anything happens. Measured frame by frame
 * (mean luminance per eighth of a second) and started here instead, the part
 * that matters lands inside the window:
 *
 *   taxi  blacks out at 1.88s and clears by 2.25. Starting at 0.61 puts the
 *         smoke building through the cover, the blackout behind the panel
 *         mid-reveal, and the clearing exactly as the panel leaves.
 *   tram  never covers at all: its darkest frame is still 60% grey, so the
 *         panel does the covering and the tram rides it. Its coupling hook
 *         leaves frame at about 3.35s, so starting at 1.56 lands that on the
 *         last beat of the reveal, which is the moment the client pointed at.
 *
 * `crop` says whether there is anything in the frame worth losing, and it is
 * measured too, by where the ink actually falls:
 *
 *   taxi  ink from 39% to 100% of the frame. The top two fifths are empty sky,
 *         so on a screen wider than the clip that headroom can be cropped away
 *         and the car comes up to a proper size instead of sitting in the
 *         bottom third of a white field.
 *   tram  ink from 0% to 100%. The trolley pole touches the top edge and the
 *         wheels touch the bottom, so there is nothing to give: any vertical
 *         crop takes the pole off. It is contained at every size.
 */
export const WIPE_CLIPS = [
  { src: "/video/taxi.mp4", label: "taxi", start: 0.61, crop: "headroom" },
  { src: "/video/tram.mp4", label: "tram", start: 1.56, crop: "none" },
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
