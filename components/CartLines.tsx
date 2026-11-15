"use client";

import Link from "next/link";
import { cart, MAX_QTY, useCart } from "@/lib/cart";
import { ProductVisual } from "./ProductVisual";

export function QtyStepper({
  qty,
  onChange,
  label,
  min = 1,
}: {
  qty: number;
  onChange: (n: number) => void;
  label: string;
  min?: number;
}) {
  const btn = "grid h-9 w-9 cursor-pointer place-items-center text-lg hover:bg-ink hover:text-bone disabled:cursor-not-allowed disabled:opacity-30";
  return (
    <div className="inline-flex items-center rounded-[3px] border-2 border-ink" role="group" aria-label={label}>
      <button type="button" className={btn} onClick={() => onChange(qty - 1)} disabled={qty <= min} aria-label="Decrease quantity">
        −
      </button>
      <span className="w-8 text-center text-sm font-semibold tabular-nums" aria-live="polite">
        {qty}
      </span>
      <button type="button" className={btn} onClick={() => onChange(qty + 1)} disabled={qty >= MAX_QTY} aria-label="Increase quantity">
        +
      </button>
    </div>
  );
}

export function CartLines({ onNavigate }: { onNavigate?: () => void }) {
  const { lines } = useCart();
  return (
    <ul className="divide-y-2 divide-ink/10">
      {lines.map((l) => (
        <li key={`${l.slug}-${l.colorId}-${l.size}`} className="flex gap-4 py-4">
          <Link
            href={`/products/${l.slug}?color=${l.colorId}`}
            onClick={onNavigate}
            className="h-24 w-20 shrink-0 overflow-hidden rounded-[3px] bg-bone-deep"
            aria-hidden
            tabIndex={-1}
          >
            <ProductVisual product={l.product} colorway={l.colorway} sizes="80px" />
          </Link>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-3">
              <Link href={`/products/${l.slug}?color=${l.colorId}`} onClick={onNavigate} className="h-display text-[0.8rem] hover:text-red">
                {l.product.name}
              </Link>
              <p className="font-semibold tabular-nums">${l.lineTotal}</p>
            </div>
            <p className="mt-1 text-sm text-ink/75">
              {l.colorway.name} · {l.size}
            </p>
            <div className="mt-3 flex items-center justify-between">
              <QtyStepper qty={l.qty} onChange={(n) => cart.setQty(l, n)} label={`Quantity for ${l.product.name}`} />
              <button type="button" onClick={() => cart.setQty(l, 0)} className="link cursor-pointer text-sm">
                Remove
              </button>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
