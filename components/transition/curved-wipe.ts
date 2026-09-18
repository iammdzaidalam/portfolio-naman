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
 * The clip the wipe carries.
 *
 * The client's own animation, drawn for this: a Kolkata taxi drives at the
 * camera on pure white until its headlamp fills the frame and washes it out.
 * It runs on white, which is why the panel is white. The car and the panel
 * are one surface, and the only edge on screen is the arc.
 *
 * Every number here is measured off the file (1280x720, 24 fps, 34 frames,
 * 1.417s), not chosen by eye.
 *
 *   entry  The first three frames are blank. The taxi enters at the bottom
 *          edge at 0.125s (x 0.26 to 0.58, in the bottom tenth of the frame),
 *          spans the width by 0.667s and the whole frame by 0.833s. Its
 *          midpoint stays between x 0.42 and 0.52 the whole way in.
 *   wash   Mean luminance bottoms out at 169 of 255 at 0.958s, on the bonnet
 *          and the grille, and climbs as the headlamp takes over: 202 at
 *          1.167, 240 at 1.292, 253.5 at 1.333 with fewer than 2% of pixels
 *          below 235, and a flat 255 on the last frame at 1.375. `exitAt` is
 *          1.333, the first frame of that plateau, so the panel leaves as the
 *          wash completes rather than after it. The frames the exit then runs
 *          over are the plateau and, once the clip ends, its held last frame:
 *          white, the same as the panel.
 *
 * `start` is 0 and `rate` is 1. The clip is short enough to run whole: 0.5s
 * of cover, 0.83s of taxi under it and 0.45s of exit come to 1.78s, inside
 * the two seconds a transition can afford, so nothing is scrubbed. Started on
 * the cover's first frame, the band (on the brand ease) is 13% of its travel
 * in when the taxi appears and 84% in by 0.25s, so the car is on screen before
 * the arc has crossed the middle of it.
 *
 * The crop is cover, anchored to the bottom centre, at every size: the ink
 * runs to the bottom edge from the first frame, the top of the frame is empty
 * until 0.833s, and the car is centred, so a phone's window on the middle of
 * the frame keeps it. See `.wipe__video` in `globals.css`.
 */
export const WIPE_CLIP = {
  src: "/video/taxi.mp4",
  start: 0,
  rate: 1,
  /** Clip time at which the wash reaches its plateau and the panel may leave. */
  exitAt: 1.333,
} as const;

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
