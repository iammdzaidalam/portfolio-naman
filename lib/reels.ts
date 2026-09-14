/**
 * The client's video, cut down for the web.
 *
 * Generated from their "website content" drive. The sources are 4K vertical
 * phone footage (15 to 40 seconds, 40 to 775MB each), which is why nothing
 * here is the original: each clip is capped at twelve seconds, scaled to a
 * 1280px long edge, stripped of its audio track and given a poster cut from
 * its own first second.
 *
 * Grouped by the folder they arrived in, which is also the slot they fill.
 * Several of these exist only because the photography could not honestly cover
 * that slot: there is no product photography anywhere in the drive, and no
 * shop floor for the fashion client.
 */

export type Reel = {
  src: string;
  poster: string;
  /** What the clip shows, for anyone who cannot watch it. */
  alt: string;
  /** Intrinsic size of the transcoded file. */
  w: number;
  h: number;
};

/**
 * Every folder of footage the drive supplied. A key is absent when nothing in
 * that folder survived the cut, which the callers treat as "no video here":
 * the slot falls back to its photograph rather than showing the wrong clip.
 */
export type ReelKey =
  | "intro"
  | "viral"
  | "bts"
  | "product"
  | "suitcase"
  | "personal"
  | "store"
  | "pgbrand"
  | "clothing"
  | "kolkata";

export const REELS: Partial<Record<ReelKey, Reel[]>> = {

  intro: [
    { src: "/video/reels/intro-01.mp4", poster: "/video/posters/intro-01.jpg", w: 720, h: 1280, alt: "Man in a cream shirt sits in an office chair speaking to camera, warm window light on the wall behind him." },
    { src: "/video/reels/intro-03.mp4", poster: "/video/posters/intro-03.jpg", w: 720, h: 1280, alt: "Man holds a wireless mic and speaks to camera in a home studio with a neon camera sign and desk setup." },
  ],
  bts: [
    { src: "/video/reels/bts-01.mp4", poster: "/video/posters/bts-01.jpg", w: 720, h: 1280, alt: "Studio set with two Godox softboxes flanking a white cyc wall and hard-shell suitcases staged on the floor" },
    { src: "/video/reels/clothing-06.mp4", poster: "/video/posters/clothing-06.jpg", w: 720, h: 1280, alt: "Out-of-focus film clapperboard fills the frame; behind it a clothing rack and a woman seated on a rug" },
  ],
  product: [
    { src: "/video/reels/product-03.mp4", poster: "/video/posters/product-03.jpg", w: 720, h: 1280, alt: "A smiling woman rests her hand on a dark trolley suitcase on a street below a red sandstone fort" },
    { src: "/video/reels/suitcase-01.mp4", poster: "/video/posters/suitcase-01.jpg", w: 720, h: 1280, alt: "Model in a cream trench coat sits on an olive hardshell suitcase in a white studio, a second case beside her." },
    { src: "/video/reels/product-01.mp4", poster: "/video/posters/product-01.jpg", w: 720, h: 1280, alt: "Two grey hardshell suitcases on a pale studio backdrop, a woman in black stepping past, all out of focus" },
    { src: "/video/reels/suitcase-02.mp4", poster: "/video/posters/suitcase-02.jpg", w: 720, h: 1280, alt: "Close-up of a hand gripping the black telescoping handle of a rolling suitcase, tiled floor blurred behind." },
  ],
  suitcase: [
    { src: "/video/reels/product-02.mp4", poster: "/video/posters/product-02.jpg", w: 720, h: 1280, alt: "A young man in a black ZENSU polo talks to camera, hands open, behind a wooden table by a cream wall" },
  ],
  personal: [
    { src: "/video/reels/personal-04.mp4", poster: "/video/posters/personal-04.jpg", w: 720, h: 1280, alt: "Bearded man in a checked blazer and green glasses at a wooden office desk, framed certificates behind." },
    { src: "/video/reels/personal-02.mp4", poster: "/video/posters/personal-02.jpg", w: 720, h: 1280, alt: "Man in a coral polo reaches for a book on a lit yellow shelf; trophies above, channel logo top-left." },
    { src: "/video/reels/personal-01.mp4", poster: "/video/posters/personal-01.jpg", w: 720, h: 1280, alt: "Man in a coral polo gestures mid-sentence at his desk, exposed brick behind him, laptop open beside him." },
  ],
  store: [
    { src: "/video/reels/store-03.mp4", poster: "/video/posters/store-03.jpg", w: 720, h: 1280, alt: "Two women browse a backlit liquor store wall stacked with vodka and tequila bottles beneath an Absolut sign" },
    { src: "/video/reels/store-01.mp4", poster: "/video/posters/store-01.jpg", w: 720, h: 1280, alt: "Woman in a pale pink kurta set posing on a sunlit pavement outside the Fashor clothing store" },
    { src: "/video/reels/store-02.mp4", poster: "/video/posters/store-02.jpg", w: 720, h: 1280, alt: "Man walks past Hedonne's lit glass storefront under leafy branches; overlaid title reads a girl's day at Hedonne" },
  ],
  pgbrand: [
    { src: "/video/reels/viral-01.mp4", poster: "/video/posters/viral-01.jpg", w: 720, h: 1280, alt: "Seven people lined up against a white wall below a bold yellow \"Introducing\" caption in a vertical reel" },
  ],
  clothing: [
    { src: "/video/reels/clothing-03.mp4", poster: "/video/posters/clothing-03.jpg", w: 720, h: 1280, alt: "Woman in a blush floral anarkali turns beside a carved wooden screen hung with marigold garlands" },
    { src: "/video/reels/clothing-05.mp4", poster: "/video/posters/clothing-05.jpg", w: 720, h: 1280, alt: "Smiling woman in an embroidered orange kurta stands by a brass gong and carved wooden screen" },
    { src: "/video/reels/clothing-02.mp4", poster: "/video/posters/clothing-02.jpg", w: 720, h: 1280, alt: "Model in a bright multicoloured printed kurta and dupatta poses with a makeup brush by marigold strands" },
    { src: "/video/reels/clothing-01.mp4", poster: "/video/posters/clothing-01.jpg", w: 720, h: 1280, alt: "Woman in a cream kurta holds up two festive ethnic outfits on hangers beside marigold garlands" },
    { src: "/video/reels/clothing-04.mp4", poster: "/video/posters/clothing-04.jpg", w: 720, h: 1280, alt: "Two women in matching teal and pink bandhani kurta sets walk hand in hand past a gold-flecked wall" },
  ],
  kolkata: [
    { src: "/video/reels/pgbrand-01.mp4", poster: "/video/posters/pgbrand-01.jpg", w: 720, h: 1280, alt: "Yellow Kolkata taxi rolling up a leafy lane as a woman with a suitcase flags it down from the kerb" },
    { src: "/video/reels/intro-02.mp4", poster: "/video/posters/intro-02.jpg", w: 720, h: 1280, alt: "Man with a clip-on mic walks along tram tracks toward camera as a teal Kolkata tram waits behind him." },
  ],
};
