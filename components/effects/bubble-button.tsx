"use client";

import type { ReactNode } from "react";

import TransitionLink from "@/components/transition/transition-link";
import Magnetic from "./magnetic";

/**
 * Button with a bubble arrow.
 *
 * A collapsed bubble on the left, the label, and an open duplicate bubble on
 * the right. Hovering trades the two and swings the elbow arrow out to a
 * straight diagonal. All of it is CSS — see the block in `app/globals.css`,
 * which carries the 3.75em bubble and the 0.735s easing.
 *
 * The magnetic pull is the source file's own touch, kept because it makes the
 * bubble feel like it is reaching for the cursor.
 */
type Props = {
  children: ReactNode;
  href?: string;
  type?: "button" | "submit";
  invert?: boolean;
  className?: string;
  onClick?: () => void;
};

const Arrow = ({ duplicate }: { duplicate?: boolean }) => (
  <div className={`btn-bubble-arrow__arrow${duplicate ? " is--duplicate" : ""}`}>
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="100%"
      className="btn-bubble-arrow__arrow-svg"
      aria-hidden
    >
      <polyline
        points="18 8 18 18 8 18"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
      <line
        x1="18"
        y1="18"
        x2="5"
        y2="5"
        fill="none"
        stroke="currentColor"
        strokeMiterlimit="10"
        strokeWidth="1.5"
      />
    </svg>
  </div>
);

export default function BubbleButton({
  children,
  href,
  type = "button",
  invert = false,
  className,
  onClick,
}: Props) {
  const classes = `btn-bubble-arrow${invert ? " is--invert" : ""}${
    className ? ` ${className}` : ""
  }`;

  const inner = (
    <>
      <Arrow />
      <div className="btn-bubble-arrow__content">
        <span className="btn-bubble-arrow__content-text">{children}</span>
      </div>
      <Arrow duplicate />
    </>
  );

  if (href) {
    return (
      <Magnetic>
        <TransitionLink href={href} className={classes} onClick={onClick}>
          {inner}
        </TransitionLink>
      </Magnetic>
    );
  }

  return (
    <Magnetic>
      <button type={type} className={classes} onClick={onClick}>
        {inner}
      </button>
    </Magnetic>
  );
}
