/**
 * Every word on the site.
 *
 * The copy is the client’s, taken from `social yatri.docx`. Their headings are
 * set in caps in that file; here they carry normal case and the display styles
 * do the shouting, which is the only liberty taken with the wording. Obvious
 * typos in the source (“bran”, “calender”, “roght”, “imposibble”) are corrected
 * and nothing else is reworded.
 *
 * Where a heading is written as two lines in the source, the break is preserved
 * as a separate array entry so the reveal animations can mask each line
 * independently.
 */

import type { ShootKey } from "./gallery";
import type { ReelKey } from "./reels";

export const SITE = {
  name: "Social Yatri",
  /**
   * The client's own line, in their words and their transliteration. Left in
   * Hindi on purpose: translating it would cost the rhyme, which is the whole
   * reason it works. Carried with `lang="hi-Latn"` wherever it is shown, so a
   * screen reader does not read it as mangled English.
   */
  tagline: "Joh dikhta hai wahi toh bikta hai",
  description:
    "We combine strategy, creativity, content, branding, technology, and performance marketing to help businesses build a strong digital presence and grow online.",
  city: "Kolkata, West Bengal, India",
  email: "thesocialyatri@gmail.com",
  /*
   * Given as ten digits; the +91 is inferred from the Kolkata address, and the
   * href carries it because a bare local number does not dial from abroad.
   */
  phone: "+91 97073 44375",
  phoneHref: "tel:+919707344375",
  address: "91/6, Beltala Road, Bhawanipur, Kolkata 700026",
  /*
   * TODO: still unconfirmed. These two are the last placeholders on the site,
   * so they are held back from the contact list rather than published as a
   * guess: a wrong handle sends people to somebody else's account.
   */
  instagram: "",
  linkedin: "",
  madeIn: "Born in Kolkata. Built for the internet.",
  copyright: "© 2026 Social Yatri",
} as const;

export const NAV = [
  { label: "Home", href: "/" },
  { label: "Services", href: "/services" },
  { label: "Work", href: "/work" },
  { label: "Studio", href: "/studio" },
  { label: "Connect", href: "/contact" },
] as const;

export const HERO = {
  /* Every line here is the client's, from the studio and services sections. */
  eyebrow: "Strategy · Content · Branding · Performance",
  headline: ["We turn brands into", "stories people remember."],
  lede: ["We make brands", "impossible to ignore."],
} as const;

export const ABOUT = {
  sign: "Studio",
  claim: "We turn brands into stories people remember.",
  body: [
    "At Social Yatri, we don’t believe marketing is just about posting content or running ads. We combine strategy, creativity, content, branding, technology, and performance marketing to help businesses build a strong digital presence and grow online.",
    "Because getting views is great. Getting followers is great. But building a brand that people remember and a marketing system that generates business is what really matters.",
  ],
  /* The turn in the client's own argument, set as the closing statement. */
  close: ["We connect", "the dots."],
} as const;

/* ---------------------------------------------------------------------------
 * Services
 * ------------------------------------------------------------------------- */

export type Service = {
  no: string;
  name: string;
  /** The client’s one-line promise for the stop. */
  desc: string;
  /** The site’s own shelf label, not the client’s. */
  tag: string;
  /** The paragraphs under the promise. */
  body: string[];
  /** What the stop covers: the client’s own list where they gave one. */
  detail: string[];
  /** The client only wrote a goal line for the first service. */
  goal?: string;
};

