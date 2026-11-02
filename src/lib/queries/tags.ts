import { prisma } from "../prisma";

// Tags are a shared fixed list (not per-user), grouped by category in the form.
export async function getAllTags() {
  const tags = await prisma.tag.findMany({
    orderBy: [{ category: "asc" }, { name: "asc" }],
  });
  return tags;
}
