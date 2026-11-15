import type { Metadata } from "next";
import Link from "next/link";
import { products } from "@/data/products";
import { SizeChartTable } from "@/components/SizeChartTable";

export const metadata: Metadata = {
  title: "Size guide",
  description: "Youth and Adult size charts for the Good Days Tee and City to Coast Hoodie, in inches.",
  alternates: { canonical: "/size-guide/" },
};

export default function SizeGuidePage() {
  return (
    <div className="container-x max-w-4xl py-10 md:py-16">
      <p className="eyebrow text-red">Help</p>
      <h1 className="h-display mt-2 text-4xl md:text-5xl">Size guide</h1>
      <p className="mt-4 max-w-2xl text-lg text-ink/80">
        Everything is cut oversized and boxy. Take your usual size for the roomy fit, or size down for something closer.
      </p>

      <div className="mt-8 rounded-[3px] bg-bone-deep p-5">
        <h2 className="h-display text-sm">How to measure</h2>
        <p className="mt-2 text-[0.95rem] leading-relaxed">
          Lay a tee or hoodie you already love flat. <strong>Chest width</strong> is straight across, armpit to armpit.{" "}
          <strong>Body length</strong> is from the highest point of the shoulder down to the hem. Match those numbers to
          the chart. All measurements are in inches and can vary by about half an inch.
        </p>
      </div>

      {products.map((p) => (
        <section key={p.slug} className="mt-12">
          <h2 className="h-display border-b-2 border-ink pb-3 text-2xl">{p.name}</h2>
          <div className="mt-6">
            <SizeChartTable garment={p.garment} />
          </div>
          <Link href={`/products/${p.slug}`} className="link mt-5 inline-block">
            Shop the {p.name}
          </Link>
        </section>
      ))}

      <p className="mt-12 text-ink/80">
        Between sizes, or buying for someone still growing? Youth S–XL fits roughly ages 8–14. When in doubt, go up.
      </p>
    </div>
  );
}
