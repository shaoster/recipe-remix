"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";
import { useAuthUsername, notifyAuthChange } from "./useAuthToken";

export default function AuthNav() {
  const router = useRouter();
  const username = useAuthUsername();

  function handleLogout() {
    clearAuth();
    notifyAuthChange();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="flex items-center justify-between px-6 py-3 border-b border-zinc-200 dark:border-zinc-800 text-sm">
      <Link href="/" className="font-semibold">
        Recipe Remix Tree
      </Link>
      {username ? (
        <div className="flex items-center gap-4">
          <span className="text-zinc-600 dark:text-zinc-400">
            Logged in as {username}
          </span>
          <Link href="/favorites" className="underline">
            Favorites
          </Link>
          <button onClick={handleLogout} className="underline cursor-pointer">
            Log out
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <Link href="/login" className="underline">
            Log in
          </Link>
          <Link href="/register" className="underline">
            Register
          </Link>
        </div>
      )}
    </nav>
  );
}
