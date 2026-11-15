import { site } from "./site";

export type FaqItem = { q: string; a: string };
export type FaqSection = { id: string; title: string; items: FaqItem[] };

const { shipsBy, closesLabel } = site.preorder;

/** Short list reused in the product page accordion. */
export const preorderFaq: FaqItem[] = [
  {
    q: "How do preorders work?",
    a: `Every Saverine piece is made to order. You pick your color and size and pay today, we close the preorder window on ${closesLabel}, then we make exactly what was ordered. No overstock, no waste, and your size is guaranteed.`,
  },
  {
    q: "When will my order ship?",
    a: `The first drop ships by ${shipsBy}. We'll email you when production starts, and again with tracking the moment your order leaves.`,
  },
  {
    q: "When am I charged?",
    a: "At checkout, today. Paying up front is what lets us put your piece into production.",
  },
  {
    q: "Can I cancel or get a refund?",
    a: site.refundPolicy,
  },
];

export const faqSections: FaqSection[] = [
  {
    id: "preorders",
    title: "How preorders work",
    items: [
      preorderFaq[0],
      preorderFaq[2],
      { q: "What if my colorway doesn't get made?", a: site.minimumPolicy },
      {
        q: "What about the colorways marked “Drop 2”?",
        a: "Those are next. Join the email list and you'll get first dibs when drop 2 opens.",
      },
    ],
  },
  {
    id: "shipping",
    title: "Ship timing",
    items: [
      preorderFaq[1],
      {
        q: "What if production runs late?",
        a: "Garment dyeing is done in small batches and sometimes takes a little longer than planned. If the date moves, we'll tell you right away, and you can ask for a refund if the new date doesn't work for you.",
      },
      {
        q: "Where do you ship?",
        a: `Right now we ship within the United States. Shipping is a flat $${site.shipping.flatRate}${site.shipping.freeOver ? `, and free on orders of $${site.shipping.freeOver} or more` : ""}.`,
      },
      {
        q: "Can I change my address after ordering?",
        a: `Yes. Email ${site.contactEmail} with your order number any time before your order ships.`,
      },
    ],
  },
  {
    id: "refunds",
    title: "Refunds and cancellation",
    items: [
      preorderFaq[3],
      {
        q: "What if something's wrong with my order?",
        a: `If your piece shows up damaged, misprinted or not what you ordered, email ${site.contactEmail} within 14 days of delivery with a photo and we'll make it right.`,
      },
    ],
  },
  {
    id: "sizing",
    title: "Sizing",
    items: [
      {
        q: "How does it fit?",
        a: "Oversized and boxy, on purpose. Take your usual size for the roomy fit you see in the photos, or size down for something closer. Everything is unisex.",
      },
      {
        q: "Youth or Adult?",
        a: "Youth S–XL covers roughly ages 8–14. Adult XS picks up where Youth XL leaves off, with a bit more length. The size guide has chest and length for every size, so the surest way is to measure a tee you already love.",
      },
      {
        q: "Can I swap sizes?",
        a: `Before production starts, yes: email ${site.contactEmail} and we'll switch it. After that, your piece has been made in the size you ordered.`,
      },
    ],
  },
  {
    id: "care",
    title: "Care instructions",
    items: [
      {
        q: "How do I wash it?",
        a: "Machine wash cold, inside out, with like colors. Tumble dry low or hang dry. Skip the bleach and don't iron the print.",
      },
      {
        q: "Will the color fade?",
        a: "A little, and it's meant to. Garment-dyed pieces soften and fade with every wash, which is what gives them that lived-in look. Wash darker colors separately the first couple of times.",
      },
    ],
  },
];
