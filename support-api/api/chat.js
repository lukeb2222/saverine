/**
 * POST /api/chat  { messages: [{ role: "user" | "assistant", content: string }] }  ->  { reply }
 *
 * Proxy between the Saverine support chat (static site) and xAI. The API key
 * lives only in this function's environment (XAI_API_KEY).
 */
import { ALLOWED_ORIGINS, LIMITS, askGrok, rateLimited, sanitizeMessages } from "../lib/chat.js";

function cors(req, res) {
  const origin = req.headers.origin;
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Max-Age", "86400");
  }
  return !origin || ALLOWED_ORIGINS.has(origin);
}

async function readBody(req) {
  if (req.body !== undefined && req.body !== null && typeof req.body !== "string" && !Buffer.isBuffer(req.body)) return req.body;
  let raw = typeof req.body === "string" ? req.body : Buffer.isBuffer(req.body) ? req.body.toString("utf8") : "";
  if (!raw && typeof req.on === "function") {
    raw = await new Promise((resolve, reject) => {
      let data = "";
      req.on("data", (c) => {
        data += c;
        if (data.length > LIMITS.maxBodyBytes) reject(Object.assign(new Error("Too large"), { status: 413 }));
      });
      req.on("end", () => resolve(data));
      req.on("error", reject);
    });
  }
  if (raw.length > LIMITS.maxBodyBytes) throw Object.assign(new Error("Too large"), { status: 413 });
  try {
    return JSON.parse(raw || "null");
  } catch {
    throw Object.assign(new Error("Invalid JSON"), { status: 400 });
  }
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  const allowed = cors(req, res);
  if (req.method === "OPTIONS") return res.status(allowed ? 204 : 403).end();
  if (!allowed) return res.status(403).json({ error: "Origin not allowed" });
  if (req.method !== "POST") return res.status(405).json({ error: "Use POST" });

  const len = Number(req.headers["content-length"] ?? 0);
  if (len > LIMITS.maxBodyBytes) return res.status(413).json({ error: "Request too large" });

  const ip = String(req.headers["x-forwarded-for"] ?? req.socket?.remoteAddress ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) return res.status(429).json({ error: "Too many messages. Try again in a few minutes." });

  try {
    const body = await readBody(req);
    const { messages, error } = sanitizeMessages(body);
    if (error) return res.status(400).json({ error });
    const reply = await askGrok(messages);
    return res.status(200).json({ reply });
  } catch (e) {
    const status = e?.status ?? 500;
    if (status >= 500) console.error("chat failed:", e?.message);
    return res.status(status).json({ error: status === 413 ? "Request too large" : status === 400 ? "Bad request" : "Support chat is unavailable right now" });
  }
}
