export default async function RecipeDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex flex-col flex-1 items-center justify-center gap-4 p-16 text-center">
      <h1 className="text-2xl font-semibold">Recipe Detail — id {id}</h1>
      <p className="max-w-md text-zinc-600 dark:text-zinc-400">
        Screen 2: show the recipe, its remix lineage (parent + children), and
        a link to the remix screen. Build it out per README.md.
      </p>
    </div>
  );
}
