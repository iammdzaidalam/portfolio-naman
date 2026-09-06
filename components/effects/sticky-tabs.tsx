import type { ReactNode } from "react";

/**
 * Sticky Section Tabs by Osmo
 * [https://www.osmo.supply/resource/sticky-section-tabs-css]
 *
 * No JavaScript at all. A sticky spacer reserves the top `--nav-height`, and
 * each tab's header sticks one pixel below it. Because every header shares the
 * same offset, the next one arrives exactly on top of the last and the stack
 * builds itself as you scroll. The `-1px` closes the hairline the borders would
 * otherwise leave between two stuck headers.
 *
 * All the positioning lives in `app/globals.css`; these are just the elements.
 */
export function StickyTabGroup({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`sticky-tab-group${className ? ` ${className}` : ""}`}>
      <div className="sticky-tab-group__nav-bg surface-paper" />
      {children}
    </div>
  );
}

export function StickyTab({
  header,
  children,
  className,
}: {
  /** Stays pinned under the nav while `children` scrolls past it. */
  header: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`sticky-tab${className ? ` ${className}` : ""}`}>
      <div className="sticky-tab__sticky">{header}</div>
      <div className="sticky-tab__content">{children}</div>
    </section>
  );
}
