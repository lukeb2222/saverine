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

  contactEmail: "hello@saverine.com",
  social: {
    instagram: "https://instagram.com/", // TODO: add your handle
    tiktok: "https://tiktok.com/", // TODO: add your handle
  },
  copyrightYear: 2026,
} as const;
