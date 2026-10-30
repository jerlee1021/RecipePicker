import Link from "next/link";
import { connection } from "next/server";
import { deleteThisWeek } from "./actions";
import { DeletePlanButton } from "./delete-plan-button";
import { PlanDraft } from "./plan-draft";
import { getCurrentUserId } from "@/lib/currentUser";
import { PICKS_PER_WEEK, pickRandom } from "@/lib/picks";
import { getPlanForWeek, getRecipesForUser } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";

export default async function Home() {
  // Render on every request, not once at build time: the plan changes during the week.
  await connection();

  const userId = await getCurrentUserId();
  const weekStart = getMondayOf(new Date());
  const plan = await getPlanForWeek(userId, weekStart);

  // Only needed without a plan: the draft picks from all of the user's recipes.
  const recipes = plan ? [] : await getRecipesForUser(userId);

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
        <>
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
          <Link
            href="/checklist"
            className="mt-6 block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
          >
            Grocery list
          </Link>
          <form action={deleteThisWeek}>
            <DeletePlanButton />
          </form>
        </>
      ) : (
        <>
          <p className="mt-6 text-zinc-600 dark:text-zinc-400">
            No plan yet for this week. Hold the ones you like and refresh the rest.
          </p>
          {/* Initial picks are chosen here on the server, not in the client component:
              random values computed during render would differ between the server's HTML
              and the browser's first render (a hydration mismatch). */}
          <PlanDraft recipes={recipes} initialPicks={pickRandom(recipes, PICKS_PER_WEEK)} />
        </>
      )}
    </main>
  );
}
