/**
 * Support chat "brain". Runs entirely in the browser: no server, no API key.
 *
 * Every answer is built from the site's own data files at build time
 * (data/site.ts, data/faq.ts, data/sizeGuide.ts, data/products.ts), so editing
 * those files updates the chat too. Matching is keyword/synonym scoring with
 * light stemming and typo correction, plus intent handlers for the common
 * questions. Anything it isn't confident about is handed to email support.
 *
 * The question set in test/support.test.ts (npm run test:support) keeps this honest.
 */
import { faqSections, type FaqItem } from "@/data/faq";
import { CURRENT_DROP, SIZES, isAvailable, products, type Garment, type Product } from "@/data/products";
import { site, socialLinks } from "@/data/site";
import { sizeCharts } from "@/data/sizeGuide";
import { CHECKOUT_ENABLED } from "@/lib/checkout";

export type ChatLink = { href: string; label: string };

export type BotReply = {
  text: string;
  links?: ChatLink[];
  /** Show the "email us" handoff under this reply. */
  handoff?: boolean;
  /** "fallback" when the bot didn't know and handed off. */
  kind?: "answer" | "fallback";
};

export const SUGGESTED_QUESTIONS = ["What is Saverine?", "How does the sizing run?", "When will my order ship?", "How much is the hoodie?"];

export const GREETING = `Hey! I'm the ${site.name} help bot. Ask me about the brand, sizing, shipping, preorders, refunds or the products. For anything about a specific order, I'll put you in touch with a real person.`;

// ---------------------------------------------------------------------------
// Data-derived facts

const money = (n: number) => `$${n}`;
const list = (items: string[]) =>
  items.length <= 1 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
/** Join short facts into sentences without doubling up full stops. */
const sentences = (items: string[]) => items.map((t) => t.trim().replace(/[.!?]+$/, "")).join(". ") + ".";
const productHref = (p: Product) => `/products/${p.slug}`;
const garmentWord: Record<Garment, string> = { tee: "tee", hoodie: "hoodie" };
const availableColors = (p: Product) => p.colorways.filter(isAvailable).map((c) => c.name);
const laterColors = (p: Product) => p.colorways.filter((c) => !isAvailable(c)).map((c) => c.name);
const NEXT_DROP = CURRENT_DROP + 1;
const EST_YEAR = site.tagline.match(/Est\.?\s*(\d{4})/i)?.[1];
const taglineMain = site.tagline.split(/\s+[—–-]\s+/)[0];
const firstSize = `Youth ${SIZES.Youth[0]}`;
const lastSize = `Adult ${SIZES.Adult[SIZES.Adult.length - 1]}`;
const SIZE_RANGE = `Sizes run ${firstSize} through ${lastSize} (${list((Object.keys(SIZES) as (keyof typeof SIZES)[]).map((g) => `${g} ${SIZES[g].join(", ")}`))}).`;
const US_ONLY = site.shipping.countries.length === 1 && site.shipping.countries[0] === "US";
const catalogLine = products.map((p) => `the ${p.name} (${money(p.price)})`);

function shippingSentence(): string {
  const { flatRate, freeOver, countries } = site.shipping;
  const where = US_ONLY ? "within the United States" : `to ${list(countries)}`;
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

function preorderTiming(): string {
  return preorderIsOpen()
    ? `The ${site.preorder.dropName.toLowerCase()} preorder is open until ${closesDate()} (11:59 pm Pacific). Orders ship by ${site.preorder.shipsBy}.`
    : `The ${site.preorder.dropName.toLowerCase()} preorder closed on ${closesDate()}. Join the email list to hear about the next drop.`;
}

/** Look up an FAQ answer by the start of its question, so FAQ copy is reused verbatim. */
function faqAnswer(qStartsWith: string, fallback = ""): string {
  for (const s of faqSections) for (const i of s.items) if (i.q.toLowerCase().startsWith(qStartsWith.toLowerCase())) return i.a;
  return fallback;
}

const socialText = () =>
  socialLinks.length ? `Follow along on ${list(socialLinks.map((l) => l.label))}.` : "";

// ---------------------------------------------------------------------------
// Text processing: normalise, correct typos, stem, map synonyms.

const STOPWORDS = new Set(
  "a an the i im i'm me my mine we our you your u ur is are r was were be been am do does did can could would should will to of in on at for with and or but if it its it's this that these those what whats what's how when where which who why there here so just please pls plz hi hey hello thanks thank about get got have has any some really much very guys".split(
    " ",
  ),
);

/** Map words onto one canonical keyword so "return" matches "refund" etc. */
const SYNONYMS: Record<string, string> = {
  return: "refund", money: "refund", reimburse: "refund",
  cancellation: "cancel",
  exchange: "swap", switch: "swap", change: "swap",
  delivery: "ship", deliver: "ship", arrive: "ship", arrival: "ship", postage: "ship", shipment: "ship", mail: "ship",
  sizing: "size", sizes: "size",
  measurement: "measure", dimension: "measure",
  cost: "price", pricing: "price", expensive: "price", cheap: "price", dollar: "price",
  colour: "color", colorway: "color", shade: "color",
  shirt: "tee", tshirt: "tee", "t-shirt": "tee", top: "tee",
  hoody: "hoodie", sweatshirt: "hoodie", sweater: "hoodie", pullover: "hoodie", jumper: "hoodie",
  laundry: "wash", dryer: "wash", dry: "wash", iron: "wash", bleach: "wash", clean: "wash", machine: "wash",
  bleed: "fade",
  "pre-order": "preorder",
  pay: "charge", payment: "charge", bill: "charge",
  damage: "wrong", broken: "wrong", defective: "wrong", misprint: "wrong", hole: "wrong",
  late: "delay",
  international: "country", internationally: "country", worldwide: "country", overseas: "country", abroad: "country",
  canada: "country", uk: "country", europe: "country", australia: "country", mexico: "country",
  material: "fabric", cotton: "fabric", fleece: "fabric", polyester: "fabric", thick: "fabric", heavy: "fabric", heavyweight: "fabric", weight: "fabric", soft: "fabric", feel: "fabric",
  kid: "youth", kids: "youth", child: "youth", children: "youth", son: "youth", daughter: "youth", boy: "youth", girl: "youth", teen: "youth",
  insta: "instagram", ig: "instagram",
};

/** Words the matcher knows; typos are corrected towards these. */
const VOCAB = new Set<string>();
function addVocab(text: string) {
  for (const w of text.toLowerCase().split(/[^a-z0-9]+/)) if (w.length >= 3) VOCAB.add(w);
}
[
  ...Object.keys(SYNONYMS),
  ...Object.values(SYNONYMS),
  "saverine refund cancel swap ship size measure price color tee hoodie wash fade preorder charge wrong delay country fabric youth instagram tiktok social follow",
  "fit fits oversized boxy unisex chest length small medium large adult youth drop restock available sold checkout cart order status tracking track contact email human person phone",
  "legit scam trust brand story mission about sell products catalog pocket pockets print printed hood logo design shrink true discount coupon promo gift close closes closing deadline",
  "black white grey gray blue green red yellow navy cream beige brown orange pink purple talking speaking chatting kind type sort",
  "much long when where address production minimum colorway colorways measurements chart guide notified notify list signup newsletter",
  ...faqSections.flatMap((s) => s.items.map((i) => `${i.q} ${i.a}`)),
  ...products.flatMap((p) => [p.name, p.blurb, p.description, ...p.fabric, ...p.fit, ...p.colorways.map((c) => c.name)]),
  site.tagline,
  site.about.story,
  site.about.heroLine,
].forEach(addVocab);

function editDistance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      // transposition ("clsoe" -> "close")
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, (prev[j - 2] ?? i) + 0);
      cur[j] = v;
      rowMin = Math.min(rowMin, v);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

