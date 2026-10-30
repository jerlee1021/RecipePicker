"use client";

import type { MouseEvent } from "react";
import { useFormStatus } from "react-dom";

// Client Component because the confirm dialog only exists in the browser.
// Cancelling stops the form submit, so the server action never runs.
export function DeletePlanButton() {
  const { pending } = useFormStatus();

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm("Delete this week's plan? Your picks and grocery check-offs will be lost.")) {
      event.preventDefault();
    }
  }

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={pending}
      className="mt-3 w-full rounded-lg px-4 py-3 text-sm font-medium text-red-600 disabled:opacity-60 dark:text-red-400"
    >
      {pending ? "Deleting…" : "Delete this week's plan"}
    </button>
  );
}