export const SERVICES: Service[] = [
  {
    no: "01",
    name: "Social Media Management",
    desc: "Your social media, handled strategically.",
    tag: "Ongoing",
    body: [
      "Your social media profile is often the first place potential customers discover your brand. We manage your social presence with a clear strategy instead of simply filling up your feed.",
      "From content planning and posting to community management and performance tracking, we take care of your social media while keeping your brand consistent and relevant.",
    ],
    detail: [
      "Social media strategy",
      "Monthly content calendars",
      "Instagram & Facebook management",
      "Creative posts & reels",
      "Captions and hashtags",
      "Community management",
      "Content scheduling",
      "Monthly performance reports",
    ],
    goal: "Build a consistent social presence that keeps your audience engaged and your brand top-of-mind.",
  },
  {
    no: "02",
    name: "Social Media Marketing",
    desc: "Get seen by the right people.",
    tag: "Growth",
    body: [
      "Social media is crowded. Standing out requires more than good-looking posts.",
      "Our social media marketing services combine creative content, audience research, platform strategy, and campaigns designed to increase your brand awareness, engagement, enquiries, and growth.",
    ],
    detail: [
      "We create marketing strategies specifically around your business, audience, industry, and goals.",
      "From organic growth to paid campaigns, we help turn social media attention into meaningful business opportunities.",
    ],
  },
  {
    no: "03",
    name: "Content Creation",
    desc: "Scroll-stopping content. Built for your brand.",
    tag: "Production",
    body: [
      "Content is at the heart of modern digital marketing.",
      "We create reels, videos, static creatives, carousels, product content, campaign creatives, and branded visual content that are designed to grab attention and communicate your message quickly.",
      "Our creative process combines storytelling, trends, visual design, and brand identity to create content that doesn’t just look good. It has a purpose.",
    ],
    detail: [
      "Instagram Reels",
      "Social media posts",
      "Carousels",
      "Product videos",
      "Brand videos",
      "Campaign creatives",
      "Promotional content",
      "Short-form videos",
    ],
  },
  {
    no: "04",
    name: "Content Strategy",
    desc: "Don’t just create content. Create content with a reason.",
    tag: "Foundation",
    body: [
      "Posting consistently is easy. Knowing what to post, why to post it, and how it supports your business goals is where strategy comes in.",
      "Our content strategy connects your brand goals with what your audience actually wants to watch, read, and share.",
    ],
    detail: [
      "We identify content pillars, audience interests, formats, trends, storytelling opportunities, and campaign ideas to create a structured content roadmap.",
      "Strategy first. Content second. Growth follows.",
    ],
  },
  {
    no: "05",
    name: "UGC Videos",
    desc: "Make your brand feel real.",
    tag: "Production",
    body: [
      "People trust people.",
      "Our UGC video content is designed to make your products and services feel authentic, relatable, and native to social media.",
    ],
    detail: [
      "From product reviews and testimonials to unboxings, demonstrations, talking-head videos, and lifestyle content, we create UGC-style videos that help brands connect with audiences on a more personal level.",
      "Perfect for Instagram, Facebook, YouTube Shorts, and paid advertising campaigns.",
    ],
  },
  {
    no: "06",
    name: "Branding",
    desc: "Build a brand people recognize.",
    tag: "Design",
    body: [
      "Your brand is more than a logo.",
      "We help businesses build a strong and consistent brand identity across digital and offline touchpoints.",
      "From visual identity to brand communication, we create branding systems that make your business look professional, memorable, and recognizable.",
    ],
    detail: [
      "Brand identity",
      "Logo design",
      "Brand colour systems",
      "Typography",
      "Visual direction",
      "Brand guidelines",
      "Creative communication",
      "Social media branding",
    ],
  },
  {
    no: "07",
    name: "Personal Branding",
    desc: "Turn your expertise into influence.",
    tag: "1:1",
    body: [
      "People connect with people before they connect with businesses.",
      "Our personal branding services help founders, entrepreneurs, professionals, consultants, and creators establish a strong online identity and become recognizable voices in their industries.",
    ],
    detail: [
      "We help you define your positioning, develop content pillars, create content, and build a consistent presence across social platforms.",
      "Your expertise is valuable. We help the internet see it.",
    ],
  },
  {
    no: "08",
    name: "Ad Films & Product Shoots",
    desc: "Make your product impossible to ignore.",
    tag: "Production",
    body: [
      "Your product deserves more than a basic photograph.",
      "We create professional product shoots, advertising films, promotional videos, and campaign content designed to showcase your product through strong visuals and storytelling.",
    ],
    detail: [
      "From concept development and scripting to production and post-production, we create visual content that can be used across your website, social media, advertisements, and marketing campaigns.",
      "Shoot it. Tell the story. Make people want it.",
    ],
  },
  {
    no: "09",
    name: "Website Development",
    desc: "Your website should work as hard as your brand.",
    tag: "Build",
    body: [
      "Your website is more than an online brochure. It should communicate your value, build trust, create a great user experience, and turn visitors into customers.",
      "We develop modern, responsive, user-friendly websites that combine design, functionality, content, SEO fundamentals, and conversion-focused thinking.",
    ],
    detail: [
      "Business websites",
      "Landing pages",
      "Portfolio websites",
      "Responsive design",
      "UI/UX",
      "SEO-friendly structure",
      "Conversion-focused layouts",
      "Website content integration",
    ],
  },
  {
    no: "10",
    name: "Performance Marketing",
    desc: "Spend smarter. Grow faster.",
    tag: "Paid",
    body: [
      "Great creative gets attention. Great performance marketing turns that attention into measurable results.",
      "Our performance marketing services use paid advertising, audience targeting, creative testing, campaign optimisation, and data analysis to help businesses generate leads, sales, enquiries, and conversions.",
      "We continuously analyse campaign performance and optimise what matters, helping you make better use of your advertising budget.",
    ],
    detail: [
      "Meta Ads",
      "Google Ads",
      "Lead generation campaigns",
      "Conversion campaigns",
      "Retargeting",
      "Audience targeting",
      "Creative testing",
      "Campaign optimisation",
      "Performance reporting",
    ],
  },
];

