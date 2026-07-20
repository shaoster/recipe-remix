import Link from "next/link";
import { checkBackendHealth } from "@/lib/api";

export default async function Home() {
  const backendOk = await checkBackendHealth();

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center gap-6 py-32 px-16 bg-white dark:bg-black text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-black dark:text-zinc-50">
          Recipe Remix Tree
        </h1>
        <p className="max-w-md text-zinc-600 dark:text-zinc-400">
          This is the scaffold&apos;s Screen 1 (recipe list). Build it out per{" "}
          <code>README.md</code>.
        </p>
        <p className="text-sm">
          Backend health check:{" "}
          <span className={backendOk ? "text-green-600" : "text-red-600"}>
            {backendOk ? "connected ✓" : "not reachable — is the Django server running?"}
          </span>
        </p>
        <div className="flex gap-4 text-sm">
          <Link href="/recipes/1" className="underline">
            Sample detail screen →
          </Link>
          <Link href="/recipes/1/remix" className="underline">
            Sample remix screen →
          </Link>
        </div>
      </main>
    </div>
  );
}
