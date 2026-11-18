/**
 * Fallback path of the support chat client (lib/supportClient.ts):
 * AI proxy -> local matcher -> email handoff.
 */
import { getReply, type ChatTurn } from "@/lib/supportClient";
import { site } from "@/data/site";

let pass = 0;
const fails: string[] = [];
async function check(name: string, fn: () => Promise<boolean | string>) {
  try {
    const r = await fn();
    if (r === true) pass++;
    else fails.push(`✗ ${name}${typeof r === "string" ? `: ${r}` : ""}`);
  } catch (e) {
    fails.push(`✗ ${name}: threw ${e}`);
  }
}
const json = (status: number, body: unknown) =>
  (async () => new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } })) as unknown as typeof fetch;
const EP = "https://support.example/api/chat";

await check("no endpoint -> local matcher", async () => {
  const r = await getReply([], "What is Saverine?", { endpoint: "" });
  return r.source === "local" && r.kind === "answer" && /good days/i.test(r.text);
});
await check("AI success -> AI reply", async () => {
  const r = await getReply([], "hi", { endpoint: EP, fetchImpl: json(200, { reply: "Hey from Grok" }) });
  return r.source === "ai" && r.text === "Hey from Grok" && !r.handoff;
});
await check("AI reply mentioning the contact email -> email handoff", async () => {
  const r = await getReply([], "who founded it", { endpoint: EP, fetchImpl: json(200, { reply: `I don't know, email ${site.contactEmail}` }) });
  return r.source === "ai" && r.handoff === true;
});
await check("sends history + question, capped at 12 turns and 1000 chars", async () => {
  let sent: { messages: ChatTurn[] } | null = null;
  const f = (async (_u: string, init: RequestInit) => {
    sent = JSON.parse(String(init.body));
    return new Response(JSON.stringify({ reply: "ok" }), { status: 200 });
  }) as unknown as typeof fetch;
  const history: ChatTurn[] = Array.from({ length: 20 }, (_, i) => ({ role: i % 2 ? "assistant" : "user", content: "y".repeat(1500) }));
  await getReply(history, "what colors does that come in?", { endpoint: EP, fetchImpl: f });
  const m = sent!.messages;
  return m.length === 12 && m[m.length - 1].content === "what colors does that come in?" && m.every((x) => x.content.length <= 1000) ? true : `got ${m.length}`;
});
await check("HTTP 500 -> local matcher", async () => {
  const r = await getReply([], "How much is the hoodie?", { endpoint: EP, fetchImpl: json(500, { error: "x" }) });
  return r.source === "local" && /\$88|\$\d+/.test(r.text);
});
await check("HTTP 429 -> local matcher", async () => {
  const r = await getReply([], "Can I get a refund?", { endpoint: EP, fetchImpl: json(429, { error: "slow down" }) });
  return r.source === "local" && /refund/i.test(r.text);
});
await check("network error -> local matcher", async () => {
  const f = (async () => {
    throw new TypeError("Failed to fetch");
  }) as unknown as typeof fetch;
  const r = await getReply([], "When will my order ship?", { endpoint: EP, fetchImpl: f });
  return r.source === "local" && new RegExp(site.preorder.shipsBy).test(r.text);
});
await check("empty / malformed AI reply -> local matcher", async () => {
  const r = await getReply([], "How does the sizing run?", { endpoint: EP, fetchImpl: json(200, { nope: true }) });
  return r.source === "local" && r.kind === "answer";
});
await check("timeout -> local matcher", async () => {
  const hang = ((_u: string, init: RequestInit) =>
    new Promise((_r, reject) => init.signal?.addEventListener("abort", () => reject(new DOMException("aborted", "AbortError"))))) as unknown as typeof fetch;
  const t = Date.now();
  const r = await getReply([], "Do you ship to Canada?", { endpoint: EP, fetchImpl: hang, timeoutMs: 50 });
  return r.source === "local" && Date.now() - t < 2000 && /United States/.test(r.text);
});
await check("AI down + unknown question -> email handoff", async () => {
  const r = await getReply([], "do you have a discount code", { endpoint: EP, fetchImpl: json(503, {}) });
  return r.source === "local" && r.kind === "fallback" && r.handoff === true && r.text.includes(site.contactEmail);
});

console.log(fails.join("\n"));
console.log(`\nsupport client: ${pass}/${pass + fails.length} passed`);
process.exit(fails.length ? 1 : 0);