export const SERVICES_INTRO = {
  sign: "Services",
  question: "What do we actually do?",
  sub: "We turn brands into stories people remember.",
  body: [
    "At Social Yatri, we don’t believe marketing is just about posting content or running ads. We combine strategy, creativity, content, branding, technology, and performance marketing to help businesses build a strong digital presence and grow online.",
    "From your first Instagram post to your next big campaign, we help you look better, communicate better, reach the right audience, and convert attention into business.",
    "Whether you’re a startup, local business, growing brand, or established company, our services are designed to create meaningful digital growth.",
  ],
} as const;

/** The client’s closing argument on the services page. */
export const WHY = {
  sign: "Why us",
  question: [
    "We don’t just manage your marketing.",
    "We become part of your growth journey.",
  ],
  list: [
    "There are agencies that create content.",
    "There are agencies that run ads.",
    "There are agencies that build websites.",
  ],
  turn: "We connect the dots.",
  body: [
    "At Social Yatri, our approach brings together content + strategy + branding + technology + performance so every part of your digital presence works together.",
    "Because getting views is great. Getting followers is great. But building a brand that people remember and a marketing system that generates business is what really matters.",
  ],
  ask: "Ready to take your brand further?",
  close: "Let’s build something people can’t scroll past.",
} as const;

/* ---------------------------------------------------------------------------
 * Work
 * ------------------------------------------------------------------------- */

export type Ride = {
  slug: string;
  title: string;
  category: string;
  tag: string;
  /** The client's own photography, from their “website content” drive. */
  frame: string;
  /** What the frame shows, for anyone who cannot see it. */
  alt: string;
  /**
   * `object-position` for the frame. Every ride is shown at 4:3, 16:9, 3:4 and
   * 1:1, so a frame whose subject sits off-centre has to be told where to hold
   * or an automatic centre crop walks off the side of it.
   */
  focus?: string;
  /**
   * The shoot this piece came out of, keyed into `lib/gallery.ts`. The detail
   * page shows that whole set, so the frame above is an opening rather than the
   * only thing there is to see. Several pieces can share a shoot; four of
   * these came off the same two days.
   */
  shoot: ShootKey;
  /**
   * The client's own clips for this piece, keyed into `lib/reels.ts`. Only some
   * pieces have footage; the two product slots have nothing else, since there
   * is no product photography anywhere in what they supplied.
   */
  reels?: ReelKey;
};

/**
 * The filters are the client's own shoot folders, which is the only grouping of
 * this work that exists outside our heads. Each ride names the shoot it came
 * out of in `shoot`, so the filter is a fact about the footage rather than a
 * category invented to fill a control.
 */
export const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "wedding", label: "Wedding" },
  { id: "interior", label: "Interiors" },
  { id: "corporate", label: "Events" },
  { id: "baby", label: "Studio portraits" },
  { id: "fitness", label: "Fitness" },
  { id: "hotel", label: "Hotels" },
] as const;

