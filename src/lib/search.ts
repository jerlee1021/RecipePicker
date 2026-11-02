// Case-insensitive match on recipe name or source (creator). Runs in the browser over
// recipes already loaded; move to a database query once the library is too big to send.
export function searchRecipes<T extends { name: string; source: string | null }>(
  recipes: T[],
  query: string,
  limit = 8,
): T[] {
  const q = query.trim().toLowerCase();
  if (q === "") return [];

  return recipes
    .filter((r) => r.name.toLowerCase().includes(q) || r.source?.toLowerCase().includes(q))
    .slice(0, limit);
}
