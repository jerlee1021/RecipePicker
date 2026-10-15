// Seeds the database with one user and the recipes in seed-data.ts.
// Run with: npx prisma db seed
// Safe to re-run: it reuses the user and skips recipes that already exist.
import "dotenv/config"; // must come first: loads .env before the client reads it
import { prisma } from "../src/lib/prisma";
import { SEED_USER_EMAIL } from "../src/lib/currentUser";
import { seedRecipes } from "./seed-data";

async function main() {
  // upsert = update if it exists, insert if it doesn't. `update: {}` means
  // "if it exists, change nothing", so re-runs reuse the same user.
  const user = await prisma.user.upsert({
    where: { email: SEED_USER_EMAIL },
    update: {},
    create: { email: SEED_USER_EMAIL },
  });

  let created = 0;
  let skipped = 0;

  // One recipe at a time (not Promise.all): recipes share ingredients and tags,
  // and two parallel connectOrCreates for "garlic" could both try to insert it.
  for (const recipe of seedRecipes) {
    // Recipe names aren't unique in the schema, so check for an existing one
    // by hand to avoid duplicating recipes on re-runs.
    const existing = await prisma.recipe.findFirst({
      where: { userId: user.id, name: recipe.name },
      select: { id: true },
    });
    if (existing) {
      skipped++;
      continue;
    }

    // One nested write creates the recipe, its RecipeIngredient rows, and its
    // tag links, inside a single transaction.
    await prisma.recipe.create({
      data: {
        name: recipe.name,
        source: recipe.source,
        sourceUrl: recipe.sourceUrl,
        user: { connect: { id: user.id } },
        tags: {
          // Link to the existing tag with this (category, name), or create it.
          connectOrCreate: recipe.tags.map((tag) => ({
            where: { category_name: { category: tag.category, name: tag.name } },
            create: { category: tag.category, name: tag.name },
          })),
        },
        ingredients: {
          // Each entry is one RecipeIngredient row (one line of this recipe).
          create: recipe.ingredients.map((line) => ({
            quantity: line.quantity,
            unit: line.unit,
            note: line.note,
            // Link the line to the shared Ingredient, creating it on first use.
            ingredient: {
              connectOrCreate: {
                where: { name: line.name },
                create: { name: line.name },
              },
            },
          })),
        },
      },
    });
    created++;
  }

  console.log(`Seeded user ${user.email}: ${created} recipes created, ${skipped} already existed.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect()); // close connections so the script can exit
