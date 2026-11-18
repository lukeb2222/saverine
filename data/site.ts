/**
 * Site-wide settings. Edit values here — nothing else needs to change.
 */
export const site = {
  name: "Saverine",
  tagline: "Good Days Only — Est. 2026",
  secondaryLine: "City to Coast",
  description:
    "Saverine is garment-dyed, lived-in clothing made for good days, wherever you are. First drop available for preorder now.",
  /** Public URL of the live site (used for SEO + share links). */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Sub-path the site is served from ("" unless hosted at example.com/something). */
  basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? "",

  preorder: {
    dropName: "First drop",
    /** Preorders close at this moment (ISO 8601 with timezone offset). */
    closesAt: "2027-02-14T23:59:00-08:00",
    /** How the close date reads in the banner. */
    closesLabel: "Feb 14",
    /** When orders ship. Shown across the site and at checkout. */
    shipsBy: "March 2027",
  },

  /**
   * Brand copy. Shown on the homepage and used by the support chat
   * (lib/support.ts) to answer "what is Saverine?" style questions.
   */
  about: {
    /** Homepage hero line. */
    heroLine: "Sun-faded, garment-dyed and very soft. Made for the coast, worn everywhere else too.",
    /** "The story" section on the homepage. */
    storyTitle: "Made for good days",
    story:
      "Saverine started with a simple idea: the best days deserve clothes that feel like them. So we make soft, sun-faded pieces that look like they’ve already been on a few road trips. Wear them to the beach, on the subway, up the chairlift or four hours into a drive with the windows down. Wherever you are, if it’s a good day, you’re dressed for it.",
    /** Intro line above the products in "The Drop". */
    dropIntro: "Two pieces, made to order.",
    /** Drop 2 signup pitch. */
    nextDropPitch: "New colorways are on deck. Get on the list and you’ll hear before anyone else.",
  },

  /** Editable policy copy, reused on the FAQ, product pages and checkout. */
  refundPolicy:
    "Changed your mind? Email us any time before production starts and we'll refund you in full, no questions asked. Once production starts, your pieces are being made for you and the order is locked in.",

  shipping: {
    /** Countries Stripe Checkout will accept shipping addresses for. */
    countries: ["US"] as string[],
    /** Flat shipping in USD. */
    flatRate: 6,
    /** Orders at or above this subtotal (USD) ship free. Set to null to disable. */
    freeOver: 100 as number | null,
  },

  /** What happens if a colorway doesn't reach the factory minimum. */
  minimumPolicy:
    "Each colorway needs a minimum number of orders before our factory will make it. If yours doesn't get there, we'll email you and you choose: swap to another colorway or get a full refund.",

  /**
   * Email signups go to this Klaviyo list. Both values are public IDs (safe
   * to commit). Site ID: Klaviyo → Settings → Account → API keys → "Public
   * API key". List ID: Audience → Lists & segments → open the list →
   * Settings.
   */
  klaviyo: {
    companyId: "QUzqui",
    listId: "TL7SpD",
  },

  contactEmail: "hello@saverine.shop",
  /**
   * Full profile URLs, e.g. "https://www.instagram.com/yourhandle". Leave a
   * value empty ("") until the account exists: empty links are hidden.
   */
  social: {
    instagram: "https://www.instagram.com/wearsaverine/",
    tiktok: "",
  } as { instagram: string; tiktok: string },
  copyrightYear: 2026,
} as const;

/** Social profiles that have a real URL, in display order. */
export const socialLinks = [
  { label: "Instagram", href: site.social.instagram },
  { label: "TikTok", href: site.social.tiktok },
].filter((l) => l.href);
