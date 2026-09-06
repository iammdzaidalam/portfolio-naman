import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

// Lenis's own stylesheet. It resets the document height it takes over and
// defines the class it uses to pause scrolling; without it a stray height rule
// on <html> can leave the page unscrollable.
import "lenis/dist/lenis.css";
import "./globals.css";
import { SITE } from "@/lib/content";
import { LoadingProvider } from "@/components/loader";
import TransitionProvider from "@/components/transition/transition-provider";
import SiteHeader from "@/components/site-header";
import SiteFooter from "@/components/site-footer";
import SmoothScroll from "@/components/effects/smooth-scroll";
import Cursor from "@/components/effects/cursor";

/**
 * PP Neue Montreal, served locally. It is the face both noth.in and
 * hobro.digital are set in, and only the Medium cut is licensed into this repo
 * — so the site uses one weight throughout and builds hierarchy from size,
 * tracking and opacity instead.
 */
const neueMontreal = localFont({
  src: "./fonts/PPNeueMontreal-Medium.woff2",
  weight: "500",
  style: "normal",
  display: "swap",
  variable: "--font-neue-montreal",
  fallback: ["Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
});

/** Geist Mono, for every small tracked label — as on loop-agency. */
const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://socialyatri.com"),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  openGraph: {
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    locale: "en_IN",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2efe9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${neueMontreal.variable} ${geistMono.variable}`}
    >
      {/*
        `text-[length:var(--size-font)]` wires up Osmo's scaling system: the
        root font size is a function of viewport width, which is why the layout
        is written in `em` and scales rather than stepping at breakpoints.
      */}
      <body className="bg-paper text-ink font-sans text-[length:var(--size-font)] leading-[1.4] font-medium antialiased">
        <a
          href="#main"
          className="label focus:bg-accent focus:text-ink sr-only focus:not-sr-only focus:fixed focus:top-[var(--gutter)] focus:left-[var(--gutter)] focus:z-[500] focus:px-[12px] focus:py-[8px]"
        >
          Skip to content
        </a>
        <SmoothScroll />
        <Cursor />
        <div className="grain" aria-hidden />

        <LoadingProvider>
          <TransitionProvider chrome={<SiteHeader />}>
            {children}
            <SiteFooter />
          </TransitionProvider>
        </LoadingProvider>
      </body>
    </html>
  );
}
