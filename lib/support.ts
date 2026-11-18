/**
 * Support chat "brain". Runs entirely in the browser: no server, no API key.
 *
 * Every answer is built from the site's own data files at build time
 * (data/faq.ts, data/sizeGuide.ts, data/products.ts, data/site.ts), so editing
 * those files updates the chat too. Matching is simple keyword/synonym scoring
 * plus a few intent handlers; anything it isn't confident about is handed to
 * email support.
 */
import { faqSections, type FaqItem } from "@/data/faq";
import { CURRENT_DROP, isAvailable, products, type Garment, type Product } from "@/data/products";
import { site } from "@/data/site";
import { sizeCharts } from "@/data/sizeGuide";
import { CHECKOUT_ENABLED } from "@/lib/checkout";

export type ChatLink = { href: string; label: string };

export type BotReply = {
  text: string;
  links?: ChatLink[];
  /** Show the "email us" handoff under this reply. */
  handoff?: boolean;
};

export const SUGGESTED_QUESTIONS = [
  "How does the sizing run?",
  "When will my order ship?",
  "How much is the hoodie?",
  "Can I get a refund?",
];

export const GREETING = `Hey! I'm the ${site.name} help bot. Ask me about sizing, shipping, preorders, refunds or the products. For anything about a specific order, I'll put you in touch with a real person.`;

// ---------------------------------------------------------------------------
// Text helpers

const STOPWORDS = new Set(
  "a an the i im i'm me my mine we our you your is are was were be been am do does did can could would should will to of in on at for with and or but if it its it's this that these those what whats what's how when where which who why there here so just please hi hey hello thanks thank about get got have has any some".split(
    " ",
  ),
);

/** Map common words onto one canonical keyword so "return" matches "refund" etc. */
const SYNONYMS: Record<string, string> = {
  refunds: "refund",
  refunded: "refund",
  return: "refund",
  returns: "refund",
  returning: "refund",
  money: "refund",
  cancel: "cancel",
  cancellation: "cancel",
  cancelling: "cancel",
  canceling: "cancel",
  exchange: "swap",
  exchanges: "swap",
  switch: "swap",
  change: "swap",
  shipping: "ship",
  ships: "ship",
  shipped: "ship",
  delivery: "ship",
  deliver: "ship",
  delivered: "ship",
  arrive: "ship",
  arrives: "ship",
  arrival: "ship",
  postage: "ship",
  sizes: "size",
  sizing: "size",
  sized: "size",
  fits: "fit",
  fitting: "fit",
  measurements: "measure",
  measurement: "measure",
  measuring: "measure",
  cost: "price",
  costs: "price",
  priced: "price",
  prices: "price",
  pricing: "price",
  colors: "color",
  colour: "color",
  colours: "color",
  colorway: "color",
  colorways: "color",
  shirt: "tee",
  tshirt: "tee",
  "t-shirt": "tee",
  tees: "tee",
  shirts: "tee",
  hoodies: "hoodie",
  hoody: "hoodie",
  sweatshirt: "hoodie",
  sweater: "hoodie",
  washing: "wash",
  washed: "wash",
  laundry: "wash",
  dryer: "wash",
  fading: "fade",
  faded: "fade",
  preorders: "preorder",
  "pre-order": "preorder",
  "pre-orders": "preorder",
  charged: "charge",
  charges: "charge",
  pay: "charge",
  payment: "charge",
  paying: "charge",
  billed: "charge",
  damaged: "wrong",
  broken: "wrong",
  defective: "wrong",
  misprinted: "wrong",
  late: "delay",
  delayed: "delay",
  countries: "country",
  international: "country",
  worldwide: "country",
  overseas: "country",
  canada: "country",
  uk: "country",
};

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[^a-z0-9'\-\s#$.]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokens(s: string): string[] {
  return normalize(s)
    .split(" ")
    .map((t) => t.replace(/^[-'.]+|[-'.]+$/g, ""))
    .filter((t) => t && !STOPWORDS.has(t))
    .map((t) => SYNONYMS[t] ?? t);
}

