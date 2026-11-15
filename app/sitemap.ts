import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";

export const dynamic = "force-static";

/** Every indexable page, with the trailing slash the live URLs use. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { path: "/", priority: 1 },
    ...products.map((p) => ({ path: `/products/${p.slug}/`, priority: 0.9 })),
    { path: "/size-guide/", priority: 0.5 },
    { path: "/faq/", priority: 0.5 },
    { path: "/contact/", priority: 0.3 },
  ].map(({ path, priority }) => ({ url: `${site.url}${path}`, lastModified, priority }));
}
