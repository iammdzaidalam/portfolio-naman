import type { ReactNode } from "react";

import Reveal from "@/components/effects/reveal";

/**
 * noth.in's section marker: a small mono label in parentheses. No rule, no
 * index — the parentheses are the whole device.
 */
export function Marker({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={`label-xs opacity-60 ${className ?? ""}`}>( {children} )</p>;
}

/**
 * Marker on the left, headline and standfirst on the right — the two-column
 * opening both references use, with the label column at 42% like noth.in.
 */
export default function SectionHead({
  marker,
  aside,
  title,
  sub,
  titleAs = "h2",
  size = "lg",
  className,
}: {
  marker: string;
  /** Anything that belongs under the marker in the label column. */
  aside?: ReactNode;
  title: string | readonly string[];
  sub?: string;
  titleAs?: "h1" | "h2";
  size?: "lg" | "xl";
  className?: string;
}) {
  const lines = Array.isArray(title) ? title : [title];

  return (
    <div className={`grid grid-cols-[42%_1fr] gap-[4vw] max-tablet:grid-cols-1 max-tablet:gap-[1.5em] ${className ?? ""}`}>
      <div>
        <Marker>{marker}</Marker>
        {aside ? <div className="mt-[1.5em]">{aside}</div> : null}
      </div>

      <div>
        <Reveal
          as={titleAs}
          className={`display ${
            size === "xl" ? "text-[clamp(44px,6.6vw,104px)]" : "text-[clamp(32px,4vw,64px)]"
          }`}
        >
          {lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </Reveal>

        {sub ? (
          <Reveal as="p" className="mt-[1.75em] max-w-[30em] text-[0.9375em] leading-[1.4] opacity-70">
            {sub}
          </Reveal>
        ) : null}
      </div>
    </div>
  );
}
