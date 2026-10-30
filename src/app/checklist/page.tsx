import Link from "next/link";
import { connection } from "next/server";
import { ChecklistItem } from "./checklist-item";
import { groupChecklistByRecipe, type ChecklistItemRow } from "@/lib/checklist";
import { getCurrentUserId } from "@/lib/currentUser";
import { getChecklistForPlan, getPlanForWeek } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";

// "2 cup Rice", "Rice" when there's no quantity.
function formatItem(item: ChecklistItemRow) {
  return [item.quantity, item.unit, item.ingredient.name].filter((part) => part != null).join(" ");
}

export default async function ChecklistPage() {
  // Check-offs change constantly, so render on every request.
  await connection();

  // The plan comes from the server (who + which week), never from the URL.
  const userId = await getCurrentUserId();
  const plan = await getPlanForWeek(userId, getMondayOf(new Date()));

  if (!plan) {
    return (
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold">Grocery list</h1>
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">No plan yet for this week.</p>
        <Link href="/" className="mt-4 inline-block underline underline-offset-4">
          Pick this week&apos;s recipes
        </Link>
      </main>
    );
  }

  const items = await getChecklistForPlan(userId, plan.id);
  const groups = groupChecklistByRecipe(items);

  return (
    <main className="mx-auto w-full max-w-md flex-1 px-4 py-8">
      <Link href="/" className="text-sm text-zinc-500 underline underline-offset-4">
        ← This week
      </Link>
      <h1 className="mt-2 text-2xl font-semibold">Grocery list</h1>

      {groups.length === 0 ? (
        <p className="mt-6 text-zinc-600 dark:text-zinc-400">This plan has no checklist items.</p>
      ) : (
        groups.map((group) => (
          <section key={group.recipeId} className="mt-6">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {group.recipeName}
            </h2>
            <ul className="mt-1 divide-y divide-zinc-200 dark:divide-zinc-800">
              {group.items.map((item) => (
                <ChecklistItem key={item.id} id={item.id} checked={item.checked} label={formatItem(item)} />
              ))}
            </ul>
          </section>
        ))
      )}
    </main>
  );
}
