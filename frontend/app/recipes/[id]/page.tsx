import Link from "next/link";
import { fetchRecipe } from "@/lib/api";
import FavoriteButton from "@/app/_components/FavoriteButton";

export default async function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await fetchRecipe(Number(id));

  return (
    <div className="flex flex-col flex-1 items-center gap-6 px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{recipe.title}</h1>
            <p className="text-sm text-zinc-500">by {recipe.author}</p>
          </div>
          <FavoriteButton recipeId={recipe.id} initialFavorited={recipe.is_favorited} />
        </div>

        {recipe.parent && (
          <p className="text-sm">
            Remixed from{" "}
            <Link href={`/recipes/${recipe.parent.id}`} className="underline">
              {recipe.parent.title}
            </Link>
          </p>
        )}

        {recipe.remix_note && (
          <p className="text-sm italic text-zinc-600 dark:text-zinc-400">
            &quot;{recipe.remix_note}&quot;
          </p>
        )}

        <section>
          <h2 className="text-lg font-medium mb-2">Ingredients</h2>
          <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
            {recipe.ingredients}
          </p>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Steps</h2>
          <p className="whitespace-pre-line text-zinc-700 dark:text-zinc-300">
            {recipe.steps}
          </p>
        </section>

        <Link href={`/recipes/${recipe.id}/remix`} className="underline text-sm w-fit">
          Remix this recipe
        </Link>

        {recipe.remixes.length > 0 && (
          <section>
            <h2 className="text-lg font-medium mb-2">Remixes</h2>
            <ul className="flex flex-col gap-2">
              {recipe.remixes.map((remix) => (
                <li key={remix.id}>
                  <Link
                    href={`/recipes/${remix.id}`}
                    className="flex flex-col border border-zinc-200 dark:border-zinc-800 rounded px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                  >
                    <span>{remix.title}</span>
                    <span className="text-sm text-zinc-500">
                      by {remix.author} — {remix.remix_note}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
