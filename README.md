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
| Preorder close date, ship month, shipping, refund text, socials, contact email, homepage/about copy | `data/site.ts` |
| Products, prices, colorways, which drop a colorway is in, product photos | `data/products.ts` |
| Size charts (inches) | `data/sizeGuide.ts` |
| FAQ copy | `data/faq.ts` |
| Wordmark, badge, back print (inline SVG) | `components/brand.tsx` |
| Tee / hoodie mockups | `components/Mockup.tsx` |

**Real photos:** put the file in `public/images/` and set `photo` on that colorway in `data/products.ts`. The SVG mockup is replaced automatically.

**Drop 2 colorways:** colorways with `drop: 2` show as "coming in drop 2" and can't be added to the cart. Remove the flag (or raise `CURRENT_DROP`) to open them.

## Support chat

A **Help** button (bottom-right, every page) opens a support chat (`components/SupportChat.tsx`, answers in `lib/support.ts`). It runs entirely in the browser: answers are built at build time from `data/faq.ts`, `data/sizeGuide.ts`, `data/products.ts` and `data/site.ts`, so editing those files updates the chat too. When it isn't confident, or someone asks for a person or about a specific order, it offers a prefilled email to `contactEmail` (with the chat so far) and a link to `/contact`. Chat history is kept in `sessionStorage` only. Brand answers ("What is Saverine?") use the `about` block in `data/site.ts`, which is also the homepage copy. `npm run test:support` runs 100+ realistic shopper questions against the keyword matcher, the AI-to-local fallback tests and a check that the AI's knowledge file matches `data/`; add a case there when you add data the chat should know, and run `npm run support:knowledge` after editing anything in `data/`. **AI answers:** when the repository variable `SUPPORT_API_URL` is set, the chat sends the conversation to the AI proxy in `support-api/` (xAI Grok, deployed separately on Vercel, which holds the API key; see `support-api/README.md`). If that variable is unset, or the proxy fails or takes longer than 15 seconds, the chat answers with the built-in keyword matcher above, and that hands off to email when it doesn't know.

## Not connected yet

- **Checkout** shows "coming soon". The cart works and is saved in the browser. Shopify plugs in at `lib/checkout.ts` — the steps are written at the top of that file.
- **Email signup** posts to `NEWSLETTER_WEBHOOK_URL` (see `.env.example`). Until that is set, signups are only accepted in `npm run dev` (logged to the terminal); the live site tells visitors signups aren't on yet rather than silently dropping them.
- **Instagram / TikTok** links in `data/site.ts` are placeholders.

## Deploy

**GitHub Pages (set up):** every push to `main` runs `.github/workflows/pages.yml`, which builds a static copy and publishes it. One-time step: repo Settings → Pages → Source → **GitHub Actions**. Static hosting has no server, so email signup needs a repository variable `SIGNUP_ENDPOINT` (Settings → Secrets and variables → Actions → Variables) holding a form/webhook URL that accepts a JSON POST from the browser.

**Netlify / Vercel:** import the repo; no config needed. These run the full app, including `/api/subscribe`. Set the variables from `.env.example`.
