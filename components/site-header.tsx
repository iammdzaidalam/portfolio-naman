"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";

import { NAV, SITE } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import SocialYatriLogo from "@/components/logo/social-yatri-logo";
import TransitionLink from "@/components/transition/transition-link";

/**
 * The site's chrome: the mark top-left, MENU top-right, and the primary
 * navigation as a mono column pinned to the left edge at mid-height, with a
 * small square marking the active route.
 *
 * All of it is fixed, painted white and composited with
 * `mix-blend-mode: difference` (the `.chrome` rule), so one set of furniture
 * reads as ink over paper, paper over ink, a negative over photographs, and
 * inverts wherever it crosses type of its own colour instead of vanishing
 * into it. A blend only sees the page when the element sits directly in the
 * root stacking context: a fixed, z-indexed header box would be a stacking
 * context of its own, and a blend inside it would composite against nothing
 * but the header's transparent backdrop. So the header is `display: contents`
 * and each piece is its own fixed element.
 *
 * The map pin is the one thing that must not invert (difference turns the
 * yellow blue over paper), so the mark is drawn twice in the same box: the
 * blended copy carries the road and the letters, and a plain copy stacked
 * over it carries the pin.
 *
 * MENU opens an overlay of the same routes set very large, right-aligned,
 * with a rolling hover on each link.
 *
 * The mark is hidden until the loader hands it over with `Flip.fit`.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

  // The root carries the open state so the scroll (Lenis) can pause on it.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-menu-open", open);
    return () => document.documentElement.removeAttribute("data-menu-open");
  }, [open]);

  // Escape closes the menu; the links close it themselves on click.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useGSAP(
    () => {
      const el = overlay.current;
      if (!el) return;
      const links = el.querySelectorAll("[data-menu-link]");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      // GSAP owns the overlay's visibility both ways, so the close can fade
      // instead of snapping to display:none on the same render.
      if (open) {
        gsap.set(el, { autoAlpha: 1, overwrite: "auto" });
        if (reduced) gsap.set(links, { yPercent: 0 });
        else
          gsap.fromTo(
            links,
            { yPercent: 110 },
            { yPercent: 0, duration: 0.9, ease: "expo.out", stagger: 0.06 },
          );
      } else {
        gsap.to(el, { autoAlpha: 0, duration: reduced ? 0 : 0.3, overwrite: "auto" });
      }
    },
    { dependencies: [open] },
  );

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // The mark's box, shared by both copies so they register exactly.
  const markBox = "fixed top-[var(--corner)] left-[var(--corner)] block w-[112px]";

  return (
    <>
      {/* Corner furniture. */}
      {/*
        No box of its own, for the blend (see above). Each piece sits above
        the transition covers (z-300) and below the loader (z-400).
      */}
      <header className="contents">
        <TransitionLink
          href="/"
          aria-label={`${SITE.name}, home`}
          className={`chrome z-[350] ${markBox}`}
        >
          <span data-header-logo className="block w-full">
            {/*
              The lane markings are cut out of the road, so under the blend
              they paint nothing and read as holes over anything.
            */}
            <SocialYatriLogo className="w-full" layer="mark" fg="currentColor" />
          </span>
        </TransitionLink>

        {/*
          The pin, unblended, over the blended mark. It carries
          `data-header-logo` so the loader reveals it with the other copy, and
          it comes second in the DOM so the loader's Flip still lands on the
          blended copy. Its ink sits on the yellow, so it is plain ink. It
          never takes the pointer: the link beneath does.
        */}
        <span aria-hidden data-header-logo className={`pointer-events-none z-[351] ${markBox}`}>
          <SocialYatriLogo className="w-full" layer="pin" fg="var(--ink)" accent="var(--accent)" />
        </span>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          // Padded out to a 44px target without moving the text off the corner.
          // Not the accent on hover: the cursor dot is that same yellow and
          // sits directly over this word, which makes it hard to read at the
          // exact moment it is being pointed at.
          className="chrome label fixed top-[calc(var(--corner)-16px)] right-[calc(var(--corner)-12px)] z-[350] min-w-[44px] p-[12px] text-right underline decoration-transparent decoration-1 underline-offset-[5px] transition-[text-decoration-color] duration-300 hover:decoration-current"
        >
          {open ? "Close" : "Menu ::"}
        </button>

        {/* The left column: the routes, mid-height, one square. */}
        {/*
          The side column. It only exists while the home spiral is
          pinned on screen: `html[data-spiral-active]`, set by the spiral:
          because every other section is editorial and uses the left edge.
          MENU carries the navigation everywhere else.
        */}
        <nav
          aria-label="Primary"
          className="chrome side-nav fixed top-1/2 left-[var(--corner)] z-[350] -translate-y-1/2 max-tablet:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="relative">
                  {/*
                    The square takes the column's own colour, not the accent:
                    it lives in the blended layer, where yellow would invert.
                  */}
                  <span
                    aria-hidden
                    className={`bg-current absolute top-1/2 -left-[2px] h-[6px] w-[6px] -translate-y-1/2 transition-opacity duration-300 ${
                      active ? "opacity-100" : "opacity-0"
                    }`}
                  />
                  <TransitionLink
                    href={item.href}
                    className={`label block pl-[16px] transition-opacity duration-300 hover:opacity-100 ${
                      active ? "opacity-100" : "opacity-60"
                    }`}
                  >
                    {item.label}
                  </TransitionLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      {/* The menu. */}
      <div
        ref={overlay}
        id="site-menu"
        aria-hidden={!open}
        className="gradient-ink text-paper fixed inset-0 z-[345] flex flex-col justify-between overflow-y-auto px-[var(--corner)] pt-[calc(var(--corner)+56px)] pb-[var(--corner)] opacity-0"
        style={{ visibility: "hidden" }}
      >
        <nav aria-label="Menu" className="flex flex-col items-end">
          {NAV.map((item) => (
            <div key={item.href} className="overflow-hidden">
              <TransitionLink
                href={item.href}
                data-menu-link
                onClick={() => setOpen(false)}
                // Sized by height as well, so five lines fit a laptop screen.
                className="group display block py-[0.04em] text-[clamp(40px,min(7.5vw,10.5vh),112px)] uppercase"
              >
                {/* Two copies, so the label rolls on hover. */}
                <span className="relative block overflow-hidden">
                  <span className="block transition-transform duration-500 [transition-timing-function:var(--ease-brand)] group-hover:-translate-y-full">
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-accent absolute inset-0 block translate-y-full transition-transform duration-500 [transition-timing-function:var(--ease-brand)] group-hover:translate-y-0"
                  >
                    {item.label}
                  </span>
                </span>
              </TransitionLink>
            </div>
          ))}
        </nav>

        <div className="label flex flex-wrap justify-between gap-[1em]">
          <a
            href={`mailto:${SITE.email}`}
            className="hover:text-accent opacity-65 transition-[opacity,color] duration-300 hover:opacity-100"
          >
            {SITE.email}
          </a>
          <span className="opacity-65">{SITE.city}</span>
        </div>
      </div>
    </>
  );
}
