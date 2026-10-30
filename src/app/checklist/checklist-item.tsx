"use client";

import { useOptimistic, useTransition } from "react";
import { setItemChecked } from "../actions";

type Props = {
  id: number;
  checked: boolean;
  label: string;
};

// Client Component because taps only happen in the browser.
// useOptimistic flips the box instantly; the server's value takes over once refresh() lands.
export function ChecklistItem({ id, checked, label }: Props) {
  const [optimisticChecked, setOptimisticChecked] = useOptimistic(checked);
  const [, startTransition] = useTransition();

  function handleChange() {
    // Send the desired state (the opposite of what's on screen), never "flip".
    const next = !optimisticChecked;
    startTransition(async () => {
      setOptimisticChecked(next);
      await setItemChecked(id, next);
    });
  }

  return (
    <li>
      <label className="flex cursor-pointer items-center gap-3 py-3">
        <input
          type="checkbox"
          checked={optimisticChecked}
          onChange={handleChange}
          className="size-5 shrink-0 accent-zinc-900 dark:accent-zinc-100"
        />
        <span className={optimisticChecked ? "text-zinc-400 line-through" : ""}>{label}</span>
      </label>
    </li>
  );
}
