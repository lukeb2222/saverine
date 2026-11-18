/**
 * Generates support-api/lib/knowledge.js: the facts the AI support agent is
 * allowed to use, built from the site's data files. Run after editing data/:
 *
 *   npm run support:knowledge
 *
 * test/supportKnowledge.test.ts fails if the committed file is out of date.
 */
import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { faqSections } from "@/data/faq";
import { CURRENT_DROP, SIZES, isAvailable, products } from "@/data/products";
import { site, socialLinks } from "@/data/site";
import { sizeCharts } from "@/data/sizeGuide";
import { CHECKOUT_ENABLED } from "@/lib/checkout";

const OUT = fileURLToPath(new URL("../support-api/lib/knowledge.js", import.meta.url));
const SITE = "https://saverine.shop";

export function buildKnowledge(): string {
  const L: string[] = [];
  const p = (s = "") => L.push(s);

  p(`# ${site.name}: facts for the support agent`);
  p(`Generated from the site's data files. Only these facts are true for support purposes.`);
  p();
  p(`## Brand`);
  p(`- Name: ${site.name}. Tagline: "${site.tagline}". Secondary line: "${site.secondaryLine}".`);
  p(`- Description: ${site.description}`);
  p(`- Homepage line: ${site.about.heroLine}`);
  p(`- Story ("${site.about.storyTitle}"): ${site.about.story}`);
  p(`- ${site.about.dropIntro}`);
  p(`- Website: ${SITE}. Contact email (real people): ${site.contactEmail}.`);
  p(`- Social: ${socialLinks.length ? socialLinks.map((l) => `${l.label} ${l.href}`).join(", ") : "none yet"}.${site.social.tiktok ? "" : " Not on TikTok yet."}`);
  p();
  p(`## Preorders and timing`);
  p(`- Current drop: ${site.preorder.dropName} (drop ${CURRENT_DROP}). Everything is a preorder, made to order.`);
  p(`- Preorders close: ${site.preorder.closesAt} (shown on the site as "${site.preorder.closesLabel}").`);
  p(`- All ${site.preorder.dropName.toLowerCase()} orders ship by: ${site.preorder.shipsBy}.`);
  p(`- Minimum orders: ${site.minimumPolicy}`);
  p(`- Next drop (drop ${CURRENT_DROP + 1}): colorways marked "drop ${CURRENT_DROP + 1}" can't be ordered yet. ${site.about.nextDropPitch} Sign up on the homepage (${SITE}/#signup). No date has been announced.`);
  p(`- Checkout: ${CHECKOUT_ENABLED ? "open. Add to cart, then check out." : "NOT open yet (shows \"coming soon\"). Shoppers can add items to the cart now; the cart is saved in their browser. Accepted payment methods have not been announced."}`);
  p();
  p(`## Shipping`);
  p(`- Ships to: ${site.shipping.countries.join(", ")}${site.shipping.countries.length === 1 && site.shipping.countries[0] === "US" ? " (United States only for now)" : ""}.`);
  p(`- Flat shipping: $${site.shipping.flatRate}${site.shipping.freeOver !== null ? `; free on orders of $${site.shipping.freeOver} or more` : ""}.`);
  p();
  p(`## Refunds`);
  p(`- ${site.refundPolicy}`);
  p();
  p(`## Products (prices in USD, preorder prices)`);
  for (const pr of products) {
    const now = pr.colorways.filter(isAvailable).map((c) => c.name);
    const later = pr.colorways.filter((c) => !isAvailable(c)).map((c) => c.name);
    p(`### ${pr.name}: $${pr.price}`);
    p(`- Link: /products/${pr.slug}/ (full URL ${SITE}/products/${pr.slug}/)`);
    p(`- Type: ${pr.garment}. ${pr.blurb}`);
    p(`- Description: ${pr.description}`);
    p(`- Fabric: ${pr.fabric.join("; ")}`);
    p(`- Fit: ${pr.fit.join("; ")}`);
    p(`- Colorways available to preorder now: ${now.join(", ")}`);
    if (later.length) p(`- Colorways coming in drop ${CURRENT_DROP + 1} (not orderable yet): ${later.join(", ")}`);
    p(`- Sizes: ${(Object.keys(SIZES) as (keyof typeof SIZES)[]).map((g) => `${g} ${SIZES[g].join("/")}`).join("; ")}`);
  }
  p(`- There are no other products (no hats, pants, gift cards, etc.).`);
  p();
  p(`## Size charts (inches, measured flat: chest = pit to pit, length = high shoulder point to hem)`);
  for (const g of ["tee", "hoodie"] as const) {
    const name = products.find((x) => x.garment === g)?.name ?? g;
    for (const grp of ["Youth", "Adult"] as const)
      p(`- ${name}, ${grp}: ${sizeCharts[g][grp].map((r) => `${r.size} chest ${r.chest} / length ${r.length}`).join("; ")}`);
  }
  p(`- There is no height/weight chart. Advice from the site: measure a tee you already love and compare. Size guide page: /size-guide/`);
  p();
  p(`## FAQ (official answers)`);
  for (const s of faqSections) {
    p(`### ${s.title} (/faq/#${s.id})`);
    for (const i of s.items) p(`- Q: ${i.q}\n  A: ${i.a}`);
  }
  p();
  p(`## Not known (do not guess; point to ${site.contactEmail})`);
  p(`- Founders, owners or team; where the brand is based; where or by whom the clothes are made; factory or sourcing details beyond the fabric list; organic/recycled claims.`);
  p(`- Discount codes, sales, student/military discounts, gift cards, gift wrapping, local pickup, best sellers, stock counts, the drop 2 date, payment methods.`);
  p(`- Anything about a specific order (status, tracking, changes): the agent cannot see orders.`);
  p(`- Pages on the site: / (home, #drop, #signup), ${products.map((x) => `/products/${x.slug}/`).join(", ")}, /size-guide/, /faq/, /contact/, /checkout/.`);
  return L.join("\n");
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const text = buildKnowledge();
  writeFileSync(
    OUT,
    `// GENERATED by scripts/build-support-knowledge.ts from data/*.ts. Do not edit by hand.\n// Regenerate with: npm run support:knowledge\nexport const KNOWLEDGE = ${JSON.stringify(text)};\n`,
  );
  console.log(`Wrote ${OUT} (${text.length} chars)`);
}
