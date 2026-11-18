/**
 * Gets a support chat reply. Uses the AI proxy (support-api/, deployed
 * separately) when NEXT_PUBLIC_SUPPORT_API_URL is set; if it's unset, slow
 * (timeout) or fails, falls back to the local matcher in lib/support.ts,
 * which itself hands off to email when it doesn't know.
 */
import { site } from "@/data/site";
import { answer, type BotReply } from "@/lib/support";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ClientReply = BotReply & { source: "ai" | "local" };

export const SUPPORT_API_URL = process.env.NEXT_PUBLIC_SUPPORT_API_URL ?? "";
export const AI_TIMEOUT_MS = 15000;
const MAX_TURNS = 12;
const MAX_CHARS = 1000;

type Options = { endpoint?: string; fetchImpl?: typeof fetch; timeoutMs?: number };

export async function getReply(history: ChatTurn[], question: string, opts: Options = {}): Promise<ClientReply> {
  const endpoint = opts.endpoint ?? SUPPORT_API_URL;
  const local = (): ClientReply => ({ ...answer(question), source: "local" });
  if (!endpoint) return local();

  const messages = [...history, { role: "user" as const, content: question }]
    .map((m) => ({ role: m.role, content: m.content.slice(0, MAX_CHARS) }))
    .slice(-MAX_TURNS);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? AI_TIMEOUT_MS);
  try {
    const res = await (opts.fetchImpl ?? fetch)(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages }),
      signal: ctrl.signal,
    });
    if (!res.ok) return local();
    const data = (await res.json()) as { reply?: unknown };
    const reply = typeof data.reply === "string" ? data.reply.trim() : "";
    if (!reply) return local();
    return { text: reply, handoff: reply.includes(site.contactEmail), kind: "answer", source: "ai" };
  } catch {
    return local();
  } finally {
    clearTimeout(timer);
  }
}
