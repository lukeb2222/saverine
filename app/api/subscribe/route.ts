import { NextResponse } from "next/server";

/**
 * Email signup. Forwards { email, source } as JSON to NEWSLETTER_WEBHOOK_URL
 * (Klaviyo, Mailchimp, Zapier, a Shopify Flow webhook — anything that accepts
 * a POST). Without that variable, signups are only accepted in development,
 * where they are logged to the terminal, so no real signup is silently lost.
 */
export async function POST(req: Request) {
  let body: { email?: unknown; company?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Bad request." }, { status: 400 });
  }

  // honeypot field: bots fill it, people don't
  if (typeof body.company === "string" && body.company.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That email doesn't look right. Mind checking it?" }, { status: 400 });
  }

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) {
    if (process.env.NODE_ENV !== "production") {
      console.log(`[signup] ${email} (not saved: set NEWSLETTER_WEBHOOK_URL)`);
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: "Signups aren't switched on yet. Check back soon." }, { status: 503 });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "saverine-website" }),
    });
    if (!res.ok) throw new Error(`webhook responded ${res.status}`);
  } catch (err) {
    console.error("[signup] failed", err);
    return NextResponse.json({ error: "We couldn't add you just now. Try again in a minute." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}
