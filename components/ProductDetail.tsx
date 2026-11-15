"use client";

import Link from "next/link";
import { useState } from "react";
import { isAvailable, SIZES, type Product, type SizeGroup } from "@/data/products";
import { preorderFaq } from "@/data/faq";
import { site } from "@/data/site";
import { cart } from "@/lib/cart";
import { drawer } from "@/lib/drawer";
import { Accordion } from "./Accordion";
import { QtyStepper } from "./CartLines";
import { useSecondsLeft } from "./PreorderBanner";
import { ProductVisual } from "./ProductVisual";
import { SizeChartTable } from "./SizeChartTable";
import { Swatches } from "./Swatches";
import type { MockupView } from "./Mockup";

type Shot = { key: string; view: MockupView; photo: boolean; label: string };

export function ProductDetail({ product, initialColor }: { product: Product; initialColor?: string }) {
  const start = product.colorways.find((c) => c.id === initialColor)?.id ?? product.defaultColorway;
  const [colorId, setColorId] = useState(start);
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [shot, setShot] = useState(0);
  const [needSize, setNeedSize] = useState(false);
  const closed = useSecondsLeft() === 0;

  const colorway = product.colorways.find((c) => c.id === colorId)!;
  const available = isAvailable(colorway);
  const drop1 = product.colorways.filter(isAvailable);
  const later = product.colorways.filter((c) => !isAvailable(c));

  const shots: Shot[] = [
    ...(colorway.photo ? [{ key: "photo", view: "front" as const, photo: true, label: "On body" }] : []),
    { key: "front", view: "front", photo: false, label: "Front" },
    ...(product.garment === "hoodie" ? [{ key: "back", view: "back" as const, photo: false, label: "Back" }] : []),
    { key: "detail", view: "detail", photo: false, label: "Print detail" },
  ];
  const current = shots[Math.min(shot, shots.length - 1)];

  function pickColor(id: string) {
    setColorId(id);
    setShot(0);
  }

  function add() {
    if (!size) {
      setNeedSize(true);
      document.getElementById("size-picker")?.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    cart.add({ slug: product.slug, colorId, size, qty });
    drawer.set(true);
  }

  return (
    <div className="container-x grid gap-10 py-8 md:py-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16">
      {/* gallery */}
      <div className="lg:sticky lg:top-24 lg:self-start">
        <div className="aspect-[4/5] overflow-hidden rounded-[3px] bg-bone-deep">
          <ProductVisual product={product} colorway={colorway} view={current.view} preferPhoto={current.photo} eager />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3" role="group" aria-label="Product images">
          {shots.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setShot(i)}
              aria-label={`Show ${s.label.toLowerCase()} image`}
              aria-pressed={i === shot}
              className={`aspect-square cursor-pointer overflow-hidden rounded-[3px] bg-bone-deep ${
                current.key === s.key ? "outline-2 outline-offset-2 outline-ink" : "opacity-80 hover:opacity-100"
              }`}
            >
              <ProductVisual product={product} colorway={colorway} view={s.view} preferPhoto={s.photo} sizes="120px" />
            </button>
          ))}
        </div>
        {!colorway.photo || !current.photo ? (
          <p className="mt-3 text-xs text-ink/60">Illustrated mockup. Product photos are on the way.</p>
        ) : null}
      </div>

      {/* buy box */}
      <div>
        <p className="eyebrow text-red">{site.preorder.dropName} · Preorder</p>
        <h1 className="h-display mt-2 text-3xl md:text-4xl">{product.name}</h1>
        <p className="mt-3 text-2xl font-semibold tabular-nums">${product.price}</p>
        <p className="mt-4 max-w-prose leading-relaxed text-ink/85">{product.description}</p>

        <div className="mt-8">
          <p className="text-sm">
            <span className="h-display text-xs">Colorway</span>
            <span className="ml-3 text-ink/85" aria-live="polite">
              {colorway.name}
              {!available && " — coming in drop 2"}
            </span>
          </p>
          <div className="mt-3">
            <Swatches colorways={drop1} selected={colorId} onSelect={pickColor} name={product.name} />
          </div>
          {later.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-ink/65">Coming in drop 2</p>
              <div className="mt-2">
                <Swatches colorways={later} selected={colorId} onSelect={pickColor} size="sm" name={`${product.name} drop 2`} />
              </div>
            </div>
          )}
        </div>

        {available ? (
          <>
            <fieldset id="size-picker" className="mt-8">
              <legend className="flex w-full items-baseline justify-between">
                <span className="h-display text-xs">Size</span>
                <Link href="/size-guide" className="link text-sm">
                  Size guide
                </Link>
              </legend>
              {(Object.keys(SIZES) as SizeGroup[]).map((group) => (
                <div key={group} className="mt-3">
                  <p className="mb-2 text-xs text-ink/65">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {SIZES[group].map((s) => {
                      const value = `${group} ${s}`;
                      const active = size === value;
                      return (
                        <label
                          key={value}
                          className={`grid h-11 min-w-12 cursor-pointer place-items-center rounded-[3px] border-2 px-3 text-sm font-semibold transition-colors has-focus-visible:outline-3 has-focus-visible:outline-offset-2 has-focus-visible:outline-navy ${
                            active ? "border-ink bg-ink text-bone" : "border-ink/30 hover:border-ink"
                          }`}
                        >
                          <input
                            type="radio"
                            name="size"
                            value={value}
                            checked={active}
                            onChange={() => {
                              setSize(value);
                              setNeedSize(false);
                            }}
                            className="sr-only"
                            aria-label={value}
                          />
                          {s}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
              {needSize && (
                <p role="alert" className="mt-3 text-sm font-semibold text-red-deep">
                  Pick a size first.
                </p>
              )}
            </fieldset>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <QtyStepper qty={qty} onChange={setQty} label="Quantity" />
              <button type="button" onClick={add} disabled={closed} className="btn btn-red min-w-56 flex-1">
                {closed ? "Preorders closed" : `Preorder now — $${product.price * qty}`}
              </button>
            </div>
            <p className="mt-4 rounded-[3px] border-l-4 border-gold bg-bone-deep px-4 py-3 text-sm leading-relaxed">
              <strong>This is a preorder.</strong> You&rsquo;ll be charged today; your order ships by {site.preorder.shipsBy}.
            </p>
          </>
        ) : (
          <div className="mt-8 rounded-[3px] border-l-4 border-gold bg-bone-deep px-4 py-4">
            <p className="font-semibold">{colorway.name} is coming in drop 2.</p>
            <p className="mt-1 text-sm text-ink/80">Join the list and you&rsquo;ll get first dibs when it opens.</p>
            <Link href="/#signup" className="btn btn-outline mt-4">
              Get first dibs
            </Link>
          </div>
        )}

        <div className="mt-10 border-t-2 border-ink/15">
          <Accordion title="Fabric and fit" open>
            <ul className="list-disc space-y-1.5 pl-5">
              {[...product.fabric, ...product.fit].map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </Accordion>
          <Accordion title="Size guide">
            <p className="mb-4">Measured flat, in inches. Chest width is pit to pit; body length is shoulder to hem.</p>
            <SizeChartTable garment={product.garment} compact />
          </Accordion>
          <Accordion title="Preorder FAQ">
            <dl className="space-y-4">
              {preorderFaq.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-1">{f.a}</dd>
                </div>
              ))}
            </dl>
            <Link href="/faq" className="link mt-4 inline-block">
              Read the full FAQ
            </Link>
          </Accordion>
        </div>
      </div>
    </div>
  );
}
