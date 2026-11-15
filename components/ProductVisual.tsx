import Image from "next/image";
import type { Colorway, Product } from "@/data/products";
import { Mockup, type MockupView } from "./Mockup";

/** A colorway's real photo when it has one, otherwise a tinted SVG mockup. */
export function ProductVisual({
  product,
  colorway,
  view = "front",
  preferPhoto = true,
  sizes = "(min-width: 1024px) 40vw, 100vw",
  eager = false,
}: {
  product: Product;
  colorway: Colorway;
  view?: MockupView;
  preferPhoto?: boolean;
  sizes?: string;
  eager?: boolean;
}) {
  if (preferPhoto && colorway.photo && view === "front") {
    return (
      <Image
        src={colorway.photo.src}
        alt={colorway.photo.alt}
        width={colorway.photo.width}
        height={colorway.photo.height}
        sizes={sizes}
        loading={eager ? "eager" : "lazy"}
        className="h-full w-full object-cover object-[50%_30%]"
      />
    );
  }
  const viewLabel = view === "back" ? "back" : view === "detail" ? "print detail" : "front";
  return (
    <Mockup
      garment={product.garment}
      hex={colorway.hex}
      view={view}
      label={`${product.name} in ${colorway.name}, ${viewLabel} (illustrated mockup)`}
      className="h-full w-full"
    />
  );
}
