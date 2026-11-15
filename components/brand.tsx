import { useId } from "react";

export const BRAND = {
  bone: "#ECE4D3",
  ink: "#23211F",
  red: "#B8483A",
  navy: "#2E3B52",
  olive: "#7A7A55",
  gold: "#D6A84A",
};

const MARKER = { fontFamily: "var(--font-permanent-marker), 'Permanent Marker', cursive" };
const DISPLAY = { fontFamily: "var(--font-archivo-black), 'Archivo Black', sans-serif" };
const BODY = { fontFamily: "var(--font-dm-sans), 'DM Sans', sans-serif" };

/**
 * The wordmark drawn inside a 520 × 150 box. Use inside any <svg>;
 * position and scale it with `transform`.
 */
export function WordmarkG({
  ink = "currentColor",
  slash = BRAND.red,
  transform,
}: {
  ink?: string;
  slash?: string;
  transform?: string;
}) {
  return (
    <g transform={transform}>
      <g transform="rotate(-3 260 75)">
        <text
          x="260"
          y="98"
          textAnchor="middle"
          fontSize="98"
          textLength="468"
          lengthAdjust="spacingAndGlyphs"
          fill={ink}
          style={MARKER}
        >
          SAVERINE
        </text>
        {/* sun-bleached red underline slash, drawn like a dry marker stroke */}
        <path
          d="M58 124 C 62 119, 70 118, 84 117 C 190 111, 330 108, 462 104 C 470 103.6, 478 104.4, 480 107 C 481 110, 474 112.4, 466 113 C 340 117.5, 200 122, 92 128.6 C 80 129.4, 66 131.5, 60 129.6 C 56.5 128.4, 56 126, 58 124 Z"
          fill={slash}
          className="wm-slash"
        />
        <path d="M96 121.6 C 200 116, 320 113.4, 440 109.6" stroke={ink} strokeOpacity="0.12" strokeWidth="1" fill="none" className="wm-slash" />
      </g>
    </g>
  );
}

/** Standalone inline-SVG wordmark. Colour follows `currentColor` unless `ink` is set. */
export function Wordmark({
  className,
  ink,
  slash,
  title = "Saverine",
}: {
  className?: string;
  ink?: string;
  slash?: string;
  title?: string;
}) {
  return (
    <svg viewBox="20 8 480 134" className={className} role="img" aria-label={title} overflow="visible">
      <WordmarkG ink={ink} slash={slash} />
    </svg>
  );
}

/** Striped setting sun + palm, drawn in a 200 × 170 box (ground line at y = 150). */
export function PalmSunsetG({
  ink,
  sun,
  transform,
  mountain = false,
}: {
  ink: string;
  sun: string;
  transform?: string;
  mountain?: boolean;
}) {
  const id = useId();
  return (
    <g transform={transform}>
      <clipPath id={`${id}-sun`}>
        <circle cx="108" cy="92" r="62" />
      </clipPath>
      <g clipPath={`url(#${id}-sun)`} fill={sun}>
        <rect x="40" y="26" width="140" height="70" />
        <rect x="40" y="101" width="140" height="10" />
        <rect x="40" y="117" width="140" height="8" />
        <rect x="40" y="131" width="140" height="6" />
        <rect x="40" y="143" width="140" height="4" />
      </g>
      {mountain && (
        <path d="M112 150 L150 96 L162 110 L172 100 L200 150 Z" fill={ink} />
      )}
      {/* palm */}
      <g stroke={ink} fill="none" strokeLinecap="round">
        <path d="M58 152 C 60 118, 66 84, 82 52" strokeWidth="6.5" />
        <g strokeWidth="5.5">
          <path d="M82 52 Q 56 34 28 50" />
          <path d="M82 52 Q 58 50 40 78" />
          <path d="M82 52 Q 74 26 52 16" />
          <path d="M82 52 Q 96 24 122 20" />
          <path d="M82 52 Q 112 38 138 54" />
          <path d="M82 52 Q 108 54 122 82" />
        </g>
      </g>
      {/* waterline */}
      <path
        d="M6 153 q 12 -6 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0 t 24 0"
        stroke={ink}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />
    </g>
  );
}

/** "SAVERINE / City to Coast" back print, drawn in a 300 × 300 box. */
export function BackPrintG({
  ink,
  sun,
  slash = BRAND.red,
  transform,
}: {
  ink: string;
  sun: string;
  slash?: string;
  transform?: string;
}) {
  return (
    <g transform={transform}>
      <WordmarkG ink={ink} slash={slash} transform="translate(20 0) scale(0.5)" />
      <PalmSunsetG ink={ink} sun={sun} transform="translate(46 74) scale(1.04)" />
      <text
        x="150"
        y="276"
        textAnchor="middle"
        fontSize="19"
        letterSpacing="7"
        fill={ink}
        style={DISPLAY}
      >
        CITY TO COAST
      </text>
    </g>
  );
}

export function BackPrint({ className, ink = BRAND.ink, sun = BRAND.gold }: { className?: string; ink?: string; sun?: string }) {
  return (
    <svg viewBox="0 0 300 300" className={className} role="img" aria-label="Saverine — City to Coast palm and sunset print">
      <BackPrintG ink={ink} sun={sun} />
    </svg>
  );
}

/** Round palm-and-sunset badge: "City · Coast · Mountain". */
export function Badge({
  className,
  ink = "currentColor",
  sun = BRAND.gold,
}: {
  className?: string;
  ink?: string;
  sun?: string;
}) {
  const id = useId();
  return (
    <svg viewBox="0 0 240 240" className={className} role="img" aria-label="Saverine badge: City, Coast, Mountain">
      <defs>
        <path id={`${id}-top`} d="M 34 120 A 86 86 0 0 1 206 120" />
        <path id={`${id}-bot`} d="M 22 120 A 98 98 0 0 0 218 120" />
      </defs>
      <circle cx="120" cy="120" r="114" fill="none" stroke={ink} strokeWidth="4" />
      <circle cx="120" cy="120" r="72" fill="none" stroke={ink} strokeWidth="2" />
      <g className="badge-spin">
      <text fontSize="14" letterSpacing="2" fill={ink} style={DISPLAY}>
        <textPath href={`#${id}-top`} startOffset="50%" textAnchor="middle">
          CITY · COAST · MOUNTAIN
        </textPath>
      </text>
      <text fontSize="12.5" letterSpacing="4.5" fill={ink} style={DISPLAY}>
        <textPath href={`#${id}-bot`} startOffset="50%" textAnchor="middle">
          GOOD DAYS ONLY
        </textPath>
      </text>
      </g>
      <clipPath id={`${id}-clip`}>
        <circle cx="120" cy="120" r="70" />
      </clipPath>
      <g clipPath={`url(#${id}-clip)`}>
        <PalmSunsetG ink={ink} sun={sun} mountain transform="translate(42 50) scale(0.76)" />
      </g>
    </svg>
  );
}

export const fontStyles = { MARKER, DISPLAY, BODY };
