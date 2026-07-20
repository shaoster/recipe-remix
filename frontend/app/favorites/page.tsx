"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { fetchFavorites, type FavoriteRecipe } from "@/lib/api";
import { useAuthToken } from "@/app/_components/useAuthToken";

export default function FavoritesPage() {
  const token = useAuthToken();
  const [favorites, setFavorites] = useState<FavoriteRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (token) {
      fetchFavorites(token)
        .then(setFavorites)
        .catch(() => setError("Could not load favorites."));
    }
  }, [token]);

  if (!token) {
    return (
      <div className="flex flex-col flex-1 items-center justify-center gap-4 px-6 py-16 text-center">
        <p>
          <Link href="/login" className="underline">
            Log in
          </Link>{" "}
          to see favorites.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 items-center gap-6 px-6 py-16">
      <h1 className="text-2xl font-semibold">Favorites</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <ul className="flex flex-col gap-2 w-full max-w-md">
        {favorites.map((recipe) => (
          <li key={recipe.id}>
            <Link
              href={`/recipes/${recipe.id}`}
              className="flex items-center justify-between border border-zinc-200 dark:border-zinc-800 rounded px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span>{recipe.title}</span>
              <span className="flex items-center gap-2 text-sm text-zinc-500">
                by {recipe.author}
                {recipe.has_parent && (
                  <span className="border border-zinc-300 dark:border-zinc-700 rounded px-1.5 py-0.5 text-xs">
                    remix
                  </span>
                )}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