const has = (text: string, ...patterns: RegExp[]) => patterns.some((p) => p.test(text));

// ---------------------------------------------------------------------------
// Data-derived facts

const money = (n: number) => `$${n}`;
const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

const productHref = (p: Product) => `/products/${p.slug}`;
const garmentWord: Record<Garment, string> = { tee: "tee", hoodie: "hoodie" };

function availableColors(p: Product) {
  return p.colorways.filter(isAvailable).map((c) => c.name);
}
function laterColors(p: Product) {
  return p.colorways.filter((c) => !isAvailable(c)).map((c) => c.name);
}

function shippingSentence(): string {
  const { flatRate, freeOver, countries } = site.shipping;
  const where = countries.length === 1 && countries[0] === "US" ? "within the United States" : `to ${list(countries)}`;
  return `We ship ${where}. Shipping is a flat ${money(flatRate)}${freeOver !== null ? `, and free on orders of ${money(freeOver)} or more` : ""}.`;
}

function closesDate(): string {
  const d = new Date(site.preorder.closesAt);
  if (Number.isNaN(d.getTime())) return site.preorder.closesLabel;
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/Los_Angeles" });
}

function preorderIsOpen(now = new Date()): boolean {
  const d = new Date(site.preorder.closesAt);
  return Number.isNaN(d.getTime()) || now < d;
}

/** Look up an FAQ answer by (part of) its question, so we reuse the FAQ copy verbatim. */
function faq(qStartsWith: string): FaqItem | undefined {
  for (const s of faqSections) for (const i of s.items) if (i.q.toLowerCase().startsWith(qStartsWith.toLowerCase())) return i;
  return undefined;
}
function faqAnswer(qStartsWith: string, fallback: string): string {
  return faq(qStartsWith)?.a ?? fallback;
}

// ---------------------------------------------------------------------------
// Entity detection

function findProducts(text: string): Product[] {
  const t = ` ${normalize(text)} `;
  return products.filter((p) => {
    if (t.includes(p.name.toLowerCase())) return true;
    const nameWords = p.name.toLowerCase().replace(/\b(tee|hoodie)\b/g, "").trim();
    if (nameWords && t.includes(nameWords)) return true;
    const words = tokens(text);
    return words.includes(p.garment);
  });
}

function findColors(text: string) {
  const t = normalize(text);
  const out: { product: Product; name: string; available: boolean }[] = [];
  for (const p of products)
    for (const c of p.colorways) if (t.includes(c.name.toLowerCase())) out.push({ product: p, name: c.name, available: isAvailable(c) });
  return out;
}

/** e.g. "adult m", "youth xl", "size small", "xxl" */
function findSize(text: string): { group?: "Youth" | "Adult"; size: string } | undefined {
  const t = ` ${normalize(text)} `;
  const group = /\b(youth|kids?|child|children)\b/.test(t) ? "Youth" : /\badult\b/.test(t) ? "Adult" : undefined;
  const words: Record<string, string> = {
    "extra small": "XS",
    "extra large": "XL",
    "2xl": "XXL",
    xxl: "XXL",
    xs: "XS",
    xl: "XL",
    small: "S",
    medium: "M",
    large: "L",
  };
  for (const [w, s] of Object.entries(words)) if (new RegExp(`\\b${w}\\b`).test(t)) return { group, size: s };
  const m = t.match(/\b(?:size|in an?|an?)\s+(s|m|l)\b/) ?? t.match(/\b(youth|adult)\s+(s|m|l)\b/);
  if (m) return { group, size: (m[2] ?? m[1]).toUpperCase() };
  return undefined;
}

// ---------------------------------------------------------------------------
// Intents. Each returns a score (0 = not this) and a reply.

type Intent = (q: string, words: string[]) => { score: number; reply: BotReply } | null;

