import Carousel from "./carousel";
import { GALLERY, SHOOTS } from "@/lib/gallery";

/**
 * Every frame the client shot, grouped by the shoot it came from.
 *
 * One strip per shoot, ruled off from the next and counted in the corner: the
 * page's own label grid, not a lightbox gallery.
 *
 * Full bleed on purpose: the strips run off the right edge of the screen so it
 * reads as a set that continues, which is also the direction everything else on
 * the site moves in.
 */
export default function ShootStrips() {
  return (
    <>
      {SHOOTS.map((key, i) => {
        const shoot = GALLERY[key];
        return (
          <div key={key} className="pt-[3.5em] pb-[1em]">
            <div className="px-[var(--gutter)]">
              <div className="rule mb-[1.5em] flex items-baseline justify-between gap-[1.5em] border-t pt-[1.1em]">
                <h2 className="statement text-[clamp(18px,2vw,28px)]">{shoot.label}</h2>
                <span className="label opacity-60">
                  ({String(i + 1).padStart(2, "0")}) {shoot.photos.length} frames
                </span>
              </div>
            </div>

            <Carousel photos={[...shoot.photos]} label={shoot.label} />
          </div>
        );
      })}
    </>
  );
}

/** Frames across every shoot, for the count in the page head. */
export function shootTotal() {
  return SHOOTS.reduce((n, key) => n + GALLERY[key].photos.length, 0);
}
