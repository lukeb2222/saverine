import type { MetadataRoute } from "next";
import { products } from "@/data/products";
import { site } from "@/data/site";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["", "/faq", "/size-guide", "/contact", ...products.map((p) => `/products/${p.slug}`)].map((path) => ({
    url: `${site.url}${path}`,
  }));
}
