import { fetchRecipe } from "@/lib/api";
import RemixForm from "@/app/_components/RemixForm";

export default async function RecipeRemix({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const recipe = await fetchRecipe(Number(id));

  return (
    <div className="flex flex-col flex-1 items-center gap-6 px-6 py-16">
      <div className="w-full max-w-md flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold text-center">
          Remix &quot;{recipe.title}&quot;
        </h1>
        <RemixForm
          forkId={recipe.id}
          initialIngredients={recipe.ingredients}
          initialSteps={recipe.steps}
          forkedTitle={recipe.title}
        />
      </div>
    </div>
  );
}
