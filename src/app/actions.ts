"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
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

  try {
    await createPlanWithPicks(userId, getMondayOf(new Date()), picked.map((r) => r.id));
  } catch (e) {
    // P2002 = unique constraint failed: another request (double tap, second tab)
    // already created this week's plan. The user got what they wanted, so fall
    // through and show it. Anything else is a real failure and must surface.
    const alreadyPlanned = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002";
    if (!alreadyPlanned) throw e;
  }

  // Re-render the page so it shows the new plan.
  refresh();
}
