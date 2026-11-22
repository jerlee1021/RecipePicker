"use client";

import { useOptimistic, useTransition } from "react";
import { markCooked, reRate } from "./actions";
import { MAX_RATING, MIN_RATING } from "@/lib/rating";

type Props = {
  pickId: number;
  // null = not cooked yet. A rating only exists alongside cookedAt, so this alone tells the state.
  rating: number | null;
};

const STARS = Array.from({ length: MAX_RATING - MIN_RATING + 1 }, (_, i) => MIN_RATING + i);

// Tapping a star on an uncooked pick marks it cooked with that rating; on a cooked pick it re-rates.
export function PickRating({ pickId, rating }: Props) {
  const [optimisticRating, setOptimisticRating] = useOptimistic(rating);
  const [, startTransition] = useTransition();

  function handleRate(value: number) {
    // Decide from the optimistic state, not the prop: a second quick tap should re-rate,
    // and Next runs server actions one at a time, so markCooked lands before reRate.
    const alreadyCooked = optimisticRating !== null;
    startTransition(async () => {
      setOptimisticRating(value);
      await (alreadyCooked ? reRate(pickId, value) : markCooked(pickId, value));
    });
  }

  return (
    <div className="mt-3 flex items-center gap-2">
      <span className="text-sm text-zinc-500">{optimisticRating === null ? "Cooked it? Rate:" : "Cooked ·"}</span>
      <div className="flex" role="group" aria-label="Rating">
        {STARS.map((value) => {
          const filled = optimisticRating !== null && value <= optimisticRating;
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleRate(value)}
              aria-label={`${value} out of ${MAX_RATING}`}
              aria-pressed={optimisticRating === value}
              // 44px tap target for phones.
              className={`size-11 text-2xl leading-none ${filled ? "text-amber-500" : "text-zinc-300 dark:text-zinc-700"}`}
            >
              {filled ? "★" : "☆"}
            </button>
          );
        })}
      </div>
    </div>
  );
}
