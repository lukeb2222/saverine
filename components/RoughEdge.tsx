/**
 * A worn, torn-paper edge for section dividers. Place it at the top or bottom
 * of a section and give it the colour of the *neighbouring* section.
 */
function buildPath(seed: number) {
  let s = seed;
  const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
  let d = "M0 0 L0 9";
  for (let x = 0; x <= 1200; x += 6 + rnd() * 16) {
    d += ` L${x.toFixed(1)} ${(5 + rnd() * 9 + Math.sin(x / 90) * 2.5).toFixed(1)}`;
  }
  return d + " L1200 9 L1200 0 Z";
}

const PATHS = [buildPath(7), buildPath(41), buildPath(99)];

export function RoughEdge({
  color,
  position = "top",
  variant = 0,
}: {
  /** Tailwind text colour class of the neighbouring section, e.g. "text-bone". */
  color: string;
  position?: "top" | "bottom";
  variant?: 0 | 1 | 2;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 18"
      preserveAspectRatio="none"
      className={`pointer-events-none absolute left-0 z-10 block h-[14px] w-full ${color} ${
        position === "top" ? "-top-px" : "-bottom-px rotate-180"
      }`}
    >
      <path d={PATHS[variant]} fill="currentColor" />
    </svg>
  );
}