const sizeIntent: Intent = (q, words) => {
  const asksSize =
    words.some((w) => ["size", "fit", "measure", "chest", "length", "big", "small", "boxy", "oversized", "baggy", "tight", "unisex"].includes(w)) ||
    has(q, /size (up|down)/i, /what size/i, /\bwhich size\b/i, /\bhow (does|do) (it|they|the \w+) (fit|run)\b/i);
  if (!asksSize) return null;
  if (words.includes("swap") || words.includes("refund")) return null; // "swap sizes" is handled by FAQ
  if (has(q, /\b(youth|kids?)\b/i) && has(q, /\badult\b/i)) {
    return { score: 9, reply: { text: faqAnswer("Youth or Adult", ""), links: [{ href: "/size-guide", label: "Size guide" }] } };
  }

  const ps = findProducts(q);
  const size = findSize(q);
  const fit = faqAnswer("How does it fit", "");
  const links: ChatLink[] = [{ href: "/size-guide", label: "Full size guide" }];

  if (ps.length === 1) {
    const p = ps[0];
    const chart = sizeCharts[p.garment];
    links.push({ href: productHref(p), label: p.name });
    if (size) {
      const groups = size.group ? [size.group] : (["Adult", "Youth"] as const).filter((g) => chart[g].some((r) => r.size === size.size));
      const lines = groups
        .map((g) => {
          const r = chart[g].find((row) => row.size === size.size);
          return r ? `${g} ${r.size}: ${r.chest}" chest width (pit to pit), ${r.length}" body length` : null;
        })
        .filter(Boolean);
      if (lines.length)
        return {
          score: 10,
          reply: { text: `${p.name}, measured flat:\n${lines.join("\n")}\n\n${p.fit.join(". ")}.`, links },
        };
    }
    const rows = (["Youth", "Adult"] as const)
      .map((g) => `${g}: ${chart[g].map((r) => `${r.size} ${r.chest}"×${r.length}"`).join(", ")}`)
      .join("\n");
    return {
      score: 9,
      reply: {
        text: `${p.name} fit: ${p.fit.join(". ")}.\n\nChest width × body length, in inches, measured flat:\n${rows}\n\nTip: measure a ${garmentWord[p.garment]} you already love and pick the closest match.`,
        links,
      },
    };
  }

  if (size) {
    const lines = products.map((p) => {
      const chart = sizeCharts[p.garment];
      const g = size.group ?? "Adult";
      const r = chart[g].find((row) => row.size === size.size);
      return r ? `${p.name}, ${g} ${r.size}: ${r.chest}" chest, ${r.length}" length` : null;
    });
    const ok = lines.filter(Boolean);
    if (ok.length) return { score: 8, reply: { text: `${ok.join("\n")}\n\n${fit}`, links } };
  }

  return { score: 7, reply: { text: `${fit}\n\nSizes run Youth S through Adult XXL. The size guide has chest and length for every size.`, links } };
};

