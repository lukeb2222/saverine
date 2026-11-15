"use client";

import type { Colorway } from "@/data/products";

export function Swatches({
  colorways,
  selected,
  onSelect,
  onPreview,
  size = "md",
  name,
}: {
  colorways: Colorway[];
  selected: string;
  onSelect: (id: string) => void;
  /** Called on hover/focus (id) and when the pointer leaves (null). */
  onPreview?: (id: string | null) => void;
  size?: "sm" | "md";
  name: string;
}) {
  const dim = size === "sm" ? "h-7 w-7" : "h-9 w-9";
  return (
    <div role="radiogroup" aria-label={`${name} colorway`} className="flex flex-wrap gap-2" onMouseLeave={() => onPreview?.(null)}>
      {colorways.map((c) => {
        const active = c.id === selected;
        return (
          <button
            key={c.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={c.name}
            title={c.name}
            onClick={() => onSelect(c.id)}
            onMouseEnter={() => onPreview?.(c.id)}
            onFocus={() => onPreview?.(c.id)}
            onBlur={() => onPreview?.(null)}
            className={`${dim} cursor-pointer rounded-full border border-ink/30 transition-shadow ${
              active ? "ring-2 ring-ink ring-offset-2 ring-offset-bone" : "hover:ring-2 hover:ring-ink/40 hover:ring-offset-2 hover:ring-offset-bone"
            }`}
            style={{ backgroundColor: c.hex }}
          />
        );
      })}
    </div>
  );
}
