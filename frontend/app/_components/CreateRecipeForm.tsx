"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createRecipe } from "@/lib/api";
import { useAuthToken } from "./useAuthToken";

export default function CreateRecipeForm() {
  const router = useRouter();
  const token = useAuthToken();
  const [title, setTitle] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [steps, setSteps] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!token) {
    return (
      <Link href="/login" className="underline text-sm">
        Log in to create a recipe
      </Link>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const recipe = await createRecipe({ title, ingredients, steps }, token as string);
      router.push(`/recipes/${recipe.id}`);
    } catch {
      setError("Could not create recipe. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 w-full max-w-md text-left">
      <input
        className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
        placeholder="Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <textarea
        className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
        placeholder="Ingredients"
        rows={4}
        value={ingredients}
        onChange={(e) => setIngredients(e.target.value)}
        required
      />
      <textarea
        className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-2 bg-transparent"
        placeholder="Steps"
        rows={4}
        value={steps}
        onChange={(e) => setSteps(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="border border-zinc-900 dark:border-zinc-100 rounded px-3 py-2 disabled:opacity-50"
      >
        {submitting ? "Creating…" : "Create recipe"}
      </button>
    </form>
  );
}
