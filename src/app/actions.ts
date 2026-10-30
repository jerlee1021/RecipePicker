"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/currentUser";
import { PICKS_PER_WEEK } from "@/lib/picks";
import { createPlanWithPicks, deletePlanForWeek, setChecklistItemChecked } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";

// Server actions are public POST endpoints, so identity comes from the server,
// never from anything the form sends.
// The browser chose these ids, so check their shape here; createPlanWithPicks
// separately rejects any id this user doesn't own.
export async function confirmPicks(recipeIds: number[]) {
  const validShape =
    Array.isArray(recipeIds) &&
    recipeIds.length > 0 &&
    recipeIds.length <= PICKS_PER_WEEK &&
    recipeIds.every(Number.isInteger) &&
    new Set(recipeIds).size === recipeIds.length;
  if (!validShape) {
    throw new Error("Invalid picks");
  }

  const userId = await getCurrentUserId();

  try {
    await createPlanWithPicks(userId, getMondayOf(new Date()), recipeIds);
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

// No arguments: who and which week both come from the server.
// Deleting the plan cascades to its picks and checklist items.
export async function deleteThisWeek() {
  const userId = await getCurrentUserId();

  try {
    await deletePlanForWeek(userId, getMondayOf(new Date()));
  } catch (e) {
    // P2025 = no plan to delete: a double tap or another tab already removed it.
    // The user got what they wanted, so treat it as success.
    const alreadyDeleted = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!alreadyDeleted) throw e;
  }

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
