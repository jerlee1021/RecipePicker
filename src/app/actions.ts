"use server";

import { refresh } from "next/cache";
import { getCurrentUserId } from "@/lib/currentUser";
import { pickRandom } from "@/lib/picks";
import { createPlanWithPicks, getRecipesForUser } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";

const PICKS_PER_WEEK = 3;

// Server actions are public POST endpoints, so identity comes from the server,
// never from anything the form sends.
export async function pickThisWeek() {
  const userId = await getCurrentUserId();
  const recipes = await getRecipesForUser(userId);
  const picked = pickRandom(recipes, PICKS_PER_WEEK);

  await createPlanWithPicks(userId, getMondayOf(new Date()), picked.map((r) => r.id));

  // Re-render the page so it shows the new plan.
  refresh();
}
