import { site } from "@/data/site";

/** Shipping cost in USD for a given subtotal. */
export function shippingFor(subtotal: number): number {
  const { flatRate, freeOver } = site.shipping;
  return freeOver !== null && subtotal >= freeOver ? 0 : flatRate;
}
