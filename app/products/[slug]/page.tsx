import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getProduct, isAvailable, products } from "@/data/products";
import { site } from "@/data/site";
import { ProductDetail } from "@/components/ProductDetail";
import { ProductDetailFromUrl } from "@/components/ProductDetailFromUrl";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const product = getProduct((await params).slug);
  if (!product) return {};
  return {
    title: `${product.name} — Preorder`,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const photo = product.colorways.find((c) => c.photo)?.photo;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    ...(photo ? { image: `${site.url}${photo.src}` } : {}),
    color: product.colorways.filter(isAvailable).map((c) => c.name).join(", "),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${site.url}/products/${product.slug}`,
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Suspense fallback={<ProductDetail product={product} />}>
        <ProductDetailFromUrl product={product} />
      </Suspense>
    </>
  );
}
