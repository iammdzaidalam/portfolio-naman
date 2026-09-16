/**
 * One clip at a time.
 *
 * Every place a clip starts (a hover on a card, a click that opens the
 * viewer) calls this first, and it pauses whatever else is running. The
 * transition's own footage is left alone: it is muted, it is the page turning
 * over, and it is not something the reader is watching.
 */
export function claimPlayback(video: HTMLVideoElement) {
  document.querySelectorAll<HTMLVideoElement>("video").forEach((other) => {
    if (other === video || other.paused) return;
    if (other.classList.contains("wipe__video")) return;
    other.pause();
  });
}
