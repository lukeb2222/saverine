"use client";

import Link from "next/link";
import { useState } from "react";
import { isAvailable, type Product } from "@/data/products";
import { ProductVisual } from "./ProductVisual";
import { Swatches } from "./Swatches";

export function ProductCard({ product }: { product: Product }) {
  const [selected, setSelected] = useState(product.defaultColorway);
  const [preview, setPreview] = useState<string | null>(null);
  const colorway = product.colorways.find((c) => c.id === (preview ?? selected))!;
  const href = `/products/${product.slug}?color=${selected}`;
  const available = isAvailable(colorway);

  return (
    <article className="flex flex-col">
      <Link href={href} className="group relative block aspect-[4/5] overflow-hidden rounded-[3px] bg-bone-deep" aria-label={`${product.name} in ${colorway.name}`}>
        <div className="h-full w-full transition-transform duration-500 group-hover:scale-[1.03]">
          <ProductVisual product={product} colorway={colorway} sizes="(min-width: 768px) 45vw, 100vw" />
        </div>
        <span className="eyebrow absolute left-3 top-3 rounded-[2px] bg-ink px-2.5 py-1.5 text-[0.62rem] text-bone">
          {available ? "Preorder" : "Coming in drop 2"}
        </span>
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h3 className="h-display text-lg">
            <Link href={href} className="hover:text-red">
              {product.name}
            </Link>
          </h3>
          <p className="mt-1 text-sm text-ink/75">{product.blurb}</p>
        </div>
        <p className="h-display text-lg">${product.price}</p>
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <Swatches
          colorways={product.colorways}
          selected={selected}
          onSelect={setSelected}
          onPreview={setPreview}
          size="sm"
          name={product.name}
        />
        <p className="shrink-0 text-sm text-ink/75" aria-live="polite">
          {colorway.name}
        </p>
      </div>
      <Link href={href} className="btn btn-outline mt-5 self-start">
        {isAvailable(product.colorways.find((c) => c.id === selected)!) ? `Preorder — $${product.price}` : "Take a look"}
      </Link>
    </article>
  );
}
