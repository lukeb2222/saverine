/**
 * Question set for the support chat (lib/support.ts).
 * Run with: npm run test:support
 *
 * Each case says what a good answer must contain. `fallback: true` means the
 * site's data doesn't cover it, so the chat should hand off to email instead
 * of guessing. Expectations are checked against the data files where possible,
 * so they keep passing when copy or prices change.
 */
import { answer } from "@/lib/support";
import { site } from "@/data/site";
import { products } from "@/data/products";
import { sizeCharts } from "@/data/sizeGuide";

type Case = { q: string; expect?: RegExp | string; fallback?: boolean; handoff?: boolean; topic: string };

const tee = products.find((p) => p.garment === "tee")!;
const hoodie = products.find((p) => p.garment === "hoodie")!;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const price = (n: number) => new RegExp(`\\$${n}\\b`);
const hoodieAdultXL = sizeCharts.hoodie.Adult.find((r) => r.size === "XL")!;
const teeAdultS = sizeCharts.tee.Adult.find((r) => r.size === "S")!;
const teeYouthM = sizeCharts.tee.Youth.find((r) => r.size === "M")!;
const hoodieAdultXXL = sizeCharts.hoodie.Adult.find((r) => r.size === "XXL")!;
const ships = esc(site.preorder.shipsBy);

