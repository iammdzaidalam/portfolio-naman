/**
 * Every word on the site.
 *
 * The copy is taken verbatim from the client’s `social-yatri.html`. Where that
 * file put a line in a heading, the line break is preserved as a separate array
 * entry so the reveal animations can mask each line independently.
 */

export const SITE = {
  name: "Social Yatri",
  tagline: "Get in. We’re going places.",
  description:
    "Social Yatri is a Kolkata-based content and social media team. We make brands look less boring on the internet.",
  city: "Kolkata, West Bengal, India",
  email: "hello@socialyatri.com",
  phone: "+91 33 4000 0000",
  phoneHref: "tel:+913340000000",
  instagram: "@socialyatri",
  linkedin: "Social Yatri",
  madeIn: "Made in Kolkata. Driven by ideas.",
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
  eyebrow: "Get in. We’re going viral.",
  headline: ["Your brand.", "Our journey."],
  lede: "We make brands look less boring on the internet.",
  lede2: "Social media. Content. Strategy. Organic growth. No boring shit.",
  scrollCue: "Scroll to ride",
  badge: "No boring content · We cooked · ",
  stats: [
    { value: "6+ Years", label: "making content" },
    { value: "100+ Brands", label: "worked with" },
    { value: "10M+", label: "organic views" },
  ],
} as const;

export const ABOUT = {
  stop: "Next stop",
  sign: "Next stop → Who’s driving?",
  question: "Who’s driving?",
  struck: "We’re not here to make another boring Instagram page.",
  claim: "We’re here to make people stop scrolling.",
  body: [
    "Social Yatri is a Kolkata-based content and social media team. We don’t run one playbook for every brand — we build the route around yours: your audience, your voice, your actual objective.",
    "That means custom content pillars, a posting rhythm that fits how you really work, and community management that sounds like you — not a template with your logo on it.",
  ],
  annotations: [
    "strategy ↓",
    "shoot day 💀",
    "editing at 2AM",
    "client approved ✅",
  ],
} as const;

export type Service = {
  no: string;
  name: string;
  desc: string;
  tag: string;
};

export const SERVICES: Service[] = [
  { no: "01", name: "Social Media", desc: "Make the feed make sense.", tag: "Ongoing" },
  { no: "02", name: "Content", desc: "Stop scrolling. Start watching.", tag: "Foundation" },
  { no: "03", name: "Video", desc: "Lights. Camera. Reel.", tag: "Production" },
  { no: "04", name: "Strategy", desc: "Random posting is not a strategy.", tag: "Foundation" },
  { no: "05", name: "Branding", desc: "Make people remember you.", tag: "Design" },
  { no: "06", name: "Organic Growth", desc: "Followers are nice. Business is better.", tag: "Growth" },
  { no: "07", name: "Personal Branding", desc: "Become the person people follow.", tag: "1:1" },
];

export const SERVICES_INTRO = {
  sign: "Next stop → Services",
  question: "What do we actually do?",
  sub: "Not service cards. Roadside stops. Pick one, or take the whole route.",
} as const;

export type Ride = {
  slug: string;
  title: string;
  category: string;
  tag: string;
  views: string;
  caption: string;
  /** The still that stands in for the reel until real footage lands. */
  frame: string;
};

export const WORK_FILTERS = [
  { id: "all", label: "All" },
  { id: "reels", label: "Reels" },
  { id: "films", label: "Brand Films" },
  { id: "campaigns", label: "Social Campaigns" },
  { id: "hospitality", label: "Hospitality" },
  { id: "food", label: "Food" },
  { id: "realestate", label: "Real Estate" },
  { id: "personal", label: "Personal Branding" },
] as const;

export const RIDES: Ride[] = [
  {
    slug: "puja-season-reel-series",
    title: "Puja Season Reel Series",
    category: "reels",
    tag: "Reels",
    views: "2.4M views",
    caption: "yeah… this one went crazy.",
    frame: "/img/architecture-1.webp",
  },
  {
    slug: "heritage-hotel-brand-film",
    title: "Heritage Hotel Brand Film",
    category: "films",
    tag: "Brand Films · Hospitality",
    views: "640K views",
    caption: "cinematic, but make it convert.",
    frame: "/img/architecture-2.webp",
  },
  {
    slug: "sweet-shop-launch-campaign",
    title: "Sweet Shop Launch Campaign",
    category: "campaigns",
    tag: "Social Campaigns · Food",
    views: "1.1M views",
    caption: "sold out in 3 days. no cap.",
    frame: "/img/architecture-3.webp",
  },
  {
    slug: "riverside-homes-walkthrough",
    title: "Riverside Homes Walkthrough",
    category: "realestate",
    tag: "Real Estate",
    views: "310K views",
    caption: "leads > likes.",
    frame: "/img/architecture-4.webp",
  },
  {
    slug: "founder-story-90-days",
    title: "Founder Story: 90 Days",
    category: "personal",
    tag: "Personal Branding",
    views: "880K views",
    caption: "the algorithm liked him actually.",
    frame: "/img/architecture-1.webp",
  },
  {
    slug: "rooftop-cafe-reel-pack",
    title: "Rooftop Café Reel Pack",
    category: "reels",
    tag: "Reels · Food",
    views: "1.9M views",
    caption: "we cooked (literally).",
    frame: "/img/architecture-2.webp",
  },
  {
    slug: "boutique-stay-season-film",
    title: "Boutique Stay Season Film",
    category: "films",
    tag: "Brand Films · Hospitality",
    views: "420K views",
    caption: "booked out the season.",
    frame: "/img/architecture-3.webp",
  },
  {
    slug: "festive-collection-campaign",
    title: "Festive Collection Campaign",
    category: "campaigns",
    tag: "Social Campaigns",
    views: "1.5M views",
    caption: "this one hit different.",
    frame: "/img/architecture-4.webp",
  },
  {
    slug: "new-launch-tower-views",
    title: "New Launch: Tower Views",
    category: "realestate",
    tag: "Real Estate",
    views: "260K views",
    caption: "okay but look at this →",
    frame: "/img/architecture-1.webp",
  },
];

