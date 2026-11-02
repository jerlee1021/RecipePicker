import { z } from "zod";

// Validates and cleans what the recipe form sends (RecipeFormValues: all strings,
// plus tag ids). What comes out is typed and normalized, ready for the database.

// Blank means "not given", stored as null rather than "".
const optionalText = z
  .string()
  .trim()
  .max(500)
  .transform((s) => (s === "" ? undefined : s));

// "" is "no quantity" (salt to taste), not 0: Number("") would quietly be 0.
const quantity = z
  .string()
  .trim()
  .transform((s) => (s === "" ? undefined : Number(s)))
  .pipe(
    z
      .number({ error: "Quantity must be a number, like 1.5" })
      .positive("Quantity must be more than 0")
      .optional(),
  );

// Only http(s): sourceUrl is rendered as a link, and a javascript: URL would run on tap.
const optionalUrl = z
  .string()
  .trim()
  .transform((s) => (s === "" ? undefined : s))
  .pipe(z.url({ protocol: /^https?$/, error: "Must be a link starting with http:// or https://" }).optional());

// Ingredients are shared across users and matched by exact name, so normalize to the
// seed's style (lowercase, single spaces) or "Garlic " becomes a second garlic.
const ingredientName = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Ingredient name is required")
  .max(100)
  .transform((s) => s.replace(/\s+/g, " "));

const ingredientRow = z.object({
  name: ingredientName,
  quantity,
  unit: optionalText,
  note: optionalText,
});

export const RecipeInput = z.object({
  name: z.string().trim().min(1, "Give the recipe a name").max(200),
  source: optionalText,
  sourceUrl: optionalUrl,
  ingredients: z
    .array(ingredientRow)
    .min(1, "Add at least one ingredient")
    .max(100)
    // Runs after the rows are normalized, so "Garlic" and "garlic " count as the same.
    // RecipeIngredient's key is (recipeId, ingredientId): a repeat can't be saved.
    .superRefine((rows, ctx) => {
      const seen = new Set<string>();
      rows.forEach((row, index) => {
        if (seen.has(row.name)) {
          ctx.addIssue({
            code: "custom",
            message: `${row.name} is listed twice. Combine them into one line.`,
            path: [index, "name"],
          });
        }
        seen.add(row.name);
      });
    }),
  tagIds: z
    .array(z.number().int().positive())
    .max(50)
    .transform((ids) => [...new Set(ids)]),
});

export type RecipeInput = z.infer<typeof RecipeInput>;
