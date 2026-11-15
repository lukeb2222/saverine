"use client";

import { useSyncExternalStore } from "react";

let open = false;
const listeners = new Set<() => void>();

export const drawer = {
  set(next: boolean) {
    open = next;
    listeners.forEach((l) => l());
  },
};

export function useDrawerOpen() {
  return useSyncExternalStore(
    (cb) => (listeners.add(cb), () => listeners.delete(cb)),
    () => open,
    () => false,
  );
}
