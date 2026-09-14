import type { CSSProperties } from "react";

import {
  LOGO_DASHES,
  LOGO_LETTERS,
  LOGO_PIN_BODY,
  LOGO_PIN_INK,
  LOGO_ROAD,
  LOGO_VIEWBOX,
} from "./logo-paths";

type Props = {
  className?: string;
  style?: CSSProperties;
  /**
   * `fg` paints the road, the letters and the pin's ink. `bg` paints the lane
   * markings, which are holes in the artwork rather than white shapes: they
   * have to match whatever the logo is sitting on.
   */
  fg?: string;
  bg?: string;
  accent?: string;
  /**
   * Adds the hooks the loader animates against and gives every path a stroke,
   * so DrawSVGPlugin has something to draw before the fills arrive. Leave it
   * off for the static header and footer marks.
   */
  drawable?: boolean;
  title?: string;
};

const strokeProps = {
  stroke: "currentColor",
  strokeWidth: 1.25,
  vectorEffect: "non-scaling-stroke" as const,
  strokeLinejoin: "round" as const,
};

/**
 * The Social Yatri wordmark, rebuilt from the supplied PSD as vector outlines.
 *
 * Groups carry `data-logo-*` attributes rather than classes so restyling can't
 * quietly break the loader timeline, which selects on those attributes.
 */
export default function SocialYatriLogo({
  className,
  style,
  fg = "var(--paper)",
  bg = "var(--ink)",
  accent = "var(--accent)",
  drawable = false,
  title,
}: Props) {
  const draw = drawable ? strokeProps : null;

  return (
    <svg
      viewBox={LOGO_VIEWBOX}
      className={className}
      style={style}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : true}
      data-logo-root
      fill="none"
    >
      {title ? <title>{title}</title> : null}

      {drawable ? (
        <>
          {/* The script "S" road and the swoosh above the word: one pen stroke. */}
          <g data-logo-road fill={fg} fillRule="evenodd" color={fg} {...draw}>
            {LOGO_ROAD.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>

          {/* Lane markings, drawn separately so the loader can ink them in turn. */}
          <g data-logo-dashes fill={bg} color={bg} {...draw}>
            {LOGO_DASHES.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        </>
      ) : (
        /*
         * The static mark cuts the lane markings out of the road with the
         * even-odd rule, so whatever sits behind it (a photograph, the
         * grain) shows through the gaps instead of a painted surface colour.
         */
        <g data-logo-road fill={fg} fillRule="evenodd">
          <path d={[...LOGO_ROAD, ...LOGO_DASHES].join(" ")} />
        </g>
      )}

      {/* The map pin standing in for the "o" of Social. */}
      <g data-logo-pin>
        <g data-logo-pin-body fill={accent} fillRule="evenodd" color={accent} {...draw}>
          {LOGO_PIN_BODY.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g data-logo-pin-ink fill={fg} fillRule="evenodd" color={fg} {...draw}>
          {LOGO_PIN_INK.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
      </g>

      {/* "cial Yatri", one group per glyph so they can stagger left to right. */}
      <g data-logo-word fill={fg} fillRule="evenodd" color={fg}>
        {LOGO_LETTERS.map((letter) => (
          <g key={letter.id} data-logo-letter {...draw}>
            {letter.d.map((d, i) => (
              <path key={i} d={d} />
            ))}
          </g>
        ))}
      </g>
    </svg>
  );
}