export const WORK_INTRO = {
  sign: "Next stop → Our work",
  question: ["We made this.", "Receipts > promises."],
  sub: "A few rides we’ve taken brands on. All real formats, placeholder previews — swap in your actual reels here.",
} as const;

export const GROWTH = {
  sign: "Next stop → Growth",
  question: "Okay… but did it work?",
  sub: "Here’s the part that actually matters.",
  before: { label: "Before", value: "1,200", unit: "followers" },
  after: { label: "After", value: "42,000", unit: "followers" },
  delta: "+3,400%",
  cells: [
    { target: 4200000, suffix: "", label: "Cumulative reach" },
    { target: 118, suffix: "%", label: "Avg. engagement lift, 90 days" },
    { target: 63000, suffix: "", label: "Followers grown organically" },
    { target: 27, suffix: " cities", label: "Where the content travels" },
  ],
  caption: "tiny road → massive highway. that’s the whole game.",
  final: ["We don’t just post.", "We move the needle."],
} as const;

export const PROCESS = {
  sign: "Next stop → The process",
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
      body: "Pillars, positioning, a plan built for this brand — not a template.",
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
      body: "Reach, saves, shares, replies — the stuff that actually means something.",
    },
    {
      no: "07",
      title: "Double down",
      body: "More of what worked. Less of what didn’t. No ego about it.",
    },
    { no: "08", title: "Grow", body: "Compounding, organic, increasingly self-sustaining." },
  ],
} as const;

export const KOLKATA = {
  sign: "Next stop → Home turf",
  question: ["Born in Kolkata.", "Built for the internet."],
  sticker: "Next stop → Viral.",
  cards: [
    {
      title: "Chai-break strategy calls",
      body: "Best ideas start on the side of a street-corner stall.",
    },
    {
      title: "Puchka cart energy",
      body: "Content that hits different — small, sharp, gone in one bite.",
    },
    {
      title: "Slow city, fast feeds",
      body: "We understand patience and pace — useful when organic growth takes both.",
    },
    {
      title: "No boring content →",
      body: "Every street has a story. So does every brand, if you look properly.",
    },
  ],
} as const;

export const TESTIMONIALS = {
  sign: "Next stop → Passengers",
  question: "People who rode with us.",
  sub: "Screenshots, basically.",
  threads: [
    {
      client: "bro, how did this reel get 1.8M?",
      us: "don’t ask questions. just enjoy the ride.",
    },
    {
      client:
        "our engagement literally never dropped after month one, what did you guys do",
      us: "we made content that sounded like you. that’s kind of it.",
    },
    {
      client: "I wanted more followers. I got more actual customers. not complaining.",
      us: "that was always the plan 🚕",
    },
  ],
} as const;

export const TEAM = {
  sign: "Next stop → The crew",
  question: "The crew.",
  sub: "Hover for the boring official titles.",
  members: [
    { role: "The Driver", real: "Founder & Creative Director" },
    { role: "The Strategist", real: "Head of Strategy" },
    { role: "The Content Nerd", real: "Content Lead" },
    { role: "The Camera Guy", real: "Director of Photography" },
    { role: "The Design Wizard", real: "Senior Designer" },
  ],
} as const;

export const CONNECT = {
  sign: "Next stop → You?",
  question: "Where we going?",
  sub: "Got a brand that needs a new route?",
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
  submit: "Book the ride →",
  submitHover: "Let’s goooo →",
  confirmed: "Ride confirmed.",
  confirmedSub: "See you on the other side.",
} as const;

export const CTA = {
  primary: "Get in →",
  primaryHover: "Let’s goooo →",
  ghost: "See what we do",
} as const;

/** The strip that scrolls across the seam between two sections. */
export const MARQUEE = [
  "No boring content",
  "We cooked",
  "Get in. We’re going places.",
  "Made in Kolkata",
  "Receipts > promises",
];
