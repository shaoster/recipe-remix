"use client";

import { useSyncExternalStore } from "react";
import { getToken, getUsername } from "@/lib/auth";

// getToken/getUsername read localStorage, an external store React doesn't know
// about. useSyncExternalStore (rather than useState+useEffect) is the
// recommended way to read it: it avoids the extra render pass and the
// hydration mismatch between the server's null and the client's real value.
const AUTH_EVENT = "recipe-remix-auth-change";

export function notifyAuthChange() {
  window.dispatchEvent(new Event(AUTH_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(AUTH_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(AUTH_EVENT, callback);
  };
}

function getServerSnapshot() {
  return null;
}

export function useAuthToken(): string | null {
  return useSyncExternalStore(subscribe, getToken, getServerSnapshot);
}

export function useAuthUsername(): string | null {
  return useSyncExternalStore(subscribe, getUsername, getServerSnapshot);
}
