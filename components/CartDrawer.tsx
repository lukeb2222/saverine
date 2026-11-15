"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "@/lib/cart";
import { drawer, useDrawerOpen } from "@/lib/drawer";
import { site } from "@/data/site";
import { CartLines } from "./CartLines";

export function CartDrawer() {
  const open = useDrawerOpen();
  const { lines, subtotal, count } = useCart();
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const close = () => drawer.set(false);

  return (
    <dialog
      ref={ref}
      onClose={close}
      onClick={(e) => e.target === ref.current && close()}
      aria-label="Your cart"
      className="m-0 ml-auto h-dvh max-h-none w-full max-w-md bg-bone p-0 text-ink shadow-2xl backdrop:bg-ink/55"
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b-2 border-ink/10 px-5 py-4">
          <h2 className="h-display text-lg">
            Your cart <span className="text-ink/50">({count})</span>
          </h2>
          <button type="button" onClick={close} className="grid h-10 w-10 cursor-pointer place-items-center text-2xl hover:text-red" aria-label="Close cart">
            ×
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-5 px-6 text-center">
            <p className="font-marker text-3xl">Nothing here yet.</p>
            <p className="text-ink/75">The first drop is open for preorder.</p>
            <Link href="/#drop" onClick={close} className="btn btn-red">
              See the drop
            </Link>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5">
              <CartLines onNavigate={close} />
            </div>
            <div className="border-t-2 border-ink/10 px-5 py-5">
              <div className="flex items-baseline justify-between">
                <span className="h-display text-sm">Subtotal</span>
                <span className="text-xl font-semibold tabular-nums">${subtotal}</span>
              </div>
              <p className="mt-2 text-sm text-ink/75">
                Preorder: you&rsquo;re charged today and your order ships by {site.preorder.shipsBy}. Shipping is added at checkout.
              </p>
              <Link href="/checkout" onClick={close} className="btn btn-red mt-4 w-full">
                Checkout
              </Link>
            </div>
          </>
        )}
      </div>
    </dialog>
  );
}
