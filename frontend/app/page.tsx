import Link from "next/link";
import { fetchRecipes } from "@/lib/api";
import CreateRecipeForm from "./_components/CreateRecipeForm";

export default async function Home() {
  const recipes = await fetchRecipes();

  return (
    <div className="flex flex-col flex-1 items-center gap-10 bg-zinc-50 dark:bg-black px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight">Recipe Remix Tree</h1>

      <ul className="flex flex-col gap-2 w-full max-w-md">
        {recipes.map((recipe) => (
          <li key={recipe.id}>
            <Link
              href={`/recipes/${recipe.id}`}
              className="flex items-baseline justify-between border border-zinc-200 dark:border-zinc-800 rounded px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              <span>{recipe.title}</span>
              <span className="text-sm text-zinc-500">by {recipe.author}</span>
            </Link>
          </li>
        ))}
      </ul>

      <section className="flex flex-col items-center gap-3 w-full max-w-md">
        <h2 className="text-lg font-medium">Add a new recipe</h2>
        <CreateRecipeForm />
      </section>
    </div>
  );
}
