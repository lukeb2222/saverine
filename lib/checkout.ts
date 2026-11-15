import type { CartItem } from "./cart";

/**
 * CHECKOUT — the one place to wire up Shopify.
 *
 * Checkout is switched off until the Shopify store is connected. When you have
 * Storefront API access:
 *
 * 1. Create the two products in Shopify with a variant per colorway + size.
 * 2. Add each variant's ID to the catalog (e.g. a `shopifyVariantIds` map on
 *    each colorway in /data/products.ts, keyed by size).
 * 3. Set NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_TOKEN
 *    (see .env.example), then set CHECKOUT_ENABLED to true.
 * 4. Fill in startCheckout(): call the Storefront API `cartCreate` mutation
 *    with the cart lines and return the `checkoutUrl` it gives back. The
 *    checkout page redirects the customer there, and Shopify handles payment,
 *    tax, shipping, order emails and the order export for the factory.
 */
export const CHECKOUT_ENABLED = false;

/** Returns the URL of the hosted checkout to send the customer to. */
export async function startCheckout(items: CartItem[]): Promise<string> {
  void items;
  throw new Error("Checkout isn't connected yet.");
}
