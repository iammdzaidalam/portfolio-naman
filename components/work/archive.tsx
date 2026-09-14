import Carousel from "./carousel";
import { GALLERY, SHOOTS } from "@/lib/gallery";
import { Marker } from "@/components/ui/section-head";
import Reveal from "@/components/effects/reveal";

/**
 * Every frame the client shot, grouped by the shoot it came from.
 *
 * The work grid above says what the pieces were; this says how much there is.
 * One strip per shoot, ruled off from the next, counted in the corner: the
 * page's own label grid, not a lightbox gallery.
 *
 * Full bleed on purpose: the strips run off the right edge of the screen so it
 * reads as a set that continues, which is also the direction everything else on
 * the site moves in.
 */
export default function Archive() {
  const total = SHOOTS.reduce((n, key) => n + GALLERY[key].photos.length, 0);

  return (
    <section className="text-ink pt-[6em] pb-[2em]">
      <div className="px-[var(--gutter)]">
        <div className="rule grid grid-cols-[42%_1fr] gap-[4vw] border-t pt-[1.5em] max-tablet:grid-cols-1 max-tablet:gap-[1em]">
          <Marker>The archive</Marker>
          <div className="flex items-baseline justify-between gap-[1.5em]">
            <Reveal as="h2" className="display text-[clamp(28px,3.4vw,52px)]">
              Everything we shot.
            </Reveal>
            <span className="label shrink-0 opacity-60">({total} frames)</span>
          </div>
        </div>
      </div>

      {SHOOTS.map((key, i) => {
        const shoot = GALLERY[key];
        return (
          <div key={key} className="pt-[3.5em] pb-[1em]">
            <div className="px-[var(--gutter)]">
              <div className="rule mb-[1.5em] flex items-baseline justify-between gap-[1.5em] border-t pt-[1.1em]">
                <h3 className="statement text-[clamp(18px,2vw,28px)]">{shoot.label}</h3>
                <span className="label opacity-60">
                  ({String(i + 1).padStart(2, "0")}) {shoot.photos.length} frames
                </span>
              </div>
            </div>

            <Carousel photos={[...shoot.photos]} label={shoot.label} />
          </div>
        );
      })}
    </section>
  );
}
