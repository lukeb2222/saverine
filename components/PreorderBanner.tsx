"use client";

import { useSyncExternalStore } from "react";
import { site } from "@/data/site";

const closesAt = new Date(site.preorder.closesAt).getTime();

function subscribe(cb: () => void) {
  const id = setInterval(cb, 1000);
  return () => clearInterval(id);
}

/** Seconds left until preorders close; null on the server and before hydration. */
export function useSecondsLeft() {
  return useSyncExternalStore<number | null>(
    subscribe,
    () => Math.max(0, Math.floor((closesAt - Date.now()) / 1000)),
    () => null,
  );
}

const pad = (n: number) => String(n).padStart(2, "0");

export function PreorderBanner() {
  const left = useSecondsLeft();
  const { dropName, closesLabel, shipsBy } = site.preorder;
  const closed = left === 0;

  return (
    <div className="bg-ink text-bone">
      <div className="container-x flex flex-wrap items-center justify-center gap-x-4 gap-y-1 py-2 text-center text-[0.8rem]">
        <p>
          {closed ? (
            <>
              <strong className="font-semibold">{dropName} preorders are closed.</strong> Orders ship {shipsBy}.
            </>
          ) : (
            <>
              <strong className="font-semibold">{dropName}</strong> — preorder closes {closesLabel}. Ships {shipsBy}.
            </>
          )}
        </p>
        {left !== null && !closed && (
          <p
            className="font-display tracking-[0.12em] text-gold tabular-nums"
            role="timer"
            aria-label={`${Math.floor(left / 86400)} days ${Math.floor((left % 86400) / 3600)} hours left to preorder`}
          >
            {Math.floor(left / 86400)}D {pad(Math.floor((left % 86400) / 3600))}H {pad(Math.floor((left % 3600) / 60))}M{" "}
            {pad(left % 60)}S
          </p>
        )}
      </div>
    </div>
  );
}
