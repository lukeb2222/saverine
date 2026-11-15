# Saverine

Preorder site for Saverine — *Good Days Only, Est. 2026*. Next.js (App Router) + Tailwind CSS.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Where to edit things

| What | File |
| --- | --- |
| Preorder close date, ship month, shipping, refund text, socials, contact email | `data/site.ts` |
| Products, prices, colorways, which drop a colorway is in, product photos | `data/products.ts` |
| Size charts (inches) | `data/sizeGuide.ts` |
| FAQ copy | `data/faq.ts` |
| Wordmark, badge, back print (inline SVG) | `components/brand.tsx` |
| Tee / hoodie mockups | `components/Mockup.tsx` |

**Real photos:** put the file in `public/images/` and set `photo` on that colorway in `data/products.ts`. The SVG mockup is replaced automatically.

**Drop 2 colorways:** colorways with `drop: 2` show as "coming in drop 2" and can't be added to the cart. Remove the flag (or raise `CURRENT_DROP`) to open them.

## Not connected yet

- **Checkout** shows "coming soon". The cart works and is saved in the browser. Shopify plugs in at `lib/checkout.ts` — the steps are written at the top of that file.
- **Email signup** posts to `NEWSLETTER_WEBHOOK_URL` (see `.env.example`). Until that is set, signups are only accepted in `npm run dev` (logged to the terminal); the live site tells visitors signups aren't on yet rather than silently dropping them.
- **Instagram / TikTok** links in `data/site.ts` are placeholders.

## Deploy

**GitHub Pages (set up):** every push to `main` runs `.github/workflows/pages.yml`, which builds a static copy and publishes it. One-time step: repo Settings → Pages → Source → **GitHub Actions**. Static hosting has no server, so email signup needs a repository variable `SIGNUP_ENDPOINT` (Settings → Secrets and variables → Actions → Variables) holding a form/webhook URL that accepts a JSON POST from the browser.

**Netlify / Vercel:** import the repo; no config needed. These run the full app, including `/api/subscribe`. Set the variables from `.env.example`.
