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
  const title = `${product.name} — Preorder`;
  const url = `/products/${product.slug}/`;
  const photos = product.colorways.find((c) => c.id === product.defaultColorway)?.images ?? [];
  return {
    title,
    description: product.description,
    alternates: { canonical: url },
    openGraph: {
      title: `${title} — ${site.name}`,
      description: product.description,
      url,
      siteName: site.name,
      type: "website",
      locale: "en_US",
      images: photos.slice(0, 1).map((p) => ({ url: `${site.url}${p.src}`, width: p.width, height: p.height, alt: p.alt })),
    },
  };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const product = getProduct((await params).slug);
  if (!product) notFound();

  const photos = product.colorways.filter(isAvailable).flatMap((c) => c.images ?? []);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    brand: { "@type": "Brand", name: site.name },
    ...(photos.length ? { image: photos.map((p) => `${site.url}${p.src}`) } : {}),
    color: product.colorways.filter(isAvailable).map((c) => c.name).join(", "),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: "USD",
      availability: "https://schema.org/PreOrder",
      url: `${site.url}/products/${product.slug}/`,
      itemCondition: "https://schema.org/NewCondition",
      seller: { "@type": "Organization", name: site.name },
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
