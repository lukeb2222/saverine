"use client";

import { useSearchParams } from "next/navigation";
import type { Product } from "@/data/products";
import { ProductDetail } from "./ProductDetail";

/** Reads ?color= so links from cards and the cart land on the right colorway. */
export function ProductDetailFromUrl({ product }: { product: Product }) {
  const color = useSearchParams().get("color") ?? undefined;
  return <ProductDetail key={color} product={product} initialColor={color} />;
}
