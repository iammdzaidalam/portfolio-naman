"use client";

import { useRef } from "react";
import { usePathname } from "next/navigation";
import { useGSAP } from "@gsap/react";

import { CONNECT, NAV, SITE } from "@/lib/content";
import TransitionLink from "@/components/transition/transition-link";
import Reveal from "@/components/effects/reveal";

/**
 * The footer.
 *
 * One viewport tall. The closing line and two outlined pills sit top-left, the
 * social links form a column at four-fifths of the width, a mono row runs along
 * the bottom edge, and the wordmark is set as wide as the page and bled off the
 * bottom so only its upper four-fifths show.
 */
export default function SiteFooter() {
  const mark = useRef<HTMLSpanElement>(null);
  // On the contact page the question is already the h1 above the form, so the
  // footer closes with the tagline and drops the pill that leads back here.
  const onContact = usePathname() === "/contact";

  /*
   * The wordmark is fitted to the width between the gutters by measurement,
   * not by a guessed `vw` size: the fit depends on the face's advance widths,
   * and the fallback face measures differently from PP Neue Montreal.
   */
  useGSAP(() => {
    const el = mark.current;
    const box = el?.parentElement;
    if (!el || !box) return;

    const fit = () => {
      el.style.fontSize = "100px";
      const ratio = box.clientWidth / el.scrollWidth;
      el.style.fontSize = `${Math.floor(100 * ratio * 100) / 100}px`;
      box.style.height = `${Math.round(el.offsetHeight * 0.8)}px`;
    };

    fit();
    document.fonts.ready.then(fit);
    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(fit, 100);
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  });

  return (
    <footer data-surface="ink" className="gradient-ink text-paper relative flex min-h-dvh flex-col overflow-hidden px-[var(--gutter)] pt-[calc(var(--corner)+96px)] pb-[calc(13vw+72px)]">
      <div className="grid grid-cols-[1fr_auto] items-start gap-[3em] max-tablet:grid-cols-1">
        <div>
          <Reveal as="h2" className="display max-w-[6.5em] text-[clamp(44px,6.6vw,104px)]">
            {onContact ? SITE.tagline : CONNECT.question}
          </Reveal>

          {/* The house line, in the client's own words. */}
          <Reveal
            as="p"
            splitLines={false}
            className="statement text-accent mt-[0.6em] text-[clamp(20px,2.4vw,34px)]"
          >
            <span lang="hi-Latn">{SITE.tagline}</span>
          </Reveal>

          <div className="mt-[28px] flex flex-wrap gap-[10px]">
            {onContact ? null : (
              <TransitionLink href="/contact" className="pill">
                <span>{CONNECT.submit.replace(" →", "")}</span>
                <span aria-hidden>→</span>
              </TransitionLink>
            )}
            <a href={`mailto:${SITE.email}`} className="pill">
              <span>Drop us an email</span>
              <span aria-hidden>@</span>
            </a>
          </div>
        </div>

        <ul className="mr-[8vw] flex flex-col max-tablet:mr-0">
          {/* No profile URLs yet, so these are names, not links. */}
          <li className="statement text-[clamp(20px,1.9vw,28px)] opacity-60">Instagram</li>
          <li className="statement text-[clamp(20px,1.9vw,28px)] opacity-60">LinkedIn</li>
          <li>
            <a
              href={`mailto:${SITE.email}`}
              className="statement hover:text-accent block text-[clamp(20px,1.9vw,28px)] opacity-60 transition-[opacity,color] duration-300 hover:opacity-100"
            >
              Email
            </a>
          </li>
        </ul>
      </div>

      <div className="flex-1" />

      {/*
        The wordmark, set wider than the page and bled off the bottom edge so
        only its upper four-fifths show, which is what makes it read as the
        ground of the page rather than a line of type.
      */}
      <div
        className="pointer-events-none absolute inset-x-[var(--gutter)] bottom-[56px] h-[13vw] overflow-hidden select-none"
        aria-hidden
      >
        <span
          ref={mark}
          className="display absolute top-0 left-0 block leading-[0.78] whitespace-nowrap uppercase"
        >
          {SITE.name}
        </span>
      </div>

      {/* The bottom row, over the wordmark. */}
      <div className="label-xs absolute inset-x-[var(--gutter)] bottom-[var(--gutter)] z-10 flex items-center justify-between gap-[1em] mix-blend-difference max-mobile:flex-wrap">
        <span>{SITE.copyright} · {SITE.madeIn}</span>
        <nav aria-label="Footer" className="flex gap-[1.25em] max-tablet:hidden">
          {NAV.map((item) => (
            <TransitionLink key={item.href} href={item.href} className="opacity-70 transition-[opacity,color] duration-300 hover:text-accent hover:opacity-100">
              {item.label}
            </TransitionLink>
          ))}
        </nav>
        <span className="flex items-center gap-[1em]">
          <span className="max-mobile:hidden">{SITE.city}</span>
          <span className="bg-accent text-ink rounded-[3px] px-[6px] py-[2px] text-[11px] font-medium">EN</span>
        </span>
      </div>
    </footer>
  );
}