export const RIDES: Ride[] = [
  {
    slug: "founder-story",
    title: "Founder story",
    category: "founders",
    tag: "Founder & Personal",
    frame: "/img/corporate-writer.jpg",
    alt: "Older bearded man in glasses writing in a notebook, framed by blurred foreground figures",
    shoot: "corporate",
    reels: "intro",
  },
  {
    slug: "viral-branding",
    title: "Viral branding",
    category: "branding",
    tag: "Branding",
    frame: "/img/corporate-exhibition.jpg",
    alt: "Exhibition corridor with orange calligraphy signage, works on easels and a red opening ribbon",
    shoot: "corporate",
    reels: "viral",
    // The signage wall is the subject and it runs down the left.
    focus: "30% 50%",
  },
  {
    slug: "off-camera",
    title: "Off camera",
    category: "edits",
    tag: "Reels & Edits",
    frame: "/img/studio-baby-shoot.jpg",
    alt: "Father seated on a white studio floor steadying a laughing toddler on its feet",
    shoot: "baby",
    reels: "bts",
  },
  {
    slug: "product-spotlight",
    title: "Product spotlight",
    category: "product",
    tag: "Product",
    frame: "/img/hotel-washstand.jpg",
    alt: "Antique wooden washstand with a ceramic basin beside tall glazed doors",
    shoot: "hotel",
    reels: "product",
    // The washstand sits right of centre against the light.
    focus: "65% 45%",
  },
  {
    slug: "personal-branding",
    title: "Personal branding",
    category: "founders",
    tag: "Founder & Personal",
    frame: "/img/fitness-pose.jpg",
    alt: "Bald bodybuilder in a camo vest hitting a double biceps pose and grinning in a crowd",
    shoot: "fitness",
    reels: "personal",
    focus: "50% 35%",
  },
  {
    slug: "store-stories",
    title: "Store stories",
    category: "store",
    tag: "Store Stories",
    frame: "/img/interior-living-room.jpg",
    alt: "Living room with an arched partition, wall-mounted screen, blush sofa and bouclé tub chairs",
    shoot: "interior",
    reels: "store",
  },
  {
    slug: "beyond-the-feed",
    title: "Beyond the feed",
    category: "branding",
    tag: "Branding",
    frame: "/img/corporate-floor-canvas.jpg",
    alt: "Calligrapher brushing large blue letterforms onto a floor canvas as a crowd photographs him",
    shoot: "corporate",
    focus: "50% 60%",
  },
  {
    slug: "the-viral-edit",
    title: "The viral edit",
    category: "edits",
    tag: "Reels & Edits",
    frame: "/img/wedding-gateway.jpg",
    alt: "Couple in white laughing together in front of a pink sandstone gateway",
    shoot: "wedding",
    focus: "60% 50%",
  },
  {
    slug: "product-talking-head",
    title: "Product talking head",
    category: "product",
    tag: "Product",
    frame: "/img/corporate-speaker.jpg",
    alt: "Young speaker with a microphone gesturing in front of a projected slide",
    shoot: "corporate",
    reels: "suitcase",
    // The speaker is left of frame; a centre crop would hold only the slide.
    focus: "35% 50%",
  },
];

export const WORK_INTRO = {
  sign: "Our work",
  question: "We make brands impossible to ignore.",
  sub: "From scroll-stopping content to campaigns that deliver. Here’s what we’ve created.",
} as const;

/* ---------------------------------------------------------------------------
 * Numbers
 * ------------------------------------------------------------------------- */

export const GROWTH = {
  sign: "Growth",
  question: "Okay… but did it work?",
  sub: "Here’s the part that actually matters.",
  before: { label: "Before", value: "50,000", unit: "followers" },
  after: { label: "After", value: "4,50,000", unit: "followers" },
  deltaLabel: "Change",
  delta: "+800%",
  cells: [
    { target: 450000, suffix: "", label: "Cumulative reach" },
    { target: 111, suffix: "%", label: "Avg. engagement lift, 90 days" },
    { target: 450000, suffix: "", label: "Followers grown organically" },
    { target: 3, suffix: " cities", label: "Where the content travels" },
  ],
} as const;

