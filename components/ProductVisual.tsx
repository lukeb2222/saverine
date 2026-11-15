import Image from "next/image";
import { site } from "@/data/site";
import type { Colorway, Product } from "@/data/products";
import { Mockup, type MockupView } from "./Mockup";

/** One of a colorway's photos (by index), or a tinted SVG mockup when it has none. */
export function ProductVisual({
  product,
  colorway,
  index = 0,
  mockupView = "front",
  sizes = "(min-width: 1024px) 40vw, 100vw",
  eager = false,
}: {
  product: Product;
  colorway: Colorway;
  index?: number;
  mockupView?: MockupView;
  sizes?: string;
  eager?: boolean;
}) {
  const image = colorway.images?.[index] ?? colorway.images?.[0];
  if (image) {
    return (
      <Image
        src={`${site.basePath}${image.src}`}
        alt={image.alt}
        width={image.width}
        height={image.height}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="h-full w-full object-cover object-[50%_30%]"
      />
    );
  }
  return (
    <Mockup
      garment={product.garment}
      hex={colorway.hex}
      view={mockupView}
      label={`${product.name} in ${colorway.name} (illustrated mockup)`}
      className="h-full w-full"
    />
  );
}
