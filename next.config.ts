import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 builds plain HTML for GitHub Pages (see
 * .github/workflows/pages.yml). Without it this is a normal Next.js app,
 * which is what hosts like Netlify or Vercel want.
 */
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(staticExport
    ? { output: "export" as const, trailingSlash: true, basePath, images: { unoptimized: true } }
    : {}),
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
