"use client";

import { useState, useTransition } from "react";
import { confirmPicks } from "./actions";
import { refreshPicks } from "@/lib/picks";
import type { getRecipesForUser } from "@/lib/queries/weeklyrecipes";

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

  function handleConfirm() {
    startTransition(async () => {
      await confirmPicks(picks.map((r) => r.id));
    });
  }

  const allHeld = picks.every((r) => heldIds.has(r.id));

  return (
    <div className="mt-6">
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
        Refresh the rest
      </button>
      <button
        type="button"
        onClick={handleConfirm}
        disabled={isConfirming}
        className="mt-3 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isConfirming ? "Saving…" : "Confirm this week's plan"}
      </button>
    </div>
  );
}
