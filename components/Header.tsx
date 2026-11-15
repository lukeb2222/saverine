"use client";

import Link from "next/link";
import { Wordmark } from "./brand";
import { useCart } from "@/lib/cart";
import { drawer } from "@/lib/drawer";

export function Header() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b-2 border-ink/10 bg-bone/95 backdrop-blur-sm">
      <div className="container-x flex h-16 items-center justify-between gap-4">
        <Link href="/" aria-label="Saverine home" className="shrink-0">
          <Wordmark className="h-9 w-auto md:h-10" />
        </Link>
        <nav aria-label="Main" className="flex items-center gap-4 text-[0.72rem] sm:gap-7">
          <Link href="/#drop" className="h-display whitespace-nowrap hover:text-red">
            The Drop
          </Link>
          <Link href="/size-guide" className="h-display hidden hover:text-red sm:inline">
            Size Guide
          </Link>
          <Link href="/faq" className="h-display hidden hover:text-red min-[420px]:inline">
            FAQ
          </Link>
          <button
            type="button"
            onClick={() => drawer.set(true)}
            className="h-display flex cursor-pointer items-center gap-2 rounded-[3px] border-2 border-ink px-3 py-2 hover:bg-ink hover:text-bone"
            aria-label={`Open cart, ${count} ${count === 1 ? "item" : "items"}`}
          >
            Cart
            <span className="grid h-5 min-w-5 place-items-center rounded-full bg-red px-1 text-[0.65rem] tracking-normal text-paper tabular-nums">
              {count}
            </span>
          </button>
        </nav>
      </div>
    </header>
  );
}