const priceIntent: Intent = (q, words) => {
  const asksPrice = words.includes("price") || has(q, /how much/i, /\$\d*/);
  const asksColor = words.includes("color") || has(q, /what colou?rs?/i);
  const asksProducts = has(q, /what (do you|does \w+) (sell|have|make)/i, /\bproducts?\b/i, /\bcatalog\b/i, /\bwhat'?s (in|available)\b/i);
  if (!asksPrice && !asksColor && !asksProducts) return null;
  const ps = findProducts(q);
  const targets = ps.length ? ps : products;
  const parts = targets.map((p) => {
    const avail = availableColors(p);
    const later = laterColors(p);
    const bits = [`${p.name}: ${money(p.price)} (preorder price). ${p.blurb}`];
    if (asksColor || asksProducts || ps.length) {
      bits.push(`Available now in ${list(avail)}.`);
      if (later.length) bits.push(`Coming in drop ${CURRENT_DROP + 1}: ${list(later)}.`);
    }
    return bits.join(" ");
  });
  const ship = asksPrice ? `\n\n${shippingSentence()}` : "";
  return {
    score: ps.length ? 9 : 7,
    reply: { text: parts.join("\n\n") + ship, links: targets.map((p) => ({ href: productHref(p), label: `Shop the ${garmentWord[p.garment]}` })) },
  };
};

const colorIntent: Intent = (q) => {
  const cs = findColors(q);
  if (!cs.length) return null;
  const lines = cs.map((c) =>
    c.available
      ? `${c.product.name} in ${c.name} is available to preorder now (${money(c.product.price)}).`
      : `${c.product.name} in ${c.name} is part of drop ${CURRENT_DROP + 1}, so it can't be ordered yet.`,
  );
  const anyLater = cs.some((c) => !c.available);
  const later = anyLater ? `\n\n${faqAnswer("What about the colorways", "Join the email list for first dibs on the next drop.")}` : "";
  const uniq = [...new Set(cs.map((c) => c.product))];
  return {
    score: 8,
    reply: {
      text: lines.join("\n") + later,
      links: [...uniq.map((p) => ({ href: productHref(p), label: p.name })), ...(anyLater ? [{ href: "/#signup", label: "Join the email list" }] : [])],
    },
  };
};

const drop2Intent: Intent = (q) => {
  if (!has(q, /\bdrop\s*(2|two)\b/i, /\b(second|next) drop\b/i, /\bcoming soon\b/i, /\brestock/i, /\bsold out\b/i, /\bmore colou?rs\b/i)) return null;
  const lines = products
    .map((p) => (laterColors(p).length ? `${p.name}: ${list(laterColors(p))}` : null))
    .filter(Boolean);
  return {
    score: 9,
    reply: {
      text: `${faqAnswer("What about the colorways", "")}${lines.length ? `\n\nColorways in drop ${CURRENT_DROP + 1}:\n${lines.join("\n")}` : ""}`,
      links: [{ href: "/#signup", label: "Join the email list" }],
    },
  };
};

const shippingIntent: Intent = (q, words) => {
  const asks = words.includes("ship") || words.includes("country") || has(q, /\bwhen (will|do|does|would) (i|it|my|we)\b.*\b(get|receive|come)\b/i, /\bhow long\b/i);
  if (!asks) return null;
  if (words.includes("country") || has(q, /\bwhere\b.*\bship\b/i, /\bship\b.*\b(to|outside)\b/i)) {
    const usOnly = site.shipping.countries.length === 1 && site.shipping.countries[0] === "US";
    const asksAboutUs = has(q, /\b(us|usa|u\.s\.?|united states|america|domestic)\b/i);
    const prefix = usOnly && words.includes("country") && !asksAboutUs ? "Not yet, sorry. " : "";
    return { score: 9, reply: { text: prefix + shippingSentence(), links: [{ href: "/faq#shipping", label: "Shipping FAQ" }] } };
  }
  if (words.includes("delay")) {
    return { score: 9, reply: { text: faqAnswer("What if production runs late", ""), links: [{ href: "/faq#shipping", label: "Shipping FAQ" }] } };
  }
  const when = faqAnswer("When will my order ship", `Orders ship by ${site.preorder.shipsBy}.`);
  return {
    score: 8,
    reply: { text: `${when}\n\n${shippingSentence()}`, links: [{ href: "/faq#shipping", label: "Shipping FAQ" }] },
  };
};

const refundIntent: Intent = (q, words) => {
  if (!words.includes("refund") && !words.includes("cancel")) return null;
  if (words.includes("wrong")) return null; // FAQ "something's wrong" handles damaged items
  return {
    score: 9,
    reply: {
      text: `${site.refundPolicy}\n\nTo ask for a refund or cancel, email ${site.contactEmail} with your order number.`,
      links: [{ href: "/faq#refunds", label: "Refunds & cancellation" }],
      handoff: true,
    },
  };
};

const preorderIntent: Intent = (q, words) => {
  const asksTiming =
    has(q, /\b(close|closes|closing|deadline|last day|end|ends|ending|until when|still open|open)\b/i) &&
    (words.includes("preorder") || has(q, /\b(order|window|drop)\b/i));
  const asksHow = words.includes("preorder") && has(q, /\bhow\b|\bwork|\bwhat is\b|\bmean/i);
  if (!asksTiming && !asksHow) return null;
  const open = preorderIsOpen();
  const timing = open
    ? `The ${site.preorder.dropName.toLowerCase()} preorder is open until ${closesDate()} (11:59 pm Pacific). Orders ship by ${site.preorder.shipsBy}.`
    : `The ${site.preorder.dropName.toLowerCase()} preorder closed on ${closesDate()}. Join the email list to hear about the next drop.`;
  const how = asksHow ? `\n\n${faqAnswer("How do preorders work", "")}` : "";
  return { score: 9, reply: { text: timing + how, links: [{ href: "/#drop", label: "See the drop" }, { href: "/faq#preorders", label: "Preorder FAQ" }] } };
};

const checkoutIntent: Intent = (q) => {
  if (!has(q, /\bcheck ?out\b/i, /\bhow (do|can) i (buy|order|purchase)\b/i, /\bplace an order\b/i, /\bcredit card\b/i, /\bpaypal\b/i, /\bapple pay\b/i)) return null;
  const text = CHECKOUT_ENABLED
    ? `Pick a colorway and size on a product page, add it to your cart, then hit Checkout. ${faqAnswer("When am I charged", "")}`
    : "Checkout isn't open just yet. You can pick your colorway and size and add it to your cart now. The cart is saved in your browser, so it'll be waiting when checkout opens.";
  return { score: 8, reply: { text, links: [{ href: "/#drop", label: "See the drop" }, { href: "/checkout", label: "Checkout" }] } };
};

const orderStatusIntent: Intent = (q) => {
  if (
    !has(
      q,
      /\bmy order\b/i,
      /\border (status|number|#)/i,
      /\btracking\b/i,
      /\btrack\b/i,
      /\bwhere'?s my\b/i,
      /#\s?\d{3,}/,
      /\border\s+\d{3,}/i,
      /\bconfirmation (email|number)\b/i,
    )
  )
    return null;
  // Generic "when will my order ship" is a shipping question, not a specific order.
  if (has(q, /\bwhen\b.*\bmy order\b.*\bship\b/i) && !has(q, /\d{3,}/)) return null;
  if (has(q, /\b(cancel|refund)\b/i)) return null;
  return {
    score: 10,
    reply: {
      text: `I can't look up individual orders, but a real person can. Email ${site.contactEmail} with your order number and we'll get back to you. In general, every first-drop order ships by ${site.preorder.shipsBy}, and you'll get an email with tracking when yours leaves.`,
      links: [{ href: "/contact", label: "Contact page" }],
      handoff: true,
    },
  };
};

const contactIntent: Intent = (q) => {
  if (!has(q, /\b(human|person|someone|somebody|agent|representative|rep|staff|real people)\b/i, /\bcontact\b/i, /\bemail (you|address)\b/i, /\breach you\b/i, /\btalk to\b/i, /\bspeak (to|with)\b/i, /\bphone\b/i, /\bcall\b/i))
    return null;
  return {
    score: 10,
    reply: {
      text: `You can reach a real person at ${site.contactEmail}. If it's about an order, put the order number in the subject line.`,
      links: [{ href: "/contact", label: "Contact page" }],
      handoff: true,
    },
  };
};

const greetingIntent: Intent = (q) => {
  if (!/^\s*(hi|hey|hello|yo|sup|hiya|good (morning|afternoon|evening))[\s!.?]*$/i.test(q)) return null;
  return { score: 10, reply: { text: "Hey! What can I help with? Sizing, shipping, refunds, the products, or something else?" } };
};

const thanksIntent: Intent = (q) => {
  if (!/^\s*(thanks|thank you|thx|ty|cool|great|awesome|perfect|ok|okay)[\s!.?]*$/i.test(q)) return null;
  return { score: 10, reply: { text: "Anytime. Good days only." } };
};

const INTENTS: Intent[] = [
  greetingIntent,
  thanksIntent,
  orderStatusIntent,
  contactIntent,
  refundIntent,
  drop2Intent,
  colorIntent,
  sizeIntent,
  priceIntent,
  preorderIntent,
  checkoutIntent,
  shippingIntent,
];

// ---------------------------------------------------------------------------
// FAQ keyword scoring

const FAQ_SECTION_LINK: Record<string, ChatLink> = Object.fromEntries(
  faqSections.map((s) => [s.id, { href: `/faq#${s.id}`, label: `FAQ: ${s.title}` }]),
);

const FAQ_INDEX = faqSections.flatMap((s) =>
  s.items.map((item) => ({ item, section: s.id, qWords: new Set(tokens(item.q)), aWords: new Set(tokens(item.a)) })),
);

function bestFaq(words: string[]) {
  let best: { score: number; item: FaqItem; section: string } | null = null;
  const uniq = [...new Set(words)];
  for (const e of FAQ_INDEX) {
    let score = 0;
    for (const w of uniq) {
      if (e.qWords.has(w)) score += 3;
      else if (e.aWords.has(w)) score += 1;
    }
    // normalise a little so long answers don't win just by being long
    const norm = score / Math.sqrt(Math.max(3, e.qWords.size));
    if (!best || norm > best.score) best = { score: norm, item: e.item, section: e.section };
  }
  return best;
}

// ---------------------------------------------------------------------------

const FALLBACK: BotReply = {
  text: `I'm not sure about that one, and I'd rather not guess. A real person can help: email ${site.contactEmail} and we'll get back to you.`,
  links: [
    { href: "/faq", label: "Browse the FAQ" },
    { href: "/contact", label: "Contact page" },
  ],
  handoff: true,
};

/** Minimum score for an intent or FAQ match to be trusted. */
const INTENT_MIN = 6;
const FAQ_MIN = 1.7;
const FAQ_STRONG = 3;

export function answer(question: string): BotReply {
  const q = question.trim();
  if (!q) return FALLBACK;
  const words = tokens(q);

  let best: { score: number; reply: BotReply } | null = null;
  for (const intent of INTENTS) {
    const r = intent(q, words);
    if (r && (!best || r.score > best.score)) best = r;
  }

  const f = bestFaq(words);
  const faqReply = (m: NonNullable<typeof f>): BotReply => ({ text: m.item.a, links: [FAQ_SECTION_LINK[m.section]].filter(Boolean) });

  if (best && best.score >= 9) return best.reply; // a specific intent (order, refund, product size...) wins
  if (f && f.score >= FAQ_STRONG) return faqReply(f); // several FAQ keywords beat a generic intent answer
  if (best && best.score >= INTENT_MIN) return best.reply;
  if (f && f.score >= FAQ_MIN) return faqReply(f);
  return FALLBACK;
}

/** mailto: link to support, with the conversation so far in the body. */
export function supportMailto(transcript: { from: "you" | "bot"; text: string }[]): string {
  const subject = `${site.name} support question`;
  const convo = transcript
    .slice(-12)
    .map((m) => `${m.from === "you" ? "Me" : `${site.name} bot`}: ${m.text}`)
    .join("\n\n");
  let body = `Hi ${site.name},\n\n[Add your question or order number here]\n\n--- Chat so far ---\n${convo}`;
  // Keep the URL a sane length; some mail clients choke on very long mailto links.
  if (body.length > 1800) body = `${body.slice(0, 1800)}…`;
  return `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
