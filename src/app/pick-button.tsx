"use client";

import { useFormStatus } from "react-dom";

// Client Component because "is the form submitting?" only exists in the browser.
// Disabling is a convenience; the action itself tolerates duplicate submits.
export function PickButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="mt-4 w-full rounded-lg bg-zinc-900 px-4 py-3 font-medium text-white disabled:opacity-60 dark:bg-zinc-100 dark:text-zinc-900"
    >
      {pending ? "Picking…" : "Pick this week's recipes"}
    </button>
  );
}
