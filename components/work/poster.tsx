import Image from "next/image";

import type { Ride } from "@/lib/content";

/**
 * The still that stands in for the reel.
 *
 * The surfaces are black and white; the photography is where the colour lives.
 *
 * Real footage replaces this component and nothing else: each ride names its
 * own frame in `lib/content.ts`.
 */
export default function Poster({
  ride,
  className,
  sizes = "(max-width: 768px) 100vw, 33vw",
  priority = false,
}: {
  ride: Ride;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className ?? ""}`}>
      <Image
        src={ride.frame}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        aria-hidden
        className="object-cover transition-transform duration-[900ms] group-hover:scale-[1.03]"
        style={{ transitionTimingFunction: "var(--ease-osmo)" }}
      />
    </div>
  );
}
