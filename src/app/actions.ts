"use server";

import { refresh } from "next/cache";
import { Prisma } from "@/generated/prisma/client";
import { getCurrentUserId } from "@/lib/currentUser";
import { PICKS_PER_WEEK } from "@/lib/picks";
import { isValidRating } from "@/lib/rating";
import { createPlanWithPicks, deletePlanForWeek, setChecklistItemChecked, createRecipeForUser, markPickCooked, setPickRating } from "@/lib/queries/weeklyrecipes";
import { getMondayOf } from "@/lib/week";
import { RecipeInput } from "@/lib/recipeInput";
import { redirect } from "next/navigation";

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

export type DeleteThisWeekState = { error: string | null };

// Called through useActionState, which passes (prevState, formData); neither is needed,
// because who and which week both come from the server, never from the form.
// Returns the next state for the button to show.
// Deleting the plan cascades to its picks and checklist items.
export async function deleteThisWeek(): Promise<DeleteThisWeekState> {
  const userId = await getCurrentUserId();

  try {
    const result = await deletePlanForWeek(userId, getMondayOf(new Date()));
    // "missing" = a double tap or another tab already removed it. The user got
    // what they wanted, so only "cooked" is an error.
    if (!result.deleted && result.reason === "cooked") {
      return { error: "This plan has cooked recipes, so it can't be deleted." };
    }
  } catch (e) {
    // P2025 = the plan vanished between the check and the delete (another tab).
    // Same outcome as "missing", so treat it as success.
    const alreadyDeleted = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!alreadyDeleted) throw e;
  }

  refresh();
  return { error: null };
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

export type CreateRecipeResult = {
  issues: { path: PropertyKey[]; message: string }[];
};

// input is `unknown` on purpose: anyone can POST to this, so nothing about its
// shape is trusted until the schema has checked it.
export async function createRecipe(input: unknown): Promise<CreateRecipeResult> {
  const result = RecipeInput.safeParse(input);
  if (!result.success) {
    return { issues: result.error.issues };
  }

  const userId = await getCurrentUserId();

  try {
    await createRecipeForUser(userId, result.data);
  } catch (e) {
    // P2025 = a tag id didn't match a row: a stale form or a tampered request.
    // Report it on the tags field instead of crashing the page.
    const missingTag = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!missingTag) throw e;
    return { issues: [{ path: ["tagIds"], message: "Some tags no longer exist. Reload and try again." }] };
  }

  // Outside the try: redirect works by throwing, and the catch would swallow it.
  redirect("/");
}

export async function markCooked(pickId: number, rating: number) {
  if (!Number.isInteger(pickId) || !isValidRating(rating)) {
    throw new Error("Invalid pickId or rating");
  }

  const userId = await getCurrentUserId();

  try {
    await markPickCooked(userId, pickId, rating);
  } catch (e) {
    // P2025 = no row matched: the pick doesn't exist, isn't this user's,
    // or is already cooked (double tap, stale tab). The original cookedAt is kept.
    const notFound = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!notFound) throw e;
    console.warn(`markPickCooked: pick ${pickId} not found for user ${userId}`);
  }

  refresh();
}

export async function reRate(pickId: number, rating: number) {
  if (!Number.isInteger(pickId) || !isValidRating(rating)) {
    throw new Error("Invalid pickId or rating");
  }

  const userId = await getCurrentUserId();

  try {
    await setPickRating(userId, pickId, rating);
  } catch (e) {
    // P2025 = no row matched: the pick doesn't exist, isn't this user's,
    // or hasn't been cooked yet (a rating needs a cook first).
    const notFound = e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025";
    if (!notFound) throw e;
    console.warn(`reRate: pick ${pickId} not found for user ${userId}`);
  }

  refresh();
}