import type { Metadata } from "next";
import Image from "next/image";

import { PHOTOS, SITE } from "@/lib/content";
import KolkataSection from "@/components/sections/kolkata";
import Clients from "@/components/sections/clients";
import MarqueeStrip from "@/components/sections/marquee-strip";

export const metadata: Metadata = {
  title: "Studio",
  description: SITE.description,
};

export default function StudioPage() {
  return (
    <main>
      <KolkataSection titleAs="h1" marker="Studio" surface="paper" />

      {/* Two frames from the road, so the studio is seen and not only described. */}
      <section className="text-ink px-[var(--gutter)] pb-[7em]">
        <div className="grid grid-cols-[42%_1fr] items-end gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[2em]">
          <div className="w-full max-w-[420px] justify-self-end max-tablet:max-w-none max-tablet:justify-self-start">
            <div className="relative aspect-[4/5] overflow-hidden">
              <Image
                src={PHOTOS.studioPortrait.src}
                alt={PHOTOS.studioPortrait.alt}
                fill
                sizes="(max-width: 992px) 100vw, 30vw"
                className="object-cover"
                style={{ objectPosition: PHOTOS.studioPortrait.focus }}
              />
            </div>
          </div>

          <div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={PHOTOS.studioLandscape.src}
                alt={PHOTOS.studioLandscape.alt}
                fill
                sizes="(max-width: 992px) 100vw, 56vw"
                className="object-cover"
                style={{ objectPosition: PHOTOS.studioLandscape.focus }}
              />
            </div>
          </div>
        </div>
      </section>

      <MarqueeStrip />
      <Clients surface="paper" />
    </main>
  );
}
