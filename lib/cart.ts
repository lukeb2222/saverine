"use client";

import { useSyncExternalStore } from "react";
import { getColorway, getProduct } from "@/data/products";

export type CartItem = { slug: string; colorId: string; size: string; qty: number };

const KEY = "saverine-cart-v1";
export const MAX_QTY = 10;
const EMPTY: CartItem[] = [];

let items: CartItem[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as CartItem[];
    // drop anything that no longer exists in the catalog
    items = raw.filter((i) => {
      const p = getProduct(i.slug);
      return p && getColorway(p, i.colorId) && i.qty > 0;
    });
  } catch {
    items = EMPTY;
  }
}

function commit(next: CartItem[]) {
  items = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(items));
  } catch {}
  listeners.forEach((l) => l());
}

const same = (a: CartItem, b: Omit<CartItem, "qty">) =>
  a.slug === b.slug && a.colorId === b.colorId && a.size === b.size;

export const cart = {
  add(item: CartItem) {
    load();
    const existing = items.find((i) => same(i, item));
    commit(
      existing
        ? items.map((i) => (same(i, item) ? { ...i, qty: Math.min(MAX_QTY, i.qty + item.qty) } : i))
        : [...items, { ...item, qty: Math.min(MAX_QTY, item.qty) }],
    );
  },
  setQty(item: Omit<CartItem, "qty">, qty: number) {
    commit(
      qty <= 0
        ? items.filter((i) => !same(i, item))
        : items.map((i) => (same(i, item) ? { ...i, qty: Math.min(MAX_QTY, qty) } : i)),
    );
  },
  clear() {
    commit(EMPTY);
  },
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) {
      loaded = false;
      load();
      cb();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function useCart() {
  const list = useSyncExternalStore(
    subscribe,
    () => (load(), items),
    () => EMPTY,
  );
  const lines = list.flatMap((i) => {
    const product = getProduct(i.slug);
    const colorway = product && getColorway(product, i.colorId);
    return product && colorway ? [{ ...i, product, colorway, lineTotal: product.price * i.qty }] : [];
  });
  return {
    lines,
    count: lines.reduce((n, l) => n + l.qty, 0),
    subtotal: lines.reduce((n, l) => n + l.lineTotal, 0),
  };
}
