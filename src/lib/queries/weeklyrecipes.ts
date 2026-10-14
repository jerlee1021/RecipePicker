import { prisma } from "../prisma";

export async function getRecipesForUser(userId: number) {
    // Implementation for fetching recipes for a specific user
    const userRecipes = await prisma.recipe.findMany({
        where: {
            userId: userId
        },
        select: {
            id: true,
            name: true,
            source: true,
            sourceUrl: true,}
    });
    return userRecipes;
}

export async function getPlanForWeek(userId: number, weekStart: Date) {
    const userPlans = await prisma.weeklyPlan.findUnique({
        where: {
            userId_weekStart: {
                userId: userId,
                weekStart: weekStart
            }
        },
        include: {
            pickedRecipes: {
                include: {
                    recipe: true
                }
            }
        }
    });
    return userPlans;
}

// Writes a plan and its picks in one nested create. Choosing the recipes
// happens in the caller (server action), so this stays pure database access.
export async function createPlanWithPicks(userId: number, weekStart: Date, recipeIds: number[]) {
    const userPlan = await prisma.weeklyPlan.create({
        data: {
            userId: userId,
            weekStart: weekStart,
            pickedRecipes: {
                create: recipeIds.map((recipeId) => ({ recipeId }))
            }
        }
    });
    return userPlan;
}

