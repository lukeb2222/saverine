"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { site } from "@/data/site";
import { GREETING, SUGGESTED_QUESTIONS, supportMailto, type ChatLink } from "@/lib/support";
import { getReply, type ChatTurn } from "@/lib/supportClient";

type Msg = { id: number; from: "you" | "bot"; text: string; links?: ChatLink[]; handoff?: boolean; source?: "ai" | "local" };

/** Chat history lives in sessionStorage only: it's gone when the tab closes. */
const KEY = "saverine-support-v1";

function loadHistory(): Msg[] {
  try {
    const raw = JSON.parse(window.sessionStorage.getItem(KEY) ?? "[]");
    return Array.isArray(raw) ? (raw as Msg[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(msgs: Msg[]) {
  try {
    window.sessionStorage.setItem(KEY, JSON.stringify(msgs.slice(-60)));
  } catch {}
}

export function SupportChat() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[] | null>(null);
  const [draft, setDraft] = useState("");
  const [pending, setPending] = useState(false);
  const panelId = useId();
  const titleId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  const history = msgs ?? [];

  // Focus the input when the panel opens; give focus back to the button when it closes.
  useEffect(() => {
    if (open) inputRef.current?.focus();
    else if (wasOpen.current) launcherRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  // Keep the newest message in view.
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, open, pending]);

  const toggle = () => {
    if (!open && msgs === null) setMsgs(loadHistory());
    setOpen((o) => !o);
  };
  const close = () => setOpen(false);

  const ask = async (question: string) => {
    const q = question.trim().slice(0, 1000);
    if (!q || pending) return;
    const before = history;
    const base = before.length ? before[before.length - 1].id + 1 : 1;
    const withQuestion: Msg[] = [...before, { id: base, from: "you", text: q }];
    setMsgs(withQuestion);
    saveHistory(withQuestion);
    setDraft("");
    setPending(true);
    inputRef.current?.focus();
    // Earlier turns go along so the AI can follow up ("what colors does that come in?").
    const turns: ChatTurn[] = before.map((m) => ({ role: m.from === "you" ? "user" : "assistant", content: m.text }));
    const r = await getReply(turns, q);
    const next: Msg[] = [...withQuestion, { id: base + 1, from: "bot", text: r.text, links: r.links, handoff: r.handoff, source: r.source }];
    setMsgs(next);
    saveHistory(next);
    setPending(false);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    void ask(draft);
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      close();
    }
  };

  const clear = () => {
    setMsgs([]);
    saveHistory([]);
    inputRef.current?.focus();
  };

  const mailto = supportMailto(history.map((m) => ({ from: m.from, text: m.text })));
  const lastBot = [...history].reverse().find((m) => m.from === "bot");

  return (
    <>
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={titleId}
          onKeyDown={onKeyDown}
          className="support-panel fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col border-2 border-ink bg-bone text-ink shadow-[4px_4px_0_var(--color-ink)] sm:inset-x-auto sm:right-5 sm:bottom-24 sm:h-[34rem] sm:max-h-[calc(100dvh-8rem)] sm:w-[23rem] sm:rounded-[3px]"
        >
          <div className="flex items-center justify-between gap-3 border-b-2 border-ink bg-ink px-4 py-3 text-bone">
            <div>
              <h2 id={titleId} className="h-display text-sm">
                {site.name} help
              </h2>
              <p className="text-xs text-bone/70">Instant answers. Real people by email.</p>
            </div>
            <div className="flex items-center gap-1">
              {history.length > 0 && (
                <button type="button" onClick={clear} className="cursor-pointer px-2 py-1 text-xs underline underline-offset-2 hover:text-gold">
                  Clear
                </button>
              )}
              <button
                type="button"
                onClick={close}
                className="grid h-9 w-9 cursor-pointer place-items-center text-2xl leading-none hover:text-gold"
                aria-label="Close support chat"
              >
                ×
              </button>
            </div>
          </div>

          <div ref={logRef} role="log" aria-live="polite" aria-label="Support conversation" className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            <BotBubble text={GREETING} />
            {history.length === 0 && (
              <div className="flex flex-wrap gap-2" aria-label="Suggested questions" role="group">
                {SUGGESTED_QUESTIONS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => void ask(q)}
                    className="cursor-pointer rounded-full border-2 border-ink/70 bg-paper px-3 py-1.5 text-left text-sm hover:border-ink hover:bg-ink hover:text-bone"
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
            {history.map((m) =>
              m.from === "you" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[85%] rounded-[3px] bg-navy px-3 py-2 text-sm whitespace-pre-line text-paper">
                    <span className="sr-only">You: </span>
                    {m.text}
                  </p>
                </div>
              ) : (
                <BotBubble key={m.id} text={m.text} links={m.links} onNavigate={close}>
                  {m.handoff && m === lastBot && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <a href={mailto} className="btn btn-red min-h-0 px-3 py-2 text-[0.7rem]">
                        Email {site.contactEmail}
                      </a>
                    </div>
                  )}
                </BotBubble>
              ),
            )}
            {pending && (
              <div className="w-fit rounded-[3px] border-2 border-ink/15 bg-paper px-3 py-2.5" role="status">
                <span className="sr-only">{site.name} bot is typing…</span>
                <span aria-hidden="true" className="typing-dots flex gap-1">
                  <span />
                  <span />
                  <span />
                </span>
              </div>
            )}
          </div>

          <form onSubmit={onSubmit} className="flex gap-2 border-t-2 border-ink/15 bg-paper p-3">
            <label htmlFor={`${panelId}-input`} className="sr-only">
              Ask a question
            </label>
            <input
              ref={inputRef}
              id={`${panelId}-input`}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={1000}
              autoComplete="off"
              enterKeyHint="send"
              placeholder="Ask about sizing, shipping, refunds…"
              className="min-w-0 flex-1 rounded-[3px] border-2 border-ink/30 bg-bone px-3 py-2 text-base focus:border-ink sm:text-sm"
            />
            <button type="submit" className="btn btn-red min-h-0 px-4 py-2" disabled={!draft.trim() || pending}>
              Send
            </button>
          </form>
          <p className="bg-paper px-3 pb-3 text-[0.7rem] text-ink/60">
            Need a person?{" "}
            <a href={mailto} className="link">
              Email us
            </a>{" "}
            or visit the{" "}
            <Link href="/contact" onClick={close} className="link">
              contact page
            </Link>
            .
          </p>
        </div>
      )}

      <button
        ref={launcherRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        aria-label={open ? "Close support chat" : "Open support chat"}
        className={`btn btn-red fixed right-4 bottom-4 z-50 rounded-full px-5 sm:right-5 sm:bottom-5 ${open ? "max-sm:hidden" : ""}`}
      >
        <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 5h16v11H9l-5 4z" />}
        </svg>
        <span>{open ? "Close" : "Help"}</span>
      </button>
    </>
  );
}

function BotBubble({
  text,
  links,
  onNavigate,
  children,
}: {
  text: string;
  links?: ChatLink[];
  onNavigate?: () => void;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-[92%] rounded-[3px] border-2 border-ink/15 bg-paper px-3 py-2 text-sm">
      <p className="whitespace-pre-line">
        <span className="sr-only">{site.name} bot: </span>
        <RichText text={text} onNavigate={onNavigate} />
      </p>
      {links && links.length > 0 && (
        <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          {links.map((l) => (
            <li key={l.href + l.label}>
              {/^https?:\/\//.test(l.href) ? (
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link font-semibold">
                  {l.label} ↗
                </a>
              ) : (
                <Link href={l.href} onClick={onNavigate} className="link font-semibold">
                  {l.label} →
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
      {children}
    </div>
  );
}

const SITE_HOSTS = new Set(["saverine.shop", "www.saverine.shop"]);
const TOKEN = /\[([^\]\n]{1,80})\]\(((?:https?:\/\/|\/)[^)\s]*)\)|(https?:\/\/[^\s)]+[^\s).,!?])/g;

/**
 * Renders reply text with [label](href) and bare URLs as links. Site paths use
 * Next Link (basePath-aware); other sites open in a new tab. Everything else is
 * plain text, so nothing from the API is ever injected as HTML.
 */
function RichText({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const clean = text.replace(/\*\*(.+?)\*\*/g, "$1").replace(/^#+\s+/gm, "");
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of clean.matchAll(TOKEN)) {
    if (m.index > last) out.push(clean.slice(last, m.index));
    const label = m[1] ?? m[3];
    let href = m[2] ?? m[3];
    try {
      const u = new URL(href, "https://saverine.shop");
      if (SITE_HOSTS.has(u.hostname)) href = `${u.pathname}${u.hash}`;
    } catch {}
    out.push(
      href.startsWith("/") ? (
        <Link key={m.index} href={href} onClick={onNavigate} className="link font-semibold">
          {label}
        </Link>
      ) : (
        <a key={m.index} href={href} target="_blank" rel="noopener noreferrer" className="link font-semibold">
          {label}
        </a>
      ),
    );
    last = m.index + m[0].length;
  }
  if (last < clean.length) out.push(clean.slice(last));
  return <>{out}</>;
}
