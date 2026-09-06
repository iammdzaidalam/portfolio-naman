"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";

import { useTransition, type TransitionMode } from "./transition-provider";

type Props = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
  /** `draw` for chrome navigation, `shutter` for drilling into a case study. */
  mode?: TransitionMode;
};

/**
 * A `next/link` that hands the navigation to the transition overlay instead of
 * letting the router swap the page instantly.
 *
 * It stays a real anchor, so middle-click, cmd-click and "open in new tab" all
 * behave — those are the cases the guard below lets through untouched. Same for
 * in-page hashes and external URLs.
 */
export default function TransitionLink({
  href,
  mode = "draw",
  onClick,
  ...rest
}: Props) {
  const { navigate } = useTransition();

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    const isModified =
      event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
    const isPrimary = event.button === 0;
    const isInternal = href.startsWith("/") && !href.startsWith("//");

    if (!isPrimary || isModified || !isInternal) return;

    event.preventDefault();
    navigate(href, mode);
  };

  return <Link href={href} onClick={handleClick} {...rest} />;
}
