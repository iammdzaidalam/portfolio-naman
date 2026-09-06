/**
 * The open curve the Draw SVG page transition strokes across the screen.
 *
 * This is the resource's own path, taken verbatim from Osmo's published demo
 * (osmo-draw-svg-page-transition.webflow.io) rather than re-drawn — it is a
 * spiral that folds back on itself three times, which is what lets a stroke of
 * only 30% of the viewBox cover the whole screen without leaving a seam.
 *
 * It also happens to be the right shape for this brand: "yatri" means traveller,
 * and the transition reads as a road winding away and back.
 */
export const TRANSITION_PATH =
  "M43 259C296 11.5688 994 -3 922.994 498.259C851.988 999.517 281.229 1004.28 " +
  "123 767C-35.2287 529.721 179 259 472 259C765 259 792 498.259 659 654C526 " +
  "809.741 319 755 285 669.001C251 583.001 299 452 496 452C693 452 876.073 " +
  "639.171 935 937.001";

/** The viewBox the path is authored against. */
export const TRANSITION_VIEWBOX = "0 0 1000 1000";

/** How many shutters the Shutter transition builds. */
export const SHUTTER_COUNT = 10;