const cases: Case[] = [
  // Brand / about / small talk
  { topic: "brand", q: "What is Saverine?", expect: /good days|garment-dyed/i },
  { topic: "brand", q: "whats saverine", expect: /good days|garment-dyed/i },
  { topic: "brand", q: "what is this brand about", expect: /good days/i },
  { topic: "brand", q: "tell me about saverine", expect: /good days/i },
  { topic: "brand", q: "what does good days only mean?", expect: /good day/i },
  { topic: "brand", q: "when was saverine started", expect: /2026/ },
  { topic: "brand", q: "is this legit?", expect: new RegExp(esc(site.contactEmail)) },
  { topic: "brand", q: "is saverine a scam", expect: /refund/i },
  { topic: "brand", q: "what do you sell", expect: new RegExp(`${esc(tee.name)}[\\s\\S]*${esc(hoodie.name)}`) },
  { topic: "brand", q: "what's a drop?", expect: /drop/i },
  { topic: "bot", q: "who are you", expect: /help bot/i },
  { topic: "bot", q: "who am i talking to", expect: /help bot/i },
  { topic: "bot", q: "are you a real person?", expect: /bot/i },
  { topic: "smalltalk", q: "hi", expect: /help/i },
  { topic: "smalltalk", q: "hello there!", expect: /help/i },
  { topic: "smalltalk", q: "thanks!", expect: /anytime/i },
  { topic: "smalltalk", q: "how are you", expect: /good/i },
  { topic: "brand", q: "who founded saverine?", fallback: true },
  { topic: "brand", q: "where are you guys based", fallback: true },

  // Products and materials
  { topic: "products", q: "tell me about the hoodie", expect: /fleece/i },
  { topic: "products", q: "tell me about the good days tee", expect: /cotton/i },
  { topic: "products", q: "do you sell hats?", expect: new RegExp(esc(tee.name)) },
  { topic: "materials", q: "what is the tee made of", expect: /cotton/i },
  { topic: "materials", q: "is the hoodie 100% cotton", expect: /fleece/i },
  { topic: "materials", q: "whats the fabric like on the hodie", expect: /fleece/i },
  { topic: "materials", q: "will it shrink?", expect: /shrunk/i },
  { topic: "materials", q: "does the hoodie have pockets", expect: /pocket/i },
  { topic: "materials", q: "what does the back of the hoodie look like", expect: /print across the back|back print/i },
  { topic: "materials", q: "whats printed on the tee", expect: /wordmark/i },

  // Fit and sizing
  { topic: "fit", q: "how does it fit", expect: /oversized/i },
  { topic: "fit", q: "is it true to size?", expect: /usual size/i },
  { topic: "fit", q: "does the tee run big", expect: /oversized/i },
  { topic: "fit", q: "should i size down in the hoodie", expect: /size down/i },
  { topic: "fit", q: "is it unisex", expect: /unisex/i },
  { topic: "sizing", q: "what are the measurements for an adult small tee", expect: new RegExp(`${teeAdultS.chest}"`) },
  { topic: "sizing", q: "hoodie chest measurment for xl", expect: new RegExp(`${hoodieAdultXL.chest}"`) },
  { topic: "sizing", q: "youth medium tee length", expect: new RegExp(`${teeYouthM.length}"`) },
  { topic: "sizing", q: "adult 2xl hoodie measurements", expect: new RegExp(`${hoodieAdultXXL.chest}"`) },
  { topic: "sizing", q: "what sizes do you have", expect: /XXL/ },
  { topic: "sizing", q: "is there a 3xl?", expect: /XXL/ },
  { topic: "sizing", q: "sizng chart", expect: /size guide/i },
  { topic: "sizing", q: "do you make kids sizes?", expect: /youth/i },
  { topic: "sizing", q: "my son is 10 what size should he get", expect: /youth/i },
  { topic: "sizing", q: "I'm 6 foot and 200 lbs, what size?", expect: /size guide|measure/i },

  // Care
  { topic: "care", q: "how do i wash it", expect: /wash cold/i },
  { topic: "care", q: "can i put it in the dryer", expect: /tumble dry/i },
  { topic: "care", q: "can I iron the print", expect: /iron/i },
  { topic: "care", q: "does the color fade?", expect: /fade/i },
  { topic: "care", q: "will it bleed in the wash", expect: /separately/i },

  // Prices
  { topic: "price", q: "how much is the hoodie", expect: price(hoodie.price) },
  { topic: "price", q: "price of tee", expect: price(tee.price) },
  { topic: "price", q: "how much r the shirts", expect: price(tee.price) },
  { topic: "price", q: "how much for both", expect: new RegExp(`\\$${tee.price}[\\s\\S]*\\$${hoodie.price}`) },
  { topic: "price", q: "is shipping free?", expect: new RegExp(`\\$${site.shipping.freeOver}`) },

  // Colorways
  { topic: "colors", q: "what colors does the hoodie come in", expect: /Midnight Swell/ },
  { topic: "colors", q: "what colours r there", expect: /Olive Tree/ },
  { topic: "colors", q: "is salt flat available in the hoodie?", expect: /available/i },
  { topic: "colors", q: "do you have the tee in black", expect: /Midnight Swell/ },
  { topic: "colors", q: "golden state hoodie?", expect: /isn't offered|only on|Good Days Tee/i },
  { topic: "colors", q: "can I preorder sunset strip", expect: /drop 2/i },

  // Drops
  { topic: "drops", q: "whats the difference between drop 1 and drop 2", expect: /drop 2/i },
  { topic: "drops", q: "when is drop 2", expect: /email list|first dibs/i },
  { topic: "drops", q: "will you restock?", expect: /drop/i },
  { topic: "drops", q: "how do i get notified for the next drop", expect: /email list|first dibs/i },

  // Preorders and timing
  { topic: "preorder", q: "when do preorders close", expect: new RegExp(esc(site.preorder.closesAt.slice(0, 4))) },
  { topic: "preorder", q: "how long do i have to order?", expect: /open until|closed/i },
  { topic: "preorder", q: "preorder clsoe date", expect: /open until|closed/i },
  { topic: "preorder", q: "how do preorders work", expect: /made to order/i },
  { topic: "preorder", q: "why is it a preorder", expect: /made to order/i },
  { topic: "preorder", q: "when will i get my hoodie", expect: new RegExp(ships) },
  { topic: "preorder", q: "how long does shipping take", expect: new RegExp(ships) },
  { topic: "preorder", q: "when am i charged", expect: /checkout/i },
  { topic: "preorder", q: "what if my color doesnt get made", expect: /minimum/i },
  { topic: "preorder", q: "what if its late", expect: /longer than planned/i },

  // Shipping
  { topic: "shipping", q: "do you ship internationally", expect: /United States/ },
  { topic: "shipping", q: "shiping cost?", expect: new RegExp(`\\$${site.shipping.flatRate}`) },
  { topic: "shipping", q: "do you ship to the uk", expect: /United States/ },
  { topic: "shipping", q: "can i change my shipping address", expect: /address|before your order ships/i },

  // Returns / refunds / exchanges
  { topic: "refunds", q: "can i return it", expect: /refund/i },
  { topic: "refunds", q: "how do i cancel my order", expect: /refund/i, handoff: true },
  { topic: "refunds", q: "refnud policy", expect: /refund/i },
  { topic: "refunds", q: "can i exchange for a different size", expect: /before production/i },
  { topic: "refunds", q: "my hoodie arrived damaged", expect: /14 days/ },

  // Checkout / payment
  { topic: "checkout", q: "how do i checkout", expect: /checkout/i },
  { topic: "checkout", q: "do you take paypal", expect: /checkout/i },
  { topic: "checkout", q: "is my cart saved?", expect: /cart/i },

  // Discounts / gifts (no data: hand off)
  { topic: "discounts", q: "do you have a discount code", fallback: true },
  { topic: "gifts", q: "do you sell gift cards", fallback: true },

  // Order status / contact / socials
  { topic: "orders", q: "where is my order", handoff: true, expect: /order/i },
  { topic: "orders", q: "order 4821 status", handoff: true, expect: /order/i },
  { topic: "orders", q: "i didnt get a confirmation email", handoff: true, expect: new RegExp(esc(site.contactEmail)) },
  { topic: "contact", q: "how do I contact you", expect: new RegExp(esc(site.contactEmail)) },
  { topic: "contact", q: "whats your email", expect: new RegExp(esc(site.contactEmail)) },
  { topic: "contact", q: "can i talk to a real person", handoff: true, expect: new RegExp(esc(site.contactEmail)) },
  { topic: "socials", q: "do you have instagram?", expect: /instagram/i },
  { topic: "socials", q: "whats your tiktok", expect: /tiktok|instagram/i },

  // Extra phrasings
  { topic: "brand", q: "saverine?", expect: /good days/i },
  { topic: "brand", q: "what kind of clothes is this", expect: new RegExp(esc(hoodie.name)) },
  { topic: "brand", q: "is it eco friendly", expect: /waste/i },
  { topic: "brand", q: "where are the clothes made", fallback: true },
  { topic: "brand", q: "what's the best seller", fallback: true },
  { topic: "fit", q: "does the hoodie run small", expect: /oversized/i },
  { topic: "sizing", q: "can i get a large tee", expect: new RegExp(`${sizeCharts.tee.Adult.find((r) => r.size === "L")!.chest}"`) },
  { topic: "sizing", q: "do you have womens sizes", expect: /unisex/i },
  { topic: "materials", q: "is the tee heavyweight", expect: /heavy/i },
  { topic: "preorder", q: "can I order after feb 14", expect: /open until|closed/i },
  { topic: "refunds", q: "i want my money back", expect: /refund/i },
  { topic: "refunds", q: "whats your return polcy", expect: /refund/i },
  { topic: "shipping", q: "how much is shipping to california", expect: new RegExp(`\\$${site.shipping.flatRate}`) },
  { topic: "price", q: "Hey, how much is the tee?", expect: price(tee.price) },
  { topic: "smalltalk", q: "ok thanks bye", expect: /anytime/i },
  { topic: "smalltalk", q: "lol", expect: /help/i },
  { topic: "pickup", q: "can I pick it up locally", fallback: true },

  // Nonsense
  { topic: "nonsense", q: "asdfghjkl", fallback: true },
  { topic: "nonsense", q: "what's the weather tomorrow", fallback: true },
  { topic: "nonsense", q: "can my dog drive a forklift", fallback: true },
];

let pass = 0;
const failures: string[] = [];
for (const c of cases) {
  const r = answer(c.q);
  const isFallback = r.kind === "fallback";
  const problems: string[] = [];
  if (c.fallback && !isFallback) problems.push("expected fallback");
  if (!c.fallback && isFallback) problems.push("fell back");
  if (c.handoff && !r.handoff) problems.push("expected email handoff");
  if (c.expect && !(typeof c.expect === "string" ? r.text.includes(c.expect) : c.expect.test(r.text))) problems.push(`missing ${c.expect}`);
  if (problems.length) failures.push(`✗ [${c.topic}] "${c.q}": ${problems.join(", ")}\n    → ${r.text.replace(/\n/g, " | ").slice(0, 200)}`);
  else pass++;
  if (process.env.VERBOSE) console.log(`[${c.topic}] ${c.q}\n  → ${r.text.replace(/\n/g, " | ")}\n`);
}
console.log(failures.join("\n"));
console.log(`\n${pass}/${cases.length} passed (${Math.round((pass / cases.length) * 100)}%)`);
process.exit(failures.length ? 1 : 0);
