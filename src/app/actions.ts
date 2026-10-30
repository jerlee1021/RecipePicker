"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/currentUser";
import { pickRandom } from "@/lib/picks";
import { createPlanWithPicks, getRecipesForUser, setChecklistItemChecked } from "@/lib/queries/weeklyrecipes";
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

// Takes the desired state, not "flip", so a retried request is harmless (idempotent).
export async function setItemChecked(itemId: number, checked: boolean) {
  // TypeScript types vanish at runtime and these values come from the browser.
  if (!Number.isInteger(itemId) || typeof checked !== "boolean") {
    throw new Error("Invalid checklist update");
  }

  const userId = await getCurrentUserId();

  try {
    await setChecklistItemChecked(userId, itemId, checked);
  } catch (e) {
    // P2025 = no row matched: the item doesn't exist or isn't this user's.
    // Only a tampered request or a stale tab gets here, so log it and move on.
    const notFound = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!notFound) throw e;
    console.warn(`setItemChecked: item ${itemId} not found for user ${userId}`);
  }

  refresh();
}
