"use client";

import Link from "next/link";
import { useState } from "react";
import { site } from "@/data/site";
import { useCart } from "@/lib/cart";
import { CHECKOUT_ENABLED, startCheckout } from "@/lib/checkout";
import { shippingFor } from "@/lib/shipping";
import { CartLines } from "./CartLines";
import { SignupForm } from "./SignupForm";

export function CheckoutView() {
  const { lines, subtotal } = useCart();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const shipping = shippingFor(subtotal);

  async function pay() {
    setBusy(true);
    setError("");
    try {
      window.location.href = await startCheckout(lines.map(({ slug, colorId, size, qty }) => ({ slug, colorId, size, qty })));
    } catch {
      setError("We couldn't start checkout. Your cart is safe — try again in a minute.");
      setBusy(false);
    }
  }

  return (
    <div className="container-x py-10 md:py-16">
      <h1 className="h-display text-3xl md:text-4xl">Checkout</h1>

      {lines.length === 0 ? (
        <div className="mt-8">
          <p className="text-lg text-ink/80">Your cart is empty.</p>
          <Link href="/#drop" className="btn btn-red mt-6">
            See the drop
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <section aria-label="Order summary">
            <h2 className="h-display text-sm">Your order</h2>
            <CartLines />
            <dl className="space-y-2 border-t-2 border-ink pt-4 text-[0.95rem]">
              <div className="flex justify-between">
                <dt>Subtotal</dt>
                <dd className="tabular-nums">${subtotal}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Shipping</dt>
                <dd className="tabular-nums">{shipping === 0 ? "Free" : `$${shipping}`}</dd>
              </div>
              <div className="flex justify-between pt-2 text-lg font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">${subtotal + shipping}</dd>
              </div>
            </dl>
            <p className="mt-2 text-xs text-ink/60">Sales tax, if any, is calculated at payment.</p>
          </section>

          {CHECKOUT_ENABLED ? (
            <section className="self-start rounded-[3px] bg-bone-deep p-6">
              <p className="text-sm leading-relaxed">
                <strong>This is a preorder.</strong> You&rsquo;ll be charged today; your order ships by {site.preorder.shipsBy}.{" "}
                {site.refundPolicy}
              </p>
              <button type="button" onClick={pay} disabled={busy} className="btn btn-red mt-5 w-full">
                {busy ? "One sec…" : `Pay now — $${subtotal + shipping}`}
              </button>
              {error && (
                <p role="alert" className="mt-3 text-sm font-semibold text-red-deep">
                  {error}
                </p>
              )}
            </section>
          ) : (
            <section className="self-start rounded-[3px] bg-navy p-6 text-bone md:p-8">
              <p className="eyebrow text-gold">Almost there</p>
              <h2 className="h-display mt-2 text-2xl">Checkout is coming soon</h2>
              <p className="mt-3 leading-relaxed text-bone/85">
                We&rsquo;re putting the finishing touches on payments, so nothing has been charged. Your cart is saved on
                this device. Leave your email and we&rsquo;ll tell you the moment preorders open.
              </p>
              <div className="mt-6">
                <SignupForm />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
