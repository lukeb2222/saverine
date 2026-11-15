/** Slow ticker strip. Decorative, so it is hidden from screen readers. */
export function Marquee({ items }: { items: string[] }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((t, i) => (
        <span key={i} className="flex items-center">
          <span className="h-display px-6 text-sm">{t}</span>
          <span className="text-gold">✺</span>
        </span>
      ))}
    </div>
  );
  return (
    <div aria-hidden className="marquee overflow-hidden bg-red py-3 text-paper">
      <div className="marquee-track">
        {row}
        {row}
        {row}
        {row}
      </div>
    </div>
  );
}
