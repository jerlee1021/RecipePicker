"use client";

import { useState, useTransition } from "react";
import { confirmPicks } from "./actions";
import { holdFromSearch, refreshPicks } from "@/lib/picks";
import type { getRecipesForUser } from "@/lib/queries/weeklyrecipes";
import { searchRecipes } from "@/lib/search";

type Recipe = Awaited<ReturnType<typeof getRecipesForUser>>[number];

type Props = {
  recipes: Recipe[];
  initialPicks: Recipe[];
};

// The draft lives only here, in browser state: nothing is saved until Confirm.
// Reloading the page starts a fresh draft.
export function PlanDraft({ recipes, initialPicks }: Props) {
  const [picks, setPicks] = useState(initialPicks);
  const [heldIds, setHeldIds] = useState<Set<number>>(() => new Set());
  const [seenIds, setSeenIds] = useState<Set<number>>(() => new Set(initialPicks.map((r) => r.id)));
  const [query, setQuery] = useState("");
  const [isConfirming, startTransition] = useTransition();

  // React only re-renders when state is a new object, so copy the Set rather than mutating it.
  function toggleHold(id: number) {
    setHeldIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleRefresh() {
    const next = refreshPicks(recipes, picks, heldIds, seenIds);
    setPicks(next);
    setSeenIds((prev) => new Set([...prev, ...next.map((r) => r.id)]));
  }

  function handleHoldFromSearch(recipe: Recipe) {
    const next = holdFromSearch(picks, heldIds, recipe);
    setPicks(next.picks);
    setHeldIds(next.heldIds);
    // Count it as shown, so a later Refresh doesn't offer it as "new".
    setSeenIds((prev) => new Set([...prev, recipe.id]));
  }

  function handleConfirm() {
    startTransition(async () => {
      await confirmPicks(picks.map((r) => r.id));
    });
  }

  const allHeld = picks.every((r) => heldIds.has(r.id));
  const results = searchRecipes(recipes, query);

  // Picks come first in the markup so the phone shows them on top; on wide screens
  // md:order-first moves search into a left column.
  return (
    <div className="mt-6 flex flex-col gap-8 md:flex-row">
      <section className="md:min-w-0 md:flex-1">
        <ul className="space-y-3">
          {picks.map((recipe) => {
            const held = heldIds.has(recipe.id);
            return (
              <li
                key={recipe.id}
                className={`flex items-start justify-between gap-3 rounded-lg border p-4 ${
                  held ? "border-zinc-900 dark:border-zinc-100" : "border-zinc-200 dark:border-zinc-800"
                }`}
              >
                <div className="min-w-0">
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
                </div>
                <button
                  type="button"
                  onClick={() => toggleHold(recipe.id)}
                  aria-pressed={held}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium ${
                    held
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {held ? "Held" : "Hold"}
                </button>
              </li>
            );
          })}
        </ul>
  
        <button
          type="button"
          onClick={handleRefresh}
          disabled={allHeld || isConfirming}
          className="mt-4 w-full rounded-lg border border-zinc-300 px-4 py-3 font-medium disabled:opacity-60 dark:border-zinc-700"
        >
          Refresh
        </button>
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming}
          className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isConfirming ? "Saving…" : "Confirm this week's plan"}
        </button>
      </section>

      <section className="md:order-first md:w-64 md:shrink-0">
        <label className="block">
          <span className="text-sm font-medium">Search your recipes</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. tofu, Tiffy Cooks"
            className="mt-1 w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700"
          />
        </label>

        {query.trim() !== "" && results.length === 0 && (
          <p className="mt-3 text-sm text-zinc-500">No recipes match.</p>
        )}
        {results.length > 0 && allHeld && (
          <p className="mt-3 text-sm text-zinc-500">All 3 picks are held. Unhold one to swap a result in.</p>
        )}

        <ul className="mt-3 space-y-2">
          {results.map((recipe) => {
            const held = heldIds.has(recipe.id);
            // Already held: nothing to do. All held: no slot to put it in (holdFromSearch case C).
            const disabled = held || allHeld || isConfirming;
            return (
              <li
                key={recipe.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-800"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{recipe.name}</p>
                  {recipe.source && <p className="truncate text-xs text-zinc-500">{recipe.source}</p>}
                </div>
                <button
                  type="button"
                  onClick={() => handleHoldFromSearch(recipe)}
                  disabled={disabled}
                  className={`shrink-0 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-60 ${
                    held
                      ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                      : "border border-zinc-300 dark:border-zinc-700"
                  }`}
                >
                  {held ? "Held" : "Hold"}
                </button>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
