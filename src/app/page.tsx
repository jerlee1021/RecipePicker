import { connection } from "next/server";
import { pickThisWeek } from "./actions";
import { getCurrentUserId } from "@/lib/currentUser";
import { getPlanForWeek } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";

export default async function Home() {
  // Render on every request, not once at build time: the plan changes during the week.
  await connection();

  const userId = await getCurrentUserId();
  const weekStart = getMondayOf(new Date());
  const plan = await getPlanForWeek(userId, weekStart);

  // weekStart is midnight UTC, so format it in UTC or it can show as Sunday.
  const weekLabel = weekStart.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <h1 className="text-2xl font-semibold">This week</h1>
      <p className="mt-1 text-sm text-zinc-500">Week of {weekLabel}</p>

      {plan ? (
        <ul className="mt-6 space-y-3">
          {plan.pickedRecipes.map(({ recipe }) => (
            <li key={recipe.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
              {recipe.sourceUrl ? (
                <a
                  href={recipe.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium underline underline-offset-4"
                >
                  {recipe.name}
                </a>
              ) : (
                <span className="font-medium">{recipe.name}</span>
              )}
              {recipe.source && <p className="mt-1 text-sm text-zinc-500">{recipe.source}</p>}
            </li>
          ))}
        </ul>
      ) : (
        <form action={pickThisWeek} className="mt-6">
          <p className="text-zinc-600 dark:text-zinc-400">No plan yet for this week.</p>
          <button
            type="submit"
            className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Pick this week&apos;s recipes
          </button>
        </form>
      )}
    </main>
  );
}
