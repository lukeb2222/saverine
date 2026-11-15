import type { ReactNode } from "react";

/** Native <details> accordion: works without JavaScript, keyboard accessible. */
export function Accordion({ title, children, open = false }: { title: string; children: ReactNode; open?: boolean }) {
  return (
    <details open={open} className="group border-b-2 border-ink/15">
      <summary className="flex items-center justify-between gap-4 py-4">
        <span className="h-display text-sm">{title}</span>
        <span aria-hidden className="acc-icon text-2xl leading-none text-red transition-transform">
          +
        </span>
      </summary>
      <div className="pb-5 text-[0.95rem] leading-relaxed text-ink/85">{children}</div>
    </details>
  );
}
