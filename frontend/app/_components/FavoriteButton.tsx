"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { favoriteRecipe, unfavoriteRecipe, fetchRecipe } from "@/lib/api";
import { useAuthToken } from "./useAuthToken";

export default function FavoriteButton({
  recipeId,
  initialFavorited,
}: {
  recipeId: number;
  initialFavorited: boolean;
}) {
  const token = useAuthToken();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The detail page fetches server-side without a token, so `initialFavorited`
  // is always false for a logged-in viewer. Re-sync the real state once here.
  useEffect(() => {
    if (token) {
      fetchRecipe(recipeId, token)
        .then((recipe) => setFavorited(recipe.is_favorited))
        .catch(() => {});
    }
  }, [recipeId, token]);

  if (!token) {
    return (
      <Link href="/login" className="text-sm text-zinc-500 underline">
        Log in to favorite
      </Link>
    );
  }

  async function toggle() {
    setError(null);
    const next = !favorited;
    setFavorited(next);
    setPending(true);
    try {
      if (next) {
        await favoriteRecipe(recipeId, token as string);
      } else {
        await unfavoriteRecipe(recipeId, token as string);
      }
    } catch {
      setFavorited(!next);
      setError("Could not update favorite.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={toggle}
        disabled={pending}
        className="border border-zinc-300 dark:border-zinc-700 rounded px-3 py-1.5 text-sm disabled:opacity-50"
      >
        {favorited ? "★ Favorited" : "☆ Favorite"}
      </button>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
