import { systemPrompt } from "./prompt.js";

export const LIMITS = {
  maxBodyBytes: 32 * 1024,
  maxMessages: 12,
  maxMessageChars: 1000,
  rateWindowMs: 5 * 60 * 1000,
  rateMax: 30,
  timeoutMs: 20000,
};

export const ALLOWED_ORIGINS = new Set(["https://saverine.shop", "https://lukeb2222.github.io", "http://localhost:3000"]);

const XAI_URL = "https://api.x.ai/v1/chat/completions";
/**
 * grok-4.20-0309-non-reasoning: answers in ~0.5-1s (no reasoning step), $1.25 / $2.50 per 1M tokens,
 * and followed the "facts only / offer an alternative / decline off-topic" rules best in testing.
 * Override with XAI_MODEL (e.g. "grok-4.7" for higher quality at ~3-6s and higher cost).
 */
export const MODEL = process.env.XAI_MODEL || "grok-4.20-0309-non-reasoning";
/** Optional, for reasoning models that accept it (e.g. grok-4.3: none/low/medium/high). */
const REASONING_EFFORT = process.env.XAI_REASONING_EFFORT || "";

/** Validate and trim the conversation. Returns { messages } or { error }. */
export function sanitizeMessages(input) {
  if (!input || !Array.isArray(input.messages)) return { error: "Expected { messages: [...] }" };
  const cleaned = input.messages
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && typeof m.content === "string")
    .map((m) => ({ role: m.role, content: m.content.trim().slice(0, LIMITS.maxMessageChars) }))
    .filter((m) => m.content)
    .slice(-LIMITS.maxMessages);
  while (cleaned.length && cleaned[0].role !== "user") cleaned.shift();
  if (!cleaned.length || cleaned[cleaned.length - 1].role !== "user") return { error: "The last message must be from the user" };
  return { messages: cleaned };
}

/** Tiny in-memory sliding-window limiter. Per serverless instance, so it's a speed bump, not a wall. */
const hits = new Map();
export function rateLimited(ip, now = Date.now()) {
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < LIMITS.rateWindowMs);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v[v.length - 1] > LIMITS.rateWindowMs) hits.delete(k);
  return recent.length > LIMITS.rateMax;
}

/** Call xAI chat completions and return the reply text. */
export async function askGrok(messages, { apiKey = process.env.XAI_API_KEY, fetchImpl = fetch } = {}) {
  if (!apiKey) throw Object.assign(new Error("XAI_API_KEY is not set"), { status: 500 });
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LIMITS.timeoutMs);
  try {
    const res = await fetchImpl(XAI_URL, {
      method: "POST",
      signal: ctrl.signal,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "system", content: systemPrompt() }, ...messages],
        temperature: 0.3,
        max_tokens: 400,
        ...(REASONING_EFFORT ? { reasoning_effort: REASONING_EFFORT } : {}),
      }),
    });
    if (!res.ok) {
      // Log status only; never log headers or the request (they carry the key).
      console.error(`xAI error ${res.status}`);
      throw Object.assign(new Error("Upstream error"), { status: 502 });
    }
    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content?.trim();
    if (!reply) throw Object.assign(new Error("Empty reply"), { status: 502 });
    return reply;
  } finally {
    clearTimeout(timer);
  }
}
