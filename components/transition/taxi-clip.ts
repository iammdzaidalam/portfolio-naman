/**
 * The clip the page transition is made of.
 *
 * The client's own animation, drawn for this: a Kolkata taxi drives at the
 * camera on pure white until its headlamp fills the frame and washes it out.
 * The transition is the clip and nothing else. The sheet it plays on is white
 * because the clip is drawn on white, so the blank frames at either end, or a
 * frame that has not decoded, are the same surface as the sheet and there is
 * never an edge on screen.
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
 *          1.333, the first frame of that plateau, so the sheet starts to go
 *          as the wash completes rather than after it. The frames its fade
 *          then runs over are the plateau and, once the clip ends, its held
 *          last frame: white, the same as the sheet.
 *
 * `start` is 0 and `rate` is 1. The clip is short enough to run whole: the
 * sheet fades up over the three blank frames, the taxi drives for 1.2s under
 * nothing but itself, and the 0.35s fade out of the wash brings the whole
 * thing to 1.68s, inside the two seconds a transition can afford, so nothing
 * is scrubbed.
 *
 * The crop is cover, anchored to the bottom centre, at every size: the ink
 * runs to the bottom edge from the first frame, the top of the frame is empty
 * until 0.833s, and the car is centred, so a phone's window on the middle of
 * the frame keeps it. See `.wipe__video` in `globals.css`.
 */
export const TAXI_CLIP = {
  src: "/video/taxi.mp4",
  start: 0,
  rate: 1,
  /** Clip time at which the wash reaches its plateau and the sheet may go. */
  exitAt: 1.333,
} as const;
