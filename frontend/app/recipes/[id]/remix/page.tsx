export default async function RecipeRemix({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Remix Recipe — forking id {id}</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Screen 3: pre-fill a form from the parent recipe, let the user edit
        ingredients/steps and add a remix note, then save as a new recipe
        linked to this parent. Build it out per README.md.
      </p>
    </div>
  );
}