export const PROCESS = {
  sign: "The process",
  question: "How we cook.",
  sub: "Eight stages, zero guesswork.",
  steps: [
    {
      no: "01",
      title: "Find the problem",
      body: "Why isn’t this brand landing yet? We start there, not with a content calendar.",
    },
    {
      no: "02",
      title: "Stalk the audience",
      body: "Who they follow, what they save, why they scroll past everything else.",
    },
    {
      no: "03",
      title: "Cook the strategy",
      body: "Pillars, positioning, a plan built for this brand, not a template.",
    },
    {
      no: "04",
      title: "Make the content",
      body: "Shoot, design, write. Built to be watched, not scrolled past.",
    },
    { no: "05", title: "Post", body: "Right platform, right format, right moment." },
    {
      no: "06",
      title: "Watch the numbers",
      body: "Reach, saves, shares, replies: the stuff that actually means something.",
    },
    {
      no: "07",
      title: "Double down",
      body: "More of what worked. Less of what didn’t. No ego about it.",
    },
    { no: "08", title: "Grow", body: "Compounding, organic, increasingly self-sustaining." },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * Studio
 * ------------------------------------------------------------------------- */

export const KOLKATA = {
  sign: "Home turf",
  question: ["Born in Kolkata.", "Built for the internet."],
  cards: [
    {
      title: "We think different. We create louder.",
      body: "Strategy, content and campaigns that make brands impossible to scroll past.",
    },
    {
      title: "Local vibe. Global scroll.",
      body: "Rooted in Kolkata, creating content that travels far beyond it.",
    },
    {
      title: "Ideas start here. Impact takes them further.",
      body: "From strategy to storytelling, we turn brand thought into digital experiences.",
    },
    {
      title: "No boring content",
      body: "Every street has a story. So does every brand, if you look properly.",
    },
  ],
} as const;

/* ---------------------------------------------------------------------------
 * Clients
 *
 * The client supplied two case studies with real figures. Nothing here is
 * rounded up or invented. Where they gave no number, there is no number.
 * ------------------------------------------------------------------------- */

export type CaseStudy = {
  name: string;
  claim: string;
  intro: string[];
  metrics: { value: string; label: string; note: string }[];
  did: string[];
  result: string[];
  frame: string;
  alt: string;
  /** The client's clips for this brand, keyed into `lib/reels.ts`. */
  reels?: ReelKey;
};

export const CLIENTS = {
  sign: "Clients",
  question: "People who rode with us.",
  sub: "We don’t just create content. We create growth.",
  body: [
    "Good marketing should be more than likes, views, and followers.",
    "At Social Yatri we focus on creating content and digital strategies that help brands build visibility, grow their audience, and become more relevant in the digital space.",
    "From premium co-living and PG brands in Kolkata to fashion and lifestyle businesses, we work with brands to turn social media into a powerful growth channel.",
  ],
  cases: [
    {
      name: "Koliving",
      claim: "From 300 followers to 5,000+, and 15M+ views.",
      intro: [
        "Koliving is a premium PG and co-living brand in Kolkata, offering modern living spaces for students and young professionals.",
        "When we started working with the brand, the challenge wasn’t simply to post more content. It was to make Koliving more visible, relatable, and memorable to its target audience.",
        "We developed a content-led social media strategy focused on creating engaging, relatable, and shareable content designed specifically for the Kolkata audience.",
      ],
      metrics: [
        {
          value: "300 → 5,000+",
          label: "The growth",
          note: "A significant increase in their social media audience, helping Koliving establish a much stronger digital presence.",
        },
        {
          value: "15M+",
          label: "The reach",
          note: "Our content strategy helped the brand generate approximately 15 million+ views, dramatically increasing its visibility and introducing Koliving to a much wider audience.",
        },
      ],
      did: [
        "Social media strategy",
        "Content strategy",
        "Short-form video content",
        "Reels & creative content",
        "Audience-focused storytelling",
        "Trend-based content",
        "Organic social media growth",
      ],
      result: [
        "Koliving went from having a relatively small social media presence to building a significantly larger audience and generating millions of views through organic content.",
        "From being another PG brand to becoming a brand people started noticing.",
      ],
      reels: "pgbrand",
      frame: "/img/interior-bedroom.jpg",
      alt: "Symmetrical bed head-on beneath a backlit plaster relief panel",
    },
    {
      name: "EnvyMe Fashion",
      claim: "From 12K to 4.1 lakh+ followers.",
      intro: [
        "EnvyMe Fashion is a premium women’s wear boutique focused on stylish, contemporary fashion for women.",
        "The goal was simple but ambitious: make the brand impossible to ignore on social media.",
        "Instead of relying only on traditional fashion photography, we built a content approach designed around high-volume reach, fashion storytelling, engaging short-form videos, and content formats that audiences naturally want to watch and share.",
      ],
      metrics: [
        {
          value: "12,000 → 4,10,000+",
          label: "The growth",
          note: "We helped EnvyMe Fashion grow its social media audience from approximately 12K followers to 4.1 lakh+ followers, creating a dramatically stronger digital presence for the brand.",
        },
      ],
      did: [
        "Social media marketing",
        "Content strategy",
        "Reels & short-form videos",
        "Fashion-focused content",
        "Creative campaigns",
        "Trend-driven content",
        "Organic audience growth",
        "Brand positioning",
      ],
      result: [
        "EnvyMe Fashion transformed its social media presence, growing from a 12K-follower fashion boutique into a 4.1 lakh+ follower digital fashion brand.",
        "The growth wasn’t about chasing numbers alone. It was about creating content people wanted to watch, share, follow, and remember.",
      ],
      reels: "clothing",
      frame: "/img/wedding-lehenga.jpg",
      alt: "Bride turning in a flared red and gold lehenga in a carved haveli room",
    },
  ] satisfies CaseStudy[],
  closing: {
    title: ["Real brands. Real growth.", "Your brand could be next."],
    body: [
      "Every business has a different audience, story, and growth opportunity.",
      "That’s why we don’t believe in copy-paste marketing strategies.",
      "At Social Yatri, we combine social media marketing, content creation, content strategy, branding, and performance-driven thinking to build digital growth strategies around your business.",
    ],
    goalsLead: "Whether your goal is:",
    goals: [
      "More followers.",
      "More reach.",
      "More brand awareness.",
      "More enquiries.",
      "More customers.",
    ],
    goalsClose: "We build the strategy to get you there.",
  },
} as const;

/* ---------------------------------------------------------------------------
 * Editorial photography
 *
 * The frames that are not a piece of work in their own right: the opening
 * still, the studio pages, the note beside the contact form. They live here
 * rather than being pulled out of `RIDES` by index, because a slot reaching for
 * `RIDES[6]` silently changes meaning the moment the work list is reordered.
 * ------------------------------------------------------------------------- */

export type Photo = { src: string; alt: string; focus?: string };

/** A ride's frame as a plain photo, for the components that take either. */
export function ridePhoto(ride: Ride): Photo {
  return { src: ride.frame, alt: ride.alt, focus: ride.focus };
}

export const PHOTOS: Record<
  "showreel" | "studioNote" | "studioPortrait" | "studioLandscape" | "contact",
  Photo
> = {
  /** The home page's opening still. */
  showreel: {
    src: "/img/wedding-bougainvillea.jpg",
    alt: "Couple in white posing playfully against a red-orange wall draped with bougainvillea",
  },
  /** Square, beside the studio note on the home page. */
  studioNote: {
    src: "/img/wedding-carry.jpg",
    alt: "Woman kissing a laughing man on the cheek as he carries her under a frescoed ceiling",
    focus: "50% 40%",
  },
  /** Portrait, on the Studio page: the craft. */
  studioPortrait: {
    src: "/img/wedding-foreheads-bw.jpg",
    alt: "Black and white close-up of a bride and groom touching foreheads, her mehendi hand on his face",
  },
  /** Landscape, on the Studio page: the road and the weather. */
  studioLandscape: {
    src: "/img/wedding-rain-terrace.jpg",
    alt: "Couple in white embracing in the rain on a carved terrace below a hilltop fort",
  },
  /** Beside the contact form. */
  contact: {
    src: "/img/studio-toddler.jpg",
    alt: "Toddler in a rainbow-striped dress sitting on a white studio floor, laughing at the camera",
  },
};

/* ---------------------------------------------------------------------------
 * The rest
 * ------------------------------------------------------------------------- */

export const CONNECT = {
  sign: "Connect",
  question: "Let’s grow your brand.",
  sub: "Your next growth story could be the one we tell here.",
  fields: [
    { name: "name", label: "Name", type: "text", required: true },
    { name: "company", label: "Company", type: "text", required: false },
    { name: "phone", label: "Phone", type: "tel", required: false },
    { name: "email", label: "Email", type: "email", required: true },
    {
      name: "need",
      label: "What do you need help with?",
      type: "text",
      required: false,
      placeholder: "Social media, content, video…",
    },
  ],
  messageLabel: "Message",
  submit: "Start your journey →",
  submitHover: "Start your journey →",
  confirmed: "Thank you.",
  confirmedSub: "We’ll be in touch.",
} as const;

/** The strip that scrolls across the seam between two sections. */
export const MARQUEE = [
  "No boring content",
  "Born in Kolkata. Built for the internet.",
  "We make brands impossible to ignore.",
];
