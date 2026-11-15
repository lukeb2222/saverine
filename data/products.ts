/**
 * The catalog. Edit prices, names, colorways and copy here.
 *
 * Photos live in /public/images and are listed per colorway in `images`
 * (first one is the main shot). To replace one, overwrite the file or change
 * the list in tee() / hoodie() below. A colorway with no images falls back to
 * a drawn SVG mockup.
 */

export type Colorway = {
  id: string;
  name: string;
  hex: string;
  /**
   * Which drop this colorway belongs to. Drop 1 can be preordered now;
   * later drops show as "coming soon" teasers. Change the number to move it.
   */
  drop?: number;
  /** Photos for this colorway, main shot first. When empty, an SVG mockup is drawn. */
  images?: ProductImage[];
};

export type ProductImage = { src: string; width: number; height: number; alt: string; label: string };

export type Garment = "tee" | "hoodie";

export type Product = {
  slug: string;
  name: string;
  garment: Garment;
  /** Preorder price in whole USD. */
  price: number;
  blurb: string;
  description: string;
  fabric: string[];
  fit: string[];
  defaultColorway: string;
  colorways: Colorway[];
};

export const COLORS = {
  oliveTree: { id: "olive-tree", name: "Olive Tree", hex: "#7A7A55" },
  saltFlat: { id: "salt-flat", name: "Salt Flat", hex: "#E8E0CF" },
  midnightSwell: { id: "midnight-swell", name: "Midnight Swell", hex: "#2B2A28" },
  lowTide: { id: "low-tide", name: "Low Tide", hex: "#2E3B52" },
  goldenState: { id: "golden-state", name: "Golden State", hex: "#D6A84A" },
  sunsetStrip: { id: "sunset-strip", name: "Sunset Strip", hex: "#B8483A" },
  fogCity: { id: "fog-city", name: "Fog City", hex: "#9A9A96" },
  powderDay: { id: "powder-day", name: "Powder Day", hex: "#9DB4C4" },
} satisfies Record<string, Colorway>;

export const SIZES = {
  Youth: ["S", "M", "L", "XL"],
  Adult: ["XS", "S", "M", "L", "XL", "XXL"],
} as const;

export type SizeGroup = keyof typeof SIZES;

/** e.g. "Youth M", "Adult XL" */
export const ALL_SIZES: string[] = (Object.keys(SIZES) as SizeGroup[]).flatMap((g) =>
  SIZES[g].map((s) => `${g} ${s}`),
);

const MODEL = { width: 820, height: 1024 };
const FLAT = { width: 1024, height: 1280 };

function tee(c: Colorway, extra: Partial<Colorway> = {}): Colorway {
  const main: ProductImage =
    c.id === "olive-tree"
      ? {
          src: "/images/good-days-tee-olive-tree.jpg",
          width: 896,
          height: 1200,
          alt: "Good Days Tee in Olive Tree, worn on the tailgate of an old pickup on a desert highway",
          label: "On body",
        }
      : { src: `/images/tee-${c.id}-model.jpg`, ...MODEL, alt: `Good Days Tee in ${c.name}, worn`, label: "On body" };
  return {
    ...c,
    ...extra,
    images: [main, { src: `/images/tee-${c.id}.jpg`, ...FLAT, alt: `Good Days Tee in ${c.name}, laid flat`, label: "Front" }],
  };
}

function hoodie(c: Colorway, extra: Partial<Colorway> = {}): Colorway {
  const n = `City to Coast Hoodie in ${c.name}`;
  return {
    ...c,
    ...extra,
    images: [
      { src: `/images/hoodie-${c.id}-model.jpg`, ...MODEL, alt: `${n}, worn, front`, label: "On body" },
      { src: `/images/hoodie-${c.id}-model-back.jpg`, ...MODEL, alt: `${n}, worn, back print`, label: "Back print" },
      { src: `/images/hoodie-${c.id}-front.jpg`, ...FLAT, alt: `${n}, laid flat, front`, label: "Front" },
      { src: `/images/hoodie-${c.id}-back.jpg`, ...FLAT, alt: `${n}, laid flat, back`, label: "Back" },
    ],
  };
}

export const products: Product[] = [
  {
    slug: "good-days-tee",
    name: "Good Days Tee",
    garment: "tee",
    price: 42,
    blurb: "Oversized, boxy, garment-dyed. Very soft.",
    description:
      "The one you'll reach for first. A boxy, oversized tee in heavy garment-dyed cotton that feels broken-in from day one. Marker wordmark across the chest, “Good Days Only — Est. 2026” underneath.",
    fabric: [
      "100% cotton jersey, very soft hand",
      "Garment-dyed and washed for a sun-faded, lived-in color",
      "Pre-shrunk — what you get is what you keep",
      "Each piece is dyed individually, so color varies slightly. That's the point.",
    ],
    fit: [
      "Oversized and boxy with a dropped shoulder",
      "Unisex sizing, Youth S through Adult XXL",
      "Take your usual size for the intended roomy fit, or size down for a closer one",
    ],
    defaultColorway: "olive-tree",
    colorways: [
      tee(COLORS.oliveTree),
      tee(COLORS.saltFlat),
      tee(COLORS.midnightSwell),
      tee(COLORS.lowTide, { drop: 2 }),
      tee(COLORS.goldenState, { drop: 2 }),
      tee(COLORS.sunsetStrip, { drop: 2 }),
      tee(COLORS.fogCity, { drop: 2 }),
      tee(COLORS.powderDay, { drop: 2 }),
    ],
  },
  {
    slug: "city-to-coast-hoodie",
    name: "City to Coast Hoodie",
    garment: "hoodie",
    price: 88,
    blurb: "Oversized midweight fleece with the palm-sunset back print.",
    description:
      "Built for dawn patrol, late trains and cold chairlifts. Soft midweight garment-dyed fleece, cut oversized. Small wordmark on the left chest, big palm-sunset “City to Coast” print across the back.",
    fabric: [
      "Midweight cotton fleece, brushed soft inside",
      "Garment-dyed and washed for a faded, lived-in color",
      "Ribbed cuffs and hem, lined hood, kangaroo pocket",
      "Each piece is dyed individually, so color varies slightly",
    ],
    fit: [
      "Oversized with a dropped shoulder and a little extra length",
      "Unisex sizing, Youth S through Adult XXL",
      "Take your usual size for the intended roomy fit, or size down for a closer one",
    ],
    defaultColorway: "midnight-swell",
    colorways: [
      hoodie(COLORS.midnightSwell),
      hoodie(COLORS.saltFlat),
      hoodie(COLORS.oliveTree, { drop: 2 }),
      hoodie(COLORS.fogCity, { drop: 2 }),
    ],
  },
];

/** The drop that is open for preorder right now. */
export const CURRENT_DROP = 1;

export function isAvailable(c: Colorway): boolean {
  return (c.drop ?? 1) <= CURRENT_DROP;
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getColorway(product: Product, id: string): Colorway | undefined {
  return product.colorways.find((c) => c.id === id);
}
