import Link from "next/link";
import { connection } from "next/server";
import { RecipeForm } from "./recipe-form";
import { getAllTags } from "@/lib/queries/tags";

export default async function NewRecipePage() {
  // Render per request so newly added tags show up (and the DB isn't hit at build time).
  await connection();

  const tags = await getAllTags();

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 underline underline-offset-4">
        ← This week
      </Link>
      <h1 className="mt-4 text-2xl font-semibold">New recipe</h1>
      <RecipeForm tags={tags} />
    </main>
  );
}
