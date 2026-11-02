"use client";

import { useState, useTransition } from "react";
import { createRecipe, type CreateRecipeResult } from "../../actions";

// Exactly what the form sends: raw strings as typed, plus the checked tag ids.
// The schema in src/lib/recipeInput.ts turns this into clean, typed data.
export type RecipeFormValues = {
  name: string;
  source: string;
  sourceUrl: string;
  ingredients: { name: string; quantity: string; unit: string; note: string }[];
  tagIds: number[];
};

type Tag = { id: number; category: string; name: string };

type Row = RecipeFormValues["ingredients"][number] & { key: number };

// Top-level fields that show their own errors inline.
const FIELD_KEYS = ["name", "source", "sourceUrl", "tagIds"];

const inputClass =
  "w-full rounded-md border border-zinc-300 bg-transparent px-3 py-2 text-base dark:border-zinc-700";

let nextKey = 0;
function emptyRow(): Row {
  return { key: nextKey++, name: "", quantity: "", unit: "", note: "" };
}

export function RecipeForm({ tags }: { tags: Tag[] }) {
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [rows, setRows] = useState<Row[]>(() => [emptyRow()]);
  const [tagIds, setTagIds] = useState<Set<number>>(() => new Set());
  const [issues, setIssues] = useState<CreateRecipeResult["issues"]>([]);
  const [isSaving, startTransition] = useTransition();

  function updateRow(key: number, field: keyof RecipeFormValues["ingredients"][number], value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  }

  function toggleTag(id: number) {
    setTagIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Messages for one field, matched by the start of each issue's path.
  function errorsAt(...path: PropertyKey[]) {
    return issues
      .filter((issue) => path.every((part, i) => issue.path[i] === part))
      .map((issue) => issue.message);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const values: RecipeFormValues = {
      name,
      source,
      sourceUrl,
      // Leave out the React-only key; the server doesn't need it.
      ingredients: rows.map(({ name, quantity, unit, note }) => ({ name, quantity, unit, note })),
      tagIds: [...tagIds],
    };
    startTransition(async () => {
      // On success the action redirects, so a returned value always means failure.
      const result = await createRecipe(values);
      setIssues(result.issues);
    });
  }

  // Issues not shown next to a field: whole-form checks, and ones about the
  // ingredient list as a whole (e.g. "add at least one ingredient").
  const otherIssues = issues.filter((issue) => {
    const [first, second] = issue.path;
    if (first === "ingredients") return second === undefined;
    return !FIELD_KEYS.includes(String(first));
  });

  const tagsByCategory = new Map<string, Tag[]>();
  for (const tag of tags) {
    tagsByCategory.set(tag.category, [...(tagsByCategory.get(tag.category) ?? []), tag]);
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
      {otherIssues.length > 0 && (
        <ul className="rounded-md border border-red-300 p-3 text-sm text-red-600 dark:border-red-800 dark:text-red-400">
          {otherIssues.map((issue, i) => (
            <li key={i}>{issue.message}</li>
          ))}
        </ul>
      )}

      <Field label="Name" errors={errorsAt("name")}>
        <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Source (optional)" errors={errorsAt("source")}>
        <input
          className={inputClass}
          value={source}
          placeholder="e.g. Tiffy Cooks"
          onChange={(e) => setSource(e.target.value)}
        />
      </Field>
      <Field label="Link (optional)" errors={errorsAt("sourceUrl")}>
        <input
          className={inputClass}
          type="url"
          inputMode="url"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium">Ingredients</legend>
        <ul className="mt-2 space-y-3">
          {rows.map((row, index) => (
            <li key={row.key} className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
              <div className="flex gap-2">
                <input
                  className={inputClass}
                  aria-label="Ingredient"
                  placeholder="Ingredient"
                  value={row.name}
                  onChange={(e) => updateRow(row.key, "name", e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                  disabled={rows.length === 1}
                  aria-label="Remove ingredient"
                  className="shrink-0 rounded-md px-3 text-zinc-500 disabled:opacity-30"
                >
                  ✕
                </button>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  className={inputClass}
                  aria-label="Quantity"
                  placeholder="Qty"
                  inputMode="decimal"
                  value={row.quantity}
                  onChange={(e) => updateRow(row.key, "quantity", e.target.value)}
                />
                <input
                  className={inputClass}
                  aria-label="Unit"
                  placeholder="Unit"
                  value={row.unit}
                  onChange={(e) => updateRow(row.key, "unit", e.target.value)}
                />
              </div>
              <input
                className={`${inputClass} mt-2`}
                aria-label="Note"
                placeholder="Note, e.g. minced"
                value={row.note}
                onChange={(e) => updateRow(row.key, "note", e.target.value)}
              />
              {errorsAt("ingredients", index).map((message, i) => (
                <p key={i} className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {message}
                </p>
              ))}
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, emptyRow()])}
          className="mt-3 text-sm font-medium underline underline-offset-4"
        >
          + Add ingredient
        </button>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium">Tags</legend>
        <div className="mt-2 space-y-3">
          {[...tagsByCategory].map(([category, categoryTags]) => (
            <div key={category}>
              <p className="text-xs uppercase tracking-wide text-zinc-500">{category.toLowerCase()}</p>
              <div className="mt-1 flex flex-wrap gap-2">
                {categoryTags.map((tag) => (
                  <label
                    key={tag.id}
                    className="flex items-center gap-1.5 rounded-full border border-zinc-300 px-3 py-1 text-sm has-checked:border-zinc-900 has-checked:bg-zinc-900 has-checked:text-white dark:border-zinc-700 dark:has-checked:border-zinc-100 dark:has-checked:bg-zinc-100 dark:has-checked:text-zinc-900"
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={tagIds.has(tag.id)}
                      onChange={() => toggleTag(tag.id)}
                    />
                    {tag.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        {errorsAt("tagIds").map((message, i) => (
          <p key={i} className="mt-1 text-sm text-red-600 dark:text-red-400">
            {message}
          </p>
        ))}
      </fieldset>

      <button
        type="submit"
        disabled={isSaving}
        className="block w-full rounded-lg bg-zinc-900 px-4 py-3 text-center font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSaving ? "Saving…" : "Save recipe"}
      </button>
    </form>
  );
}

function Field({ label, errors, children }: { label: string; errors: string[]; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1">{children}</div>
      {errors.map((message, i) => (
        <span key={i} className="mt-1 block text-sm text-red-600 dark:text-red-400">
          {message}
        </span>
      ))}
    </label>
  );
}
