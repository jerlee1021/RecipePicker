import { getChecklistForPlan } from "./queries/weeklyrecipes";

// One row returned by getChecklistForPlan, derived so it stays in sync with the query's select.
export type ChecklistItemRow = Awaited<ReturnType<typeof getChecklistForPlan>>[number];

export function groupChecklistByRecipe(checklist: ChecklistItemRow[]) {
    const recipeMap: Map<number, ChecklistItemRow[]> = new Map();
    for (const item of checklist) {
        if (!recipeMap.has(item.recipe.id)) {
            recipeMap.set(item.recipe.id, []);
        }
        recipeMap.get(item.recipe.id)?.push(item);
    }

    return Array.from(recipeMap.entries()).map(([recipeId, items]) => ({
        recipeId,
        recipeName: items[0].recipe.name,
        items
    }));
}