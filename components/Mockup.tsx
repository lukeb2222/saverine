import { useId } from "react";
import { BRAND, BackPrintG, WordmarkG, fontStyles } from "./brand";
import type { Garment } from "@/data/products";

export type MockupView = "front" | "back" | "detail";

function rgb(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function shade(hex: string, amt: number) {
  // amt < 0 darkens, > 0 lightens
  const target = amt < 0 ? 0 : 255;
  const t = Math.abs(amt);
  return `rgb(${rgb(hex)
    .map((c) => Math.round(c + (target - c) * t))
    .join(" ")})`;
}
function isLight(hex: string) {
  const [r, g, b] = rgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.55;
}

/** Print inks chosen so the artwork reads on every colorway. */
function inks(hex: string) {
  const light = isLight(hex);
  const ink = light ? BRAND.ink : "#EFE8D8";
  const isRed = hex.toUpperCase() === BRAND.red.toUpperCase();
  const isGold = hex.toUpperCase() === BRAND.gold.toUpperCase();
  return {
    ink,
    slash: isRed ? BRAND.gold : BRAND.red,
    sun: isGold || light ? BRAND.red : BRAND.gold,
  };
}

const TEE =
  "M232 92 L150 114 Q138 118 130 128 L46 208 L104 264 L150 228 L150 516 Q300 530 450 516 L450 228 L496 264 L554 208 L470 128 Q462 118 450 114 L368 92 Q300 136 232 92 Z";
const HOODIE =
  "M216 120 L146 140 Q100 158 86 232 L50 468 L112 484 L152 296 L152 540 L448 540 L448 296 L488 484 L550 468 L514 232 Q500 158 454 140 L384 120 Q300 168 216 120 Z";
const HOOD = "M216 122 Q200 38 300 32 Q400 38 384 122 Q300 172 216 122 Z";

/**
 * Flat-lay garment mockup, tinted to any colorway.
 * Stands in for product photography until real photos exist.
 */
export function Mockup({
  garment,
  hex,
  view = "front",
  className,
  label,
}: {
  garment: Garment;
  hex: string;
  view?: MockupView;
  className?: string;
  label: string;
}) {
  const id = useId();
  const { ink, slash, sun } = inks(hex);
  const seam = shade(hex, isLight(hex) ? -0.22 : -0.35);
  const hi = shade(hex, 0.12);
  const lo = shade(hex, -0.16);
  const back = garment === "hoodie" && view !== "front";
  const body = garment === "tee" ? TEE : HOODIE;
  const viewBox =
    view !== "detail" ? "0 0 600 600" : garment === "tee" ? "165 150 270 270" : "150 185 300 300";

  return (
    <svg viewBox={viewBox} className={className} role="img" aria-label={label} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`${id}-g`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={hi} />
          <stop offset="0.55" stopColor={hex} />
          <stop offset="1" stopColor={lo} />
        </linearGradient>
        {/* garment-dye mottling */}
        <filter id={`${id}-dye`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="3" seed="4" />
          <feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -1.6 0.95" />
        </filter>
        <filter id={`${id}-shadow`} x="-10%" y="-10%" width="120%" height="125%">
          <feDropShadow dx="0" dy="10" stdDeviation="12" floodColor="#23211F" floodOpacity="0.22" />
        </filter>
        <clipPath id={`${id}-clip`}>
          <path d={body} />
          {garment === "hoodie" && <path d={HOOD} />}
        </clipPath>
      </defs>

      <g filter={`url(#${id}-shadow)`}>
        <path d={body} fill={`url(#${id}-g)`} stroke={seam} strokeWidth="1.5" strokeLinejoin="round" />
        {garment === "hoodie" && <path d={HOOD} fill={`url(#${id}-g)`} stroke={seam} strokeWidth="1.5" />}
      </g>
      <rect x="0" y="0" width="600" height="600" filter={`url(#${id}-dye)`} clipPath={`url(#${id}-clip)`} opacity={isLight(hex) ? 0.07 : 0.2} />

      <g fill="none" stroke={seam} strokeWidth="1.5" strokeLinecap="round">
        {garment === "tee" ? (
          <>
            {/* collar rib, sleeve + hem stitching, soft folds */}
            <path d="M232 92 Q300 136 368 92" strokeWidth="2" />
            <path d="M224 96 Q300 150 376 96" />
            <path d="M232 92 Q300 108 368 92" opacity="0.6" />
            <path d="M150 228 L150 150" opacity="0.5" />
            <path d="M450 228 L450 150" opacity="0.5" />
            <path d="M56 199 L113 255" strokeDasharray="3 4" opacity="0.7" />
            <path d="M544 199 L487 255" strokeDasharray="3 4" opacity="0.7" />
            <path d="M151 505 Q300 519 449 505" strokeDasharray="3 4" opacity="0.7" />
            <path d="M190 300 Q210 400 196 500" opacity="0.25" />
            <path d="M408 280 Q396 390 412 498" opacity="0.25" />
          </>
        ) : (
          <>
            {/* cuffs + hem rib */}
            <path d="M152 512 L448 512" />
            <path d="M56 440 L118 456" />
            <path d="M544 440 L482 456" />
            <path d="M152 296 L152 200" opacity="0.5" />
            <path d="M448 296 L448 200" opacity="0.5" />
            {Array.from({ length: 24 }, (_, i) => (
              <path key={i} d={`M${164 + i * 12} 516 v20`} opacity="0.35" />
            ))}
            {back ? (
              <>
                <path d="M300 34 L300 150" opacity="0.6" />
                <path d="M216 122 Q300 172 384 122" strokeWidth="2" />
              </>
            ) : (
              <>
                <path d="M240 120 Q238 66 300 60 Q362 66 360 120 Q300 160 240 120 Z" fill={shade(hex, -0.3)} />
                <path d="M216 122 Q300 172 384 122" strokeWidth="2" />
                {/* drawcords */}
                <path d="M276 150 Q272 190 278 226" stroke={shade(hex, 0.25)} strokeWidth="3" />
                <path d="M324 150 Q330 188 322 220" stroke={shade(hex, 0.25)} strokeWidth="3" />
                {/* kangaroo pocket */}
                <path d="M218 400 L382 400 L408 500 L192 500 Z" />
                <path d="M224 408 L200 494" strokeDasharray="3 4" opacity="0.7" />
                <path d="M376 408 L400 494" strokeDasharray="3 4" opacity="0.7" />
              </>
            )}
          </>
        )}
      </g>

      {/* artwork */}
      {garment === "tee" && (
        <g opacity="0.94">
          <WordmarkG ink={ink} slash={slash} transform="translate(196 196) scale(0.4)" />
          <text
            x="300"
            y="276"
            textAnchor="middle"
            fontSize="8.5"
            letterSpacing="2.6"
            fontWeight="600"
            fill={ink}
            style={fontStyles.BODY}
          >
            GOOD DAYS ONLY — EST. 2026
          </text>
        </g>
      )}
      {garment === "hoodie" && !back && (
        <WordmarkG ink={ink} slash={slash} transform="translate(338 236) scale(0.17)" />
      )}
      {garment === "hoodie" && back && (
        <g opacity="0.94">
          <BackPrintG ink={ink} sun={sun} slash={slash} transform="translate(180 196) scale(0.8)" />
        </g>
      )}
    </svg>
  );
}
