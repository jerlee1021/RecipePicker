"use client";

import { useActionState, type MouseEvent } from "react";
import { deleteThisWeek, type DeleteThisWeekState } from "./actions";

const initialState: DeleteThisWeekState = { error: null };

// Client Component because the confirm dialog only exists in the browser.
// Cancelling stops the form submit, so the server action never runs.
// Owns its <form> so useActionState can show the action's error message.
export function DeletePlanButton() {
  const [state, formAction, pending] = useActionState(deleteThisWeek, initialState);

  function handleClick(event: MouseEvent<HTMLButtonElement>) {
    if (!window.confirm("Delete this week's plan? Your picks and grocery check-offs will be lost.")) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction}>
      <button
        type="submit"
        onClick={handleClick}
        disabled={pending}
        className="mt-3 w-full rounded-lg px-4 py-3 text-sm font-medium text-red-600 disabled:opacity-60 dark:text-red-400"
      >
        {pending ? "Deleting…" : "Delete this week's plan"}
      </button>
      {state.error && (
        <p role="alert" className="mt-2 text-center text-sm text-red-600 dark:text-red-400">
          {state.error}
        </p>
      )}
    </form>
  );
}
