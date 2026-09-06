"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";

import { NAV, SITE } from "@/lib/content";
import { gsap } from "@/lib/gsap";
import SocialYatriLogo from "@/components/logo/social-yatri-logo";
import TransitionLink from "@/components/transition/transition-link";

/**
 * The site's chrome, laid out the way loop-agency lays out its viewport:
 * the mark top-left, MENU top-right, and the primary navigation as a mono
 * column pinned to the left edge at mid-height, with a small square marking
 * the active route. All of it is fixed and takes the surface-aware chrome
 * colour, so one set of furniture reads over both paper and ink.
 *
 * MENU opens an overlay of the same routes set very large, right-aligned,
 * which is loop-agency's menu; the hover roll on each link is theirs too.
 *
 * The mark is hidden until the loader hands it over with `Flip.fit`.
 */
export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const overlay = useRef<HTMLDivElement>(null);

  /*
   * The chrome is ink over paper and paper over ink. Every ink section
   * carries `data-surface="ink"`; on each scroll the header checks whether
   * one of them sits under the 56px line the mark and MENU occupy, and flips
   * the root attribute. The open menu is an ink surface too. Plain geometry
   * rather than ScrollTrigger: two rect reads a frame is nothing, and it has
   * no refresh or pin interactions to fall out of step with.
   */
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>('[data-surface="ink"]'),
    );
    // The mark spans 44–85px; flipping on its midline keeps it one colour.
    const LINE = 66;
    const apply = () => {
      const under =
        open ||
        sections.some((el) => {
          const r = el.getBoundingClientRect();
          return r.top <= LINE && r.bottom >= LINE;
        });
      if (under) document.documentElement.setAttribute("data-chrome", "light");
      else document.documentElement.removeAttribute("data-chrome");
    };
    apply();
    window.addEventListener("scroll", apply, { passive: true });
    window.addEventListener("resize", apply);
    document.fonts.ready.then(apply);
    return () => {
      window.removeEventListener("scroll", apply);
      window.removeEventListener("resize", apply);
      document.documentElement.removeAttribute("data-chrome");
    };
  }, [pathname, open]);

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

  return (
    <>
      {/* Corner furniture. */}
      {/* Above the transition covers (z-300), below the loader (z-400). */}
      <header className="chrome pointer-events-none fixed inset-0 z-[350]">
        <TransitionLink
          href="/"
          aria-label={`${SITE.name} — home`}
          className="pointer-events-auto absolute top-[var(--corner)] left-[var(--corner)] block w-[112px]"
        >
          <span data-header-logo className="block w-full">
            <SocialYatriLogo className="w-full" fg="currentColor" bg="var(--chrome-bg)" accent="var(--accent)" />
          </span>
        </TransitionLink>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="site-menu"
          // Padded out to a 44px target without moving the text off the corner.
          className="label hover:text-accent pointer-events-auto absolute top-[calc(var(--corner)-16px)] right-[calc(var(--corner)-12px)] min-w-[44px] p-[12px] text-right transition-colors duration-300"
        >
          {open ? "Close" : "Menu ::"}
        </button>

        {/* loop-agency's left column: the routes, mid-height, one square. */}
        {/*
          loop-agency's side column. It only exists while the home spiral is
          pinned on screen — `html[data-spiral-active]`, set by the spiral —
          because every other section is editorial and uses the left edge.
          MENU carries the navigation everywhere else.
        */}
        <nav
          aria-label="Primary"
          className="side-nav pointer-events-auto absolute top-1/2 left-[var(--corner)] -translate-y-1/2 max-tablet:hidden"
        >
          <ul className="flex flex-col">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <li key={item.href} className="relative">
                  <span
                    aria-hidden
                    className={`bg-accent absolute top-1/2 -left-[2px] h-[6px] w-[6px] -translate-y-1/2 transition-opacity duration-300 ${
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
                  <span className="block transition-transform duration-500 [transition-timing-function:var(--ease-osmo)] group-hover:-translate-y-full">
                    {item.label}
                  </span>
                  <span
                    aria-hidden
                    className="text-accent absolute inset-0 block translate-y-full transition-transform duration-500 [transition-timing-function:var(--ease-osmo)] group-hover:translate-y-0"
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
