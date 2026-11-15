"use client";

import { useState } from "react";

export function SignupForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus("sending");
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: data.get("email"), company: data.get("company") }),
      });
      const json = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(json.error ?? "Something went wrong. Try again in a minute.");
      setStatus("done");
      form.reset();
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "done") {
    return (
      <p role="status" className="font-marker text-2xl text-gold">
        You&rsquo;re on the list. First dibs are yours.
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="w-full max-w-lg" noValidate={false}>
      <div className="flex flex-col gap-3 sm:flex-row">
        <label htmlFor="signup-email" className="sr-only">
          Email address
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="min-h-12 flex-1 rounded-[3px] border-2 border-bone/60 bg-transparent px-4 text-bone placeholder:text-bone/50 focus:border-gold"
        />
        {/* honeypot: real people never see or fill this */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
        <button type="submit" disabled={status === "sending"} className="btn btn-red">
          {status === "sending" ? "Adding you…" : "Get first dibs"}
        </button>
      </div>
      {status === "error" && (
        <p role="alert" className="mt-3 text-sm text-gold">
          {message}
        </p>
      )}
      <p className="mt-3 text-xs text-bone/60">Drop news only. Unsubscribe any time.</p>
    </form>
  );
}
