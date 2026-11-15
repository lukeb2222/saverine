import { BRAND } from "./brand";

/** Sun-faded illustrated tiles for "Wear it anywhere". Swap for photos any time. */
const common = {
  viewBox: "0 0 400 500",
  preserveAspectRatio: "xMidYMid slice",
  className: "h-full w-full",
  "aria-hidden": true,
} as const;

function Sun({ cx, cy, r, fill }: { cx: number; cy: number; r: number; fill: string }) {
  return <circle cx={cx} cy={cy} r={r} fill={fill} />;
}

export function CityScene() {
  const b: [number, number, number][] = [
    [0, 70, 250], [62, 54, 180], [112, 46, 290], [158, 76, 210], [226, 40, 150],
    [262, 64, 260], [318, 44, 200], [356, 60, 300],
  ];
  return (
    <svg {...common}>
      <rect width="400" height="500" fill="#D9BE8C" />
      <rect width="400" height="210" fill="#E3CFA6" />
      <Sun cx={250} cy={210} r={86} fill={BRAND.red} />
      {b.map(([x, w, h], i) => (
        <g key={i}>
          <rect x={x} y={420 - h} width={w} height={h} fill={i % 2 ? BRAND.navy : "#243042"} />
          {Array.from({ length: Math.floor(h / 34) }, (_, r) =>
            Array.from({ length: Math.floor(w / 16) }, (_, c) =>
              (r * 7 + c * 3 + i) % 3 === 0 ? (
                <rect key={`${r}-${c}`} x={x + 6 + c * 16} y={432 - h + r * 34} width="6" height="12" fill={BRAND.gold} opacity="0.85" />
              ) : null,
            ),
          )}
        </g>
      ))}
      <path d="M132 130 v-28 M128 110 h8" stroke="#243042" strokeWidth="3" />
      <rect y="420" width="400" height="80" fill={BRAND.ink} />
      <path d="M0 462 H400" stroke={BRAND.gold} strokeWidth="4" strokeDasharray="34 26" />
    </svg>
  );
}

export function CoastScene() {
  return (
    <svg {...common}>
      <rect width="400" height="500" fill="#EAD9B5" />
      <Sun cx={240} cy={268} r={104} fill={BRAND.gold} />
      <rect y="300" width="400" height="200" fill={BRAND.navy} />
      <g stroke="#EAD9B5" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85">
        <path d="M150 326 H330" />
        <path d="M110 350 H300" />
        <path d="M190 376 H370" opacity="0.6" />
        <path d="M-10 420 q 25 -14 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" />
        <path d="M-30 458 q 25 -14 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0" opacity="0.6" />
      </g>
      <g stroke={BRAND.ink} fill="none" strokeLinecap="round">
        <path d="M70 500 C 74 380, 86 260, 118 150" strokeWidth="13" />
        <g strokeWidth="11">
          <path d="M118 150 Q 66 112 14 146" />
          <path d="M118 150 Q 70 146 38 206" />
          <path d="M118 150 Q 100 94 54 76" />
          <path d="M118 150 Q 146 92 200 86" />
          <path d="M118 150 Q 178 120 232 154" />
          <path d="M118 150 Q 170 156 200 214" />
        </g>
      </g>
    </svg>
  );
}

export function MountainScene() {
  const pine = (x: number, y: number, s: number, k: number) => (
    <path
      key={k}
      d={`M${x} ${y} l${-16 * s} ${40 * s} h${10 * s} l${-14 * s} ${36 * s} h${12 * s} l${-16 * s} ${40 * s} h${48 * s} l${-16 * s} ${-40 * s} h${12 * s} l${-14 * s} ${-36 * s} h${10 * s} Z`}
      fill={k % 2 ? "#5E5E40" : BRAND.olive}
    />
  );
  return (
    <svg {...common}>
      <rect width="400" height="500" fill="#B9CAD4" />
      <Sun cx={306} cy={104} r={44} fill="#F1E7CF" />
      <path d="M-20 400 L120 150 L196 280 L262 190 L420 400 Z" fill={BRAND.navy} />
      <path d="M120 150 L84 214 L104 204 L118 226 L136 202 L156 218 Z" fill="#F1E7CF" />
      <path d="M262 190 L236 226 L252 220 L264 238 L278 222 L292 232 Z" fill="#F1E7CF" />
      <path d="M-20 440 L80 300 L170 440 Z" fill="#243042" />
      <rect y="400" width="400" height="100" fill="#F1E7CF" />
      {[[40, 330, 1.1], [112, 356, 0.9], [300, 322, 1.2], [364, 352, 0.95], [232, 372, 0.75]].map(([x, y, s], k) =>
        pine(x, y, s, k),
      )}
      <path d="M150 500 Q 200 440 190 404" stroke="#B9CAD4" strokeWidth="5" fill="none" strokeDasharray="2 10" strokeLinecap="round" />
    </svg>
  );
}
