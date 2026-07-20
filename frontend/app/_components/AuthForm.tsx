"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { loginUser, registerUser } from "@/lib/api";
import { setAuth } from "@/lib/auth";
import { notifyAuthChange } from "./useAuthToken";

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const result = isLogin
        ? await loginUser(username, password)
        : await registerUser(username, password);
      setAuth(result.token, result.username);
      notifyAuthChange();
      router.push("/");
    } catch {
      setError(
        isLogin
          ? "Log in failed. Check your username and password."
          : "Registration failed. Try a different username."
      );
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <h1 className="text-2xl font-semibold">{isLogin ? "Log in" : "Register"}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
        <input
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="border border-zinc-900 dark:border-zinc-100 rounded px-3 py-2 disabled:opacity-50"
        >
          {submitting ? "…" : isLogin ? "Log in" : "Register"}
        </button>
      </form>
      <p className="text-sm">
        {isLogin ? (
          <>
            Need an account?{" "}
            <Link href="/register" className="underline">
              Register
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="underline">
              Log in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