/** Strip common endings when the shorter form is a word we know. */
function stem(w: string): string {
  if (VOCAB.has(w) && !/(s|es|ed|ing|ly)$/.test(w)) return w;
  const tries = [
    w.replace(/([bdgmnprt])\1(ing|ed)$/, "$1"),
    w.replace(/ies$/, "y"),
    w.replace(/es$/, ""),
    w.replace(/s$/, ""),
    w.replace(/ing$/, ""),
    w.replace(/ing$/, "e"),
    w.replace(/ed$/, ""),
    w.replace(/ed$/, "e"),
    w.replace(/ly$/, ""),
  ];
  for (const t of tries) if (t !== w && t.length >= 3 && (VOCAB.has(t) || SYNONYMS[t])) return t;
  return w;
}

const correctionCache = new Map<string, string>();
/** Fix a likely typo ("refnud" -> "refund") by finding the closest known word. */
function correct(w: string): string {
  if (w.length < 4 || /\d/.test(w) || STOPWORDS.has(w) || VOCAB.has(w) || SYNONYMS[w]) return w;
  const cached = correctionCache.get(w);
  if (cached) return cached;
  const max = w.length >= 8 ? 2 : 1;
  let best = w;
  let bestD = max + 1;
  for (const v of VOCAB) {
    if (v[0] !== w[0] && max === 1) continue; // short words: keep the first letter, avoids silly matches
    const d = editDistance(w, v, max);
    if (d < bestD) {
      bestD = d;
      best = v;
    }
  }
  correctionCache.set(w, best);
  return best;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\bt[\s-]?shirts?\b/g, "tee")
    .replace(/[^a-z0-9'\-\s#$.%]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** Lowercased text with typos fixed, for the regex-based intent checks. */
function cleanText(raw: string): string {
  return normalize(raw)
    .split(" ")
    .map((t) => {
      const core = t.replace(/^[-'.]+|[-'.?!]+$/g, "");
      if (!core) return t;
      const fixed = correct(core);
      return fixed === core ? t : t.replace(core, fixed);
    })
    .join(" ");
}

/** Content words, stemmed and mapped onto canonical keywords. */
function tokens(text: string): string[] {
  return text
    .split(" ")
    .map((t) => t.replace(/^[-'.$#]+|[-'.?!%]+$/g, ""))
    .filter((t) => t && !STOPWORDS.has(t))
    .map((t) => {
      const s = stem(t);
      return SYNONYMS[t] ?? SYNONYMS[s] ?? s;
    });
}

const has = (text: string, ...patterns: RegExp[]) => patterns.some((p) => p.test(text));

// ---------------------------------------------------------------------------
// Entity detection

function findProducts(text: string, words: string[]): Product[] {
  return products.filter((p) => {
    const name = p.name.toLowerCase();
    if (text.includes(name)) return true;
    const nameWords = name.replace(/\b(tee|hoodie)\b/g, "").trim();
    if (nameWords && text.includes(nameWords)) return true;
    return words.includes(p.garment);
  });
}

function findColors(text: string) {
  const out: { product: Product; name: string; available: boolean }[] = [];
  for (const p of products)
    for (const c of p.colorways) if (text.includes(c.name.toLowerCase())) out.push({ product: p, name: c.name, available: isAvailable(c) });
  return out;
}

/** e.g. "adult m", "youth xl", "size small", "2xl" */
function findSize(text: string): { group?: "Youth" | "Adult"; size: string } | undefined {
  const t = ` ${text} `;
  const group = /\b(youth|kids?|child|children)\b/.test(t) ? "Youth" : /\badult\b/.test(t) ? "Adult" : undefined;
  const words: [string, string][] = [
    ["extra small", "XS"],
    ["extra large", "XL"],
    ["2xl", "XXL"],
    ["xxl", "XXL"],
    ["xs", "XS"],
    ["xl", "XL"],
    ["small", "S"],
    ["medium", "M"],
    ["large", "L"],
  ];
  for (const [w, s] of words) if (new RegExp(`\\b${w}\\b`).test(t)) return { group, size: s };
  const m = t.match(/\b(?:size|in an?|an?)\s+(s|m|l)\b/) ?? t.match(/\b(youth|adult)\s+(s|m|l)\b/);
  if (m) return { group, size: (m[2] ?? m[1]).toUpperCase() };
  return undefined;
}

const COMMON_COLOR_WORDS = /\b(black|white|gr[ae]y|blue|green|red|yellow|navy|cream|beige|tan|brown|olive|orange|pink|purple|gold)\b/;

// ---------------------------------------------------------------------------
// Intents. Each returns a score (null = not this) and a reply.

type Ctx = { q: string; words: string[]; ps: Product[] };
type Hit = { score: number; reply: BotReply };
type Intent = (c: Ctx) => Hit | null;

const ABOUT_LINKS: ChatLink[] = [
  { href: "/#drop", label: "See the drop" },
  { href: "/faq", label: "FAQ" },
];

/** Things the site doesn't say anything about: never answer these from brand copy. */
const UNKNOWN_BRAND_FACTS = /\b(found|founded|founder|founders|owner|owns|own|runs|ceo|based|located|location|headquarter|hq|where (are|r|is) (you|u|saverine|the brand|it) (from|located)|name (mean|come)|meaning of the name|team|employees|store near|physical store|retail store|in person|stockists?|wholesale)\b/;

/** Sourcing and ethics facts the site doesn't state. */
const UNKNOWN_PRODUCT_FACTS = /\b(where\b.*\bmade|made in|manufactur\w*|factory (is|located)|which factory|sweatshop|ethical\w*|fair trade|organic|recycled|vegan|gsm|country of origin|best ?sell\w*|most popular)\b/;

const sustainIntent: Intent = ({ q }) => {
  if (!has(q, /\b(eco|eco-friendly|sustainab\w*|environment\w*|wasteful|waste|overproduc\w*|planet)\b/)) return null;
  if (UNKNOWN_PRODUCT_FACTS.test(q)) return null;
  return {
    score: 10,
    reply: {
      text: `Making everything to order is how we keep waste down: ${faqAnswer("How do preorders work")}\n\nFor anything more specific about materials or sourcing, email ${site.contactEmail}.`,
      links: [{ href: "/faq#preorders", label: "Preorder FAQ" }],
    },
  };
};

const aboutIntent: Intent = ({ q }) => {
  if (UNKNOWN_BRAND_FACTS.test(q)) return null;
  if (EST_YEAR && has(q, /\b(when|what year)\b.*\b(start|started|found|establish|established|est|launch|launched|begin|began|open|opened|created)\b/, /\bhow old\b.*\b(brand|saverine|company)\b/)) {
    return {
      score: 10,
      reply: { text: `${site.name} was established in ${EST_YEAR} ("${site.tagline}"). The ${site.preorder.dropName.toLowerCase()} is open for preorder now.`, links: ABOUT_LINKS },
    };
  }
  const asks = has(
    q,
    /\bwhat('?s| is| are)\b.*\bsaverine\b/,
    /\bsaverine\b.*\b(about|is what|mean)\b/,
    /\b(tell me|talk|learn|know) (more )?about (saverine|the brand|you guys|yourselves|your brand|the company|this (brand|company|store|site))\b/,
    /\b(what('?s| is)|who is) (this|the|your) (brand|company|store|shop|site|website)\b/,
    /\bbrand\b.*\babout\b/,
    /\b(what('?s| is) )?(your|the|saverine'?s) (story|mission|vibe|ethos)\b/,
    /\bgood days only\b/,
    /^\s*saverine\s*\??$/,
  );
  if (!asks) return null;
  const meaning = has(q, /\bgood days only\b/) ? `"${taglineMain}" is the whole idea: ` : "";
  return {
    score: 11,
    reply: {
      text: `${meaning}${site.description}\n\n${site.about.story}\n\nRight now that's ${list(catalogLine)}. ${site.about.dropIntro} ${preorderTiming()}`,
      links: ABOUT_LINKS,
    },
  };
};

const botIdentityIntent: Intent = ({ q }) => {
  if (
    !has(
      q,
      /\bwho (are|r) (you|u)\b/,
      /\bwhat (are|r) (you|u)\b\s*\??$/,
      /\bwho am i (talking|speaking|chatting) (to|with)\b/,
      /\b(are|r) (you|u) (a |an )?(real|human|person|bot|robot|ai|machine|chatgpt|automated|live)\b/,
      /\bis this (a )?(bot|ai|real person|human|automated)\b/,
    )
  )
    return null;
  return {
    score: 12,
    reply: {
      text: `I'm the ${site.name} help bot, an automated assistant that answers from the site's FAQ, size guide and product info. I'm not a person, but real people read ${site.contactEmail} if you'd like one.`,
      links: [{ href: "/contact", label: "Contact page" }],
    },
  };
};

const smallTalkIntent: Intent = ({ q }) => {
  const t = q.replace(/[!.?,]+/g, " ").trim();
  if (/^(hi|hey|hello|yo|sup|hiya|howdy|heya|hola|good (morning|afternoon|evening))( there| saverine| guys| team| all)?$/.test(t))
    return { score: 12, reply: { text: "Hey! How can I help? Ask about the brand, sizing, shipping, refunds or the products." } };
  if (/^((thanks?|thank (you|u)|thx|ty|tysm|cheers|appreciate (it|that))( (so|very) much| a lot| again)?|(ok|okay|cool|great|awesome|perfect|nice|got it)( thanks?| thank (you|u))?)$/.test(t))
    return { score: 12, reply: { text: `Anytime. ${taglineMain}.` } };
  if (/^(how (are|r) (you|u)( doing)?|how'?s it going|what'?s up|wassup)$/.test(t))
    return { score: 12, reply: { text: "Having a good day, thanks for asking. What can I help you with?" } };
  if (/^(lol|lmao|haha+|hehe|ha|nice one|wow)$/.test(t)) return { score: 12, reply: { text: "Ha. Anything I can help you with?" } };
  const POLITE = new Set("ok okay k cool great awesome perfect nice got it thanks thank thx ty you u so very much a lot again bye goodbye cheers appreciate that see ya later".split(" "));
  if (t.split(/\s+/).every((w) => POLITE.has(w)) && /\b(thanks?|thx|ty|cheers|appreciate|bye|goodbye)\b/.test(t))
    return { score: 12, reply: { text: `Anytime. ${taglineMain}.` } };
  if (/^(bye|goodbye|see (you|ya)|later|cya)$/.test(t)) return { score: 12, reply: { text: `See you. ${taglineMain}.` } };
  return null;
};

const legitIntent: Intent = ({ q }) => {
  if (!has(q, /\blegit\b/, /\bscam\b/, /\bfake\b/, /\btrust(worthy)?\b/, /\b(real|legitimate) (company|store|brand|business|website|site)\b/, /\bsafe to (buy|order|shop)\b/, /\breliable\b/))
    return null;
  const social = socialLinks.length ? ` You can also find us on ${list(socialLinks.map((l) => l.label))}.` : "";
  return {
    score: 11,
    reply: {
      text: `Fair question. ${site.name} is a small preorder brand: ${faqAnswer("How do preorders work")}\n\nRefunds: ${site.refundPolicy}\n\nA real person answers at ${site.contactEmail}.${social}`,
      links: [{ href: "/faq", label: "FAQ" }, { href: "/contact", label: "Contact page" }, ...socialLinks.map((l) => ({ href: l.href, label: l.label }))],
    },
  };
};

const dropMeaningIntent: Intent = ({ q }) => {
  if (!has(q, /\bwhat('?s| is| does)\s+(a |the )?drop\b(?!\s*(2|two))/, /\bdrop mean\b/, /\bmean by (a )?drop\b/)) return null;
  const now = products.map((p) => `${p.name} in ${list(availableColors(p))}`);
  const later = products.filter((p) => laterColors(p).length).map((p) => `${p.name} in ${list(laterColors(p))}`);
  return {
    score: 11,
    reply: {
      text: `A drop is one release. We release colorways in drops and make each one to order. The ${site.preorder.dropName.toLowerCase()} is ${list(now)}. ${preorderTiming()}${later.length ? `\n\nDrop ${NEXT_DROP} comes next: ${list(later)}. ${faqAnswer("What about the colorways")}` : ""}`,
      links: [{ href: "/#drop", label: "See the drop" }, { href: "/#signup", label: "Join the email list" }],
    },
  };
};

const sellIntent: Intent = ({ q, ps }) => {
  const generic = has(q, /\bwhat (kind|type|sort|style)s? of (clothes|clothing|stuff|products|things|brand|store|shop)\b/, /\bwhat (do|does|can) (you|u|saverine|they) (sell|have|make|offer|carry)\b/, /\b(what|which) (products|items|pieces|stuff|clothes)\b/, /\bwhat'?s (in the|in your) (drop|store|shop|collection)\b/, /\b(your|the) (catalog|collection|lineup|range)\b/, /\bshow me (the |your )?(products|everything|stuff)\b/);
  const doYouSell = q.match(/\b(?:do|does) (?:you|u|saverine|they) (?:guys )?(?:sell|have|make|carry|do|offer)\s+(?:any\s+)?(.+?)\??$/);
  if (!generic && !doYouSell) return null;
  if (doYouSell) {
    const thing = doYouSell[1];
    const isKnown = ps.length || findColors(thing).length || findSize(thing) || COMMON_COLOR_WORDS.test(thing) || /\b(size|kid|youth|discount|code|coupon|promo|gift|instagram|tiktok|refund|return|exchange|shipping|international|sale|student|military|pocket|hood|xxl|3xl|xxxl|4xl)/.test(thing);
    if (isKnown) return null; // let the specific intents answer
  }
  const lines = products.map((p) => `${p.name}, ${money(p.price)}: ${p.blurb}`);
  const prefix = doYouSell ? `Not right now. The ${site.preorder.dropName.toLowerCase()} is just ${products.length === 2 ? "two pieces" : `${products.length} pieces`}:` : `${site.about.dropIntro}`;
  return {
    score: doYouSell ? 9 : 10,
    reply: {
      text: `${prefix}\n${lines.join("\n")}\n\n${preorderTiming()}${doYouSell ? `\n\n${site.about.nextDropPitch}` : ""}`,
      links: [...products.map((p) => ({ href: productHref(p), label: p.name })), ...(doYouSell ? [{ href: "/#signup", label: "Join the email list" }] : [])],
    },
  };
};

/** Fabric, construction, print and "tell me about the X" questions, from products.ts. */
const productInfoIntent: Intent = ({ q, words, ps }) => {
  const FEATURE: Record<string, RegExp> = {
    pocket: /pocket/i,
    hood: /hood\b|lined hood/i,
    print: /print|wordmark|graphic|logo/i,
    shrink: /shrunk|shrink/i,
    cuff: /cuff|hem|rib/i,
  };
  const featureAsked = Object.entries({
    pocket: /\bpockets?\b/,
    hood: /\bhood (lined|lining)|\blined hood|\bis the hood\b/,
    print: /\b(print|printed|graphic|logo|design|wordmark|says|writing|back of|front of|on the back|on the front|chest)\b/,
    shrink: /\bshrink|shrunk|shrinkage\b/,
    cuff: /\b(cuffs?|hem|ribbed)\b/,
  })
    .filter(([, re]) => re.test(q))
    .map(([k]) => k);
  const fabricAsked = words.includes("fabric") || has(q, /\bmade (of|from|with)\b/, /\bwhat'?s it made\b/, /\b100 ?%/, /\bgsm\b/, /\bquality\b/);
  const describe = has(q, /\b(tell me (more )?about|describe|details (on|of|about)|info (on|about)|what'?s (the|this) (tee|hoodie|.+ (tee|hoodie)) like|what is the (tee|hoodie|.+ (tee|hoodie)))\b/);
  if (!featureAsked.length && !fabricAsked && !(describe && ps.length)) return null;
  if (UNKNOWN_PRODUCT_FACTS.test(q)) return null;
  if (words.includes("wash") || words.includes("fade")) return null; // care questions are in the FAQ
  // "chest" alone is a sizing question
  if (featureAsked.length === 1 && featureAsked[0] === "print" && /\bchest\b/.test(q) && !/\b(print|logo|design|graphic)\b/.test(q) && (findSize(q) || /measure|width|size/.test(q))) return null;
  if (!featureAsked.length && fabricAsked && words.includes("size")) return null;
  const targets = ps.length ? ps : products;
  const parts = targets.map((p) => {
    const facts = [...p.description.split(/(?<=\.)\s+/), ...p.fabric, ...p.fit];
    if (featureAsked.length) {
      const hits = facts.filter((f) => featureAsked.some((k) => FEATURE[k].test(f)));
      if (hits.length) return `${p.name}: ${hits.join(" ").replace(/\.?$/, ".")}`;
      if (ps.length) return `${p.name}: ${sentences(p.fabric)}`;
      return null;
    }
    if (describe && !fabricAsked) return `${p.name} (${money(p.price)}): ${p.description}\n${sentences(p.fabric)}`;
    const weight = /\b(heavy|heavyweight|weight|thick|thin|light|lightweight|midweight)\b/.test(q)
      ? p.description.split(/(?<=\.)\s+/).filter((d) => /heavy|weight/i.test(d))
      : [];
    return `${p.name}: ${sentences([...weight, ...p.fabric])}`;
  });
  const shown = parts.filter(Boolean) as string[];
  if (!shown.length) return null;
  const care = featureAsked.includes("shrink") ? `\n\n${faqAnswer("How do I wash it")}` : "";
  return {
    score: ps.length || featureAsked.length ? 10 : 8,
    reply: { text: shown.join("\n\n") + care, links: targets.map((p) => ({ href: productHref(p), label: p.name })) },
  };
};

const sizeIntent: Intent = ({ q, words, ps }) => {
  const asksSize =
    words.some((w) => ["size", "fit", "measure", "chest", "length", "big", "small", "boxy", "oversized", "baggy", "tight", "unisex", "loose", "large", "medium", "chart", "tall", "height", "lbs", "pound", "weigh", "foot", "feet", "youth", "xxl", "3xl", "xxxl", "4xl", "2xl", "xl", "xs"].includes(w)) ||
    has(q, /size (up|down)/, /what size/, /\bwhich size\b/, /\bhow (does|do) (it|they|the \w+) (fit|run)\b/, /\btrue to size\b/, /\brun (big|small|large)\b/);
  if (!asksSize) return null;
  if (words.includes("swap") || words.includes("refund")) return null; // "swap sizes" is in the FAQ
  const links: ChatLink[] = [{ href: "/size-guide", label: "Full size guide" }];
  const fit = faqAnswer("How does it fit");

  if (/\b(3xl|xxxl|4xl|5xl|xxxxl)\b/.test(q))
    return { score: 10, reply: { text: `Not at the moment: sizes go up to ${lastSize}. ${SIZE_RANGE}\n\n${fit}`, links } };

  const size = has(q, /\bruns? (small|large|big)\b/) ? undefined : findSize(q);
  const kids = words.includes("youth") || /\b\d{1,2} ?(yo|years? old|yrs?)\b/.test(q);
  if (kids && !size) {
    const chart = (g: Garment) => sizeCharts[g].Youth.map((r) => `${r.size} ${r.chest}"×${r.length}"`).join(", ");
    const charts = (ps.length ? ps : products).map((p) => `${p.name} youth (chest × length): ${chart(p.garment)}`).join("\n");
    return { score: 10, reply: { text: `Yes, we make youth sizes. ${faqAnswer("Youth or Adult")}\n\n${charts}`, links } };
  }
  if (has(q, /\b(youth|kids?)\b.*\b(or|vs|versus)\b.*\badult\b/, /\badult\b.*\b(or|vs|versus)\b.*\b(youth|kids?)\b/))
    return { score: 10, reply: { text: faqAnswer("Youth or Adult"), links } };

  if (ps.length === 1 && size) {
    const p = ps[0];
    const chart = sizeCharts[p.garment];
    const groups = size.group ? [size.group] : (["Adult", "Youth"] as const).filter((g) => chart[g].some((r) => r.size === size.size));
    const lines = groups
      .map((g) => {
        const r = chart[g].find((row) => row.size === size.size);
        return r ? `${g} ${r.size}: ${r.chest}" chest width (pit to pit), ${r.length}" body length` : null;
      })
      .filter(Boolean);
    if (lines.length)
      return { score: 11, reply: { text: `${p.name}, measured flat:\n${lines.join("\n")}\n\n${sentences(p.fit)}`, links: [...links, { href: productHref(p), label: p.name }] } };
  }

  if (size) {
    const g = size.group ?? "Adult";
    const lines = (ps.length ? ps : products)
      .map((p) => {
        const r = sizeCharts[p.garment][g].find((row) => row.size === size.size);
        return r ? `${p.name}, ${g} ${r.size}: ${r.chest}" chest width, ${r.length}" body length` : null;
      })
      .filter(Boolean);
    if (lines.length) return { score: 10, reply: { text: `Measured flat:\n${lines.join("\n")}\n\n${fit}`, links } };
  }

  if (has(q, /\b(tall|height|lbs|pounds?|weigh|weight|foot|feet|ft)\b/, /\b\d'\d/)) {
    return {
      score: 10,
      reply: {
        text: `We don't have a height/weight chart, so the surest way is to measure a ${garmentWord.tee} or ${garmentWord.hoodie} you already love (pit to pit, and shoulder to hem) and compare it with the size guide.\n\n${fit}`,
        links,
      },
    };
  }

  const wantsChart = has(q, /\b(chart|measure|measurements?|dimensions?|chest|length|inches|cm)\b/);
  if (ps.length === 1 && (wantsChart || !has(q, /\bfit|run|true to size|size (up|down)\b/))) {
    const p = ps[0];
    const chart = sizeCharts[p.garment];
    const rows = (["Youth", "Adult"] as const).map((g) => `${g}: ${chart[g].map((r) => `${r.size} ${r.chest}"×${r.length}"`).join(", ")}`).join("\n");
    return {
      score: 10,
      reply: {
        text: `${p.name} fit: ${sentences(p.fit)}\n\nChest width × body length, in inches, measured flat:\n${rows}`,
        links: [...links, { href: productHref(p), label: p.name }],
      },
    };
  }
  if (wantsChart && !ps.length) {
    const rows = products
      .map((p) => `${p.name} (chest width × body length, inches):\n${(["Youth", "Adult"] as const).map((g) => `${g}: ${sizeCharts[p.garment][g].map((r) => `${r.size} ${r.chest}"×${r.length}"`).join(", ")}`).join("\n")}`)
      .join("\n\n");
    return { score: 10, reply: { text: `${rows}\n\nMeasured flat: chest is pit to pit, length is high shoulder to hem. See the size guide for more.`, links } };
  }
  if (ps.length === 1) {
    const p = ps[0];
    return { score: 10, reply: { text: `${p.name}: ${sentences(p.fit)}\n\n${fit}`, links: [...links, { href: productHref(p), label: p.name }] } };
  }
  if (has(q, /\bwhat sizes\b/, /\bsizes (do|does|are)\b/, /\b(size|sizes) (available|range|offered)\b/, /\bhave .*\bsizes?\b/))
    return { score: 10, reply: { text: `${SIZE_RANGE} Everything is unisex.\n\n${fit}`, links } };

  return { score: 9, reply: { text: `${fit}\n\n${SIZE_RANGE} The size guide has chest and length for every size.`, links } };
};

const colorIntent: Intent = ({ q, ps }) => {
  let cs = findColors(q);
  if (!cs.length) return null;
  const links: ChatLink[] = [];
  const lines: string[] = [];
  if (ps.length === 1) {
    const p = ps[0];
    const onProduct = cs.filter((c) => c.product === p);
    const elsewhere = cs.filter((c) => c.product !== p && !onProduct.some((o) => o.name === c.name));
    for (const c of elsewhere)
      lines.push(`${c.name} isn't offered on the ${p.name}; it's a ${c.product.name} colorway${c.available ? "" : ` (drop ${NEXT_DROP})`}. The ${garmentWord[p.garment]} comes in ${list(availableColors(p))}${laterColors(p).length ? `, with ${list(laterColors(p))} in drop ${NEXT_DROP}` : ""}.`);
    cs = onProduct;
  }
  for (const c of cs)
    lines.push(
      c.available
        ? `${c.product.name} in ${c.name} is available to preorder now (${money(c.product.price)}).`
        : `${c.product.name} in ${c.name} is part of drop ${NEXT_DROP}, so it can't be ordered yet.`,
    );
  const anyLater = cs.some((c) => !c.available);
  for (const p of new Set([...cs.map((c) => c.product), ...ps])) links.push({ href: productHref(p), label: p.name });
  if (anyLater) links.push({ href: "/#signup", label: "Join the email list" });
  return { score: 11, reply: { text: lines.join("\n") + (anyLater ? `\n\n${faqAnswer("What about the colorways")}` : ""), links } };
};

const priceIntent: Intent = ({ q, words, ps }) => {
  const asksPrice = words.includes("price") || has(q, /\bhow much\b/, /\$\d*/);
  const asksColor = words.includes("color") || COMMON_COLOR_WORDS.test(q) && !!ps.length;
  if (!asksPrice && !asksColor) return null;
  if (asksPrice && words.includes("ship") && !ps.length && !has(q, /\b(tee|hoodie|both|each|everything)\b/)) return null; // shipping cost
  const targets = ps.length ? ps : products;
  const parts = targets.map((p) => {
    const bits = asksPrice ? [`${p.name}: ${money(p.price)} (preorder price). ${p.blurb}`] : [`${p.name}:`];
    bits.push(`Available now in ${list(availableColors(p))}.`);
    if (laterColors(p).length) bits.push(`Coming in drop ${NEXT_DROP}: ${list(laterColors(p))}.`);
    return bits.join(" ");
  });
  const both = asksPrice && targets.length > 1 && has(q, /\bboth\b|\btogether\b|\beach\b|\ball\b/) ? `\n\nOne of each is ${money(targets.reduce((n, p) => n + p.price, 0))} before shipping.` : "";
  const ship = asksPrice ? `\n\n${shippingSentence()}` : "";
  const colorNote = asksColor && COMMON_COLOR_WORDS.test(q) && !words.includes("color") ? "Our colorways have their own names:\n" : "";
  return {
    score: ps.length ? 10 : 9,
    reply: { text: colorNote + parts.join("\n\n") + both + ship, links: targets.map((p) => ({ href: productHref(p), label: `Shop the ${garmentWord[p.garment]}` })) },
  };
};

const drop2Intent: Intent = ({ q }) => {
  if (!has(q, /\bdrop\s*(2|two)\b/, /\b(second|next|new|future|upcoming) (drop|release|colou?rs?|colorways?)\b/, /\bcoming soon\b/, /\brestock/, /\bsold out\b/, /\bmore colou?rs\b/, /\bnotif(y|ied)\b/, /\bdrop (1|one)\b/, /\bnew stuff\b/)) return null;
  const now = products.map((p) => `${p.name}: ${list(availableColors(p))}`);
  const later = products.filter((p) => laterColors(p).length).map((p) => `${p.name}: ${list(laterColors(p))}`);
  return {
    score: 10,
    reply: {
      text: `Drop ${CURRENT_DROP} (open for preorder now):\n${now.join("\n")}${later.length ? `\n\nDrop ${NEXT_DROP} (coming next):\n${later.join("\n")}` : ""}\n\n${faqAnswer("What about the colorways")}`,
      links: [{ href: "/#signup", label: "Join the email list" }, { href: "/#drop", label: "See the drop" }],
    },
  };
};

const shippingIntent: Intent = ({ q, words }) => {
  const asks =
    words.includes("ship") ||
    words.includes("country") ||
    has(q, /\bwhen (will|do|does|would|can) (i|it|my|we|they)\b.*\b(get|receive|come|have)\b/, /\bhow long\b.*\b(take|get|ship|arrive|wait)\b/, /\bwhen\b.*\b(get|receive)\b.*\b(tee|hoodie|order|stuff)\b/);
  if (!asks) return null;
  const link = [{ href: "/faq#shipping", label: "Shipping FAQ" }];
  if (words.includes("wrong")) return null; // "arrived damaged" is in the FAQ
  if (words.includes("swap") || has(q, /\baddress\b/)) return { score: 10, reply: { text: faqAnswer("Can I change my address"), links: link } };
  if (words.includes("country") || has(q, /\bwhere\b.*\bship\b/, /\bship\b.*\b(to|outside)\b/)) {
    const asksAboutUs = has(q, /\b(us|usa|u\.s\.?|united states|america|domestic|states)\b/);
    const prefix = US_ONLY && words.includes("country") && !asksAboutUs ? "Not yet, sorry. " : "";
    return { score: 10, reply: { text: prefix + shippingSentence(), links: link } };
  }
  if (words.includes("delay")) return { score: 10, reply: { text: faqAnswer("What if production runs late"), links: link } };
  if (has(q, /\b(cost|price|how much|free|fee|flat|rate)\b/) || words.includes("price")) return { score: 10, reply: { text: shippingSentence(), links: link } };
  const when = faqAnswer("When will my order ship", `Orders ship by ${site.preorder.shipsBy}.`);
  return { score: 9, reply: { text: `${when}\n\n${shippingSentence()}`, links: link } };
};

const refundIntent: Intent = ({ words }) => {
  if (!words.includes("refund") && !words.includes("cancel")) return null;
  if (words.includes("wrong")) return null; // damaged items are in the FAQ
  if (words.includes("swap")) return null; // "change my order/size"
  return {
    score: 10,
    reply: {
      text: `${site.refundPolicy}\n\nTo ask for a refund or cancel, email ${site.contactEmail} with your order number.`,
      links: [{ href: "/faq#refunds", label: "Refunds & cancellation" }],
      handoff: true,
    },
  };
};

const preorderIntent: Intent = ({ q, words }) => {
  const asksTiming =
    (has(q, /\b(close|closes|closing|closed|deadline|last day|end|ends|ending|until when|still open|open|cutoff|cut off|time left|still (order|buy|preorder))\b/) &&
      (words.includes("preorder") || has(q, /\b(order|window|drop|buy)\b/))) ||
    has(q, /\bhow long (do i have|until|is the preorder|are preorders)\b/, /\bhow (much )?time (do i have|left|is left)\b/, /\bpreorder (close|end|deadline|date)\b/, /\b(order|buy|preorder|get one) (after|past|later than)\b/, /\b(missed|miss) the (deadline|preorder|window|drop)\b/);
  const asksHow = words.includes("preorder") && has(q, /\bhow\b|\bwork|\bwhat is\b|\bmean|\bwhy\b|\bexplain\b/);
  if (!asksTiming && !asksHow) return null;
  const how = asksHow ? `${faqAnswer("How do preorders work")}\n\n` : "";
  return { score: 10, reply: { text: how + preorderTiming(), links: [{ href: "/#drop", label: "See the drop" }, { href: "/faq#preorders", label: "Preorder FAQ" }] } };
};

const checkoutIntent: Intent = ({ q, words }) => {
  if (!has(q, /\bcheck ?out\b/, /\bhow (do|can) i (buy|order|purchase|pay)\b/, /\bplace an order\b/, /\b(credit|debit) card\b/, /\bpaypal|apple pay|google pay|venmo|klarna|afterpay|shop pay|crypto\b/, /\bcart\b/, /\b(payment|pay) (methods?|options?)\b/, /\bcan'?t (buy|order|pay)\b/))
    return null;
  if (words.includes("charge") && has(q, /\bwhen\b/)) return null; // "when am I charged" is in the FAQ
  const text = CHECKOUT_ENABLED
    ? `Pick a colorway and size on a product page, add it to your cart, then hit Checkout. ${faqAnswer("When am I charged")}`
    : "Checkout isn't open just yet. You can pick your colorway and size and add it to your cart now. The cart is saved in your browser, so it'll be waiting when checkout opens.";
  return { score: 10, reply: { text, links: [{ href: "/#drop", label: "See the drop" }, { href: "/checkout", label: "Checkout" }] } };
};

const orderStatusIntent: Intent = ({ q }) => {
  if (!has(q, /\bmy order\b/, /\border (status|number|#)/, /\btracking\b/, /\btrack\b/, /\bwhere'?s my\b/, /\bwhere is my\b/, /#\s?\d{3,}/, /\border\s+#?\d{3,}/, /\bconfirmation\b/, /\breceipt\b/, /\bdidn'?t (get|receive)\b/, /\bnever (got|received|arrived)\b/, /\bhaven'?t (got|received)\b/)) return null;
  if (has(q, /\bwhen\b.*\bmy order\b.*\bship\b/) && !has(q, /\d{3,}/)) return null; // general shipping question
  if (has(q, /\b(cancel|refund|address|swap|change)\b/)) return null;
  return {
    score: 11,
    reply: {
      text: `I can't look up individual orders, but a real person can. Email ${site.contactEmail} with your order number and we'll get back to you. In general, every ${site.preorder.dropName.toLowerCase()} order ships by ${site.preorder.shipsBy}, and you'll get an email with tracking when yours leaves.`,
      links: [{ href: "/contact", label: "Contact page" }],
      handoff: true,
    },
  };
};

const contactIntent: Intent = ({ q }) => {
  if (!has(q, /\b(human|person|someone|somebody|agent|representative|rep|staff|real people|customer service|support team)\b/, /\bcontact\b/, /\b(your|an?) email\b/, /\bemail (you|address)\b/, /\breach (you|u|out)\b/, /\btalk to\b/, /\bspeak (to|with)\b/, /\bphone\b/, /\bcall (you|u)\b/, /\bget in touch\b/))
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

const socialIntent: Intent = ({ q, words }) => {
  if (!words.includes("instagram") && !has(q, /\b(tiktok|tik tok|social|socials|social media|twitter|facebook|youtube|pinterest|follow (you|u|along)|handle)\b/)) return null;
  const all = [
    { label: "Instagram", href: site.social.instagram, re: /instagram|insta\b|\big\b/ },
    { label: "TikTok", href: site.social.tiktok, re: /tik ?tok/ },
  ];
  const lines: string[] = [];
  for (const s of all) if (s.re.test(q) && !s.href) lines.push(`We're not on ${s.label} yet.`);
  const text = `${lines.join(" ")}${lines.length ? " " : ""}${socialText() || "We don't have social accounts up yet."}${socialLinks.length ? `\n${socialLinks.map((l) => `${l.label}: ${l.href}`).join("\n")}` : ""}`;
  return { score: 11, reply: { text, links: socialLinks.map((l) => ({ href: l.href, label: l.label })) } };
};

const INTENTS: Intent[] = [
  smallTalkIntent,
  botIdentityIntent,
  sustainIntent,
  aboutIntent,
  legitIntent,
  dropMeaningIntent,
  orderStatusIntent,
  contactIntent,
  socialIntent,
  refundIntent,
  drop2Intent,
  colorIntent,
  productInfoIntent,
  sizeIntent,
  sellIntent,
  priceIntent,
  preorderIntent,
  checkoutIntent,
  shippingIntent,
];

// ---------------------------------------------------------------------------
// FAQ keyword scoring

const FAQ_SECTION_LINK: Record<string, ChatLink> = Object.fromEntries(faqSections.map((s) => [s.id, { href: `/faq#${s.id}`, label: `FAQ: ${s.title}` }]));

const FAQ_INDEX = faqSections.flatMap((s) =>
  s.items.map((item) => ({ item, section: s.id, qWords: new Set(tokens(cleanText(item.q))), aWords: new Set(tokens(cleanText(item.a))) })),
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
  kind: "fallback",
};

const INTENT_MIN = 6;
const FAQ_MIN = 1.7;
const FAQ_STRONG = 3;

/** "hey, what size...": drop the greeting so the real question is matched. */
function stripGreeting(q: string): string {
  const stripped = q.replace(/^(hi|hey|hello|yo|hiya|howdy|good (morning|afternoon|evening))( there| saverine| guys| team)?[\s,!.]+(?=\S)/, "");
  return stripped.split(" ").length >= 2 ? stripped : q;
}

export function answer(question: string): BotReply {
  let q = cleanText(question.slice(0, 500));
  if (!q) return FALLBACK;
  q = stripGreeting(q);
  const words = tokens(q);
  // Intents run on the typo-corrected text and on the text as typed, so a
  // correction can never hide a word the user actually wrote.
  const rawQ = stripGreeting(normalize(question.slice(0, 500)));
  const rawWords = tokens(rawQ);
  const contexts: Ctx[] = [
    { q, words, ps: findProducts(q, words) },
    { q: rawQ, words: rawWords, ps: findProducts(rawQ, rawWords) },
  ];

  let best: Hit | null = null;
  for (const ctx of contexts)
    for (const intent of INTENTS) {
      const r = intent(ctx);
      if (r && (!best || r.score > best.score)) best = r;
    }
  const f = bestFaq(words);
  const faqReply = (m: NonNullable<typeof f>): BotReply => ({ text: m.item.a, links: [FAQ_SECTION_LINK[m.section]].filter(Boolean), kind: "answer" });

  if (best && best.score >= 10) return { kind: "answer", ...best.reply };
  // The site doesn't cover sourcing, founders, location etc.: hand off rather than return a loosely related FAQ.
  if (UNKNOWN_PRODUCT_FACTS.test(q) || UNKNOWN_BRAND_FACTS.test(q)) return FALLBACK;
  if (f && f.score >= FAQ_STRONG) return faqReply(f);
  if (best && best.score >= INTENT_MIN) return { kind: "answer", ...best.reply };
  if (f && f.score >= FAQ_MIN) return faqReply(f);
  return FALLBACK;
}

/** mailto: link to support, with the conversation so far in the body. */
export function supportMailto(transcript: { from: "you" | "bot"; text: string }[]): string {
  const subject = `${site.name} support question`;
  const convo = transcript
    .slice(-12)
    .map((m) => `${m.from === "you" ? "Me" : `${site.name} bot`}: ${m.text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1 ($2)").replace(/\*\*/g, "")}`)
    .join("\n\n");
  let body = `Hi ${site.name},\n\n[Add your question or order number here]\n\n--- Chat so far ---\n${convo}`;
  if (body.length > 1800) body = `${body.slice(0, 1800)}…`;
  return `mailto:${site.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
