"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { remixRecipe } from "@/lib/api";
import { useAuthToken } from "./useAuthToken";

export default function RemixForm({
  forkId,
  initialIngredients,
  initialSteps,
  forkedTitle,
}: {
  forkId: number;
  initialIngredients: string;
  initialSteps: string;
  forkedTitle: string;
}) {
  const router = useRouter();
  const token = useAuthToken();
  const [title, setTitle] = useState(forkedTitle);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [steps, setSteps] = useState(initialSteps);
  const [remixNote, setRemixNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <Link href="/login" className="underline text-sm">
        Log in to remix
      </Link>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const recipe = await remixRecipe(
        forkId,
        { title, ingredients, steps, remix_note: remixNote },
        token as string
      );
      router.push(`/recipes/${recipe.id}`);
    } catch {
      setError("Could not save remix. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md text-left">
      <p className="text-sm text-zinc-500">Forking &quot;{forkedTitle}&quot;</p>
      <label className="flex flex-col gap-1 text-sm">
        Title
        <input
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Ingredients
        <textarea
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          rows={4}
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Steps
        <textarea
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          rows={4}
          value={steps}
          onChange={(e) => setSteps(e.target.value)}
          required
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        What did you change?
        <input
          className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
          value={remixNote}
          onChange={(e) => setRemixNote(e.target.value)}
          required
        />
      </label>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="border border-zinc-900 dark:border-zinc-100 rounded px-3 py-2 disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save remix"}
      </button>
    </form>
  );
}
