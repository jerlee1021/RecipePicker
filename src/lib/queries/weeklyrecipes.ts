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

// Writes a plan, its picks, and its items in one nested atomic create. Choosing the recipes
// happens in the caller (server action), so this stays pure database access.
export async function createPlanWithPicks(userId: number, weekStart: Date, recipeIds: number[]) {
    // Use a transaction to ensure everything is created atomically - all or nothing
    const plan = await prisma.$transaction(async (tx) => {
        const myRecipeCount = await tx.recipe.count({
            where: {
                id: {in: recipeIds},
                userId: userId
            }
        });
        const totalRecipeCount = recipeIds.length;
        if (myRecipeCount !== totalRecipeCount) {
            throw new Error("Some recipe IDs are missing, duplicated, or not owned by this user");
        }
        const recipeIngredients = await tx.recipeIngredient.findMany({
            where: 
            {   
                recipeId: {in: recipeIds},
            },
            select: {
                ingredientId: true,
                quantity: true,
                unit: true,
                recipeId: true
            }
        })
        const userPlan = await tx.weeklyPlan.create({
            data: {
                userId: userId,
                weekStart: weekStart,
                pickedRecipes: {
                    create: recipeIds.map((recipeId) => ({ recipeId }))
                },
                items: {
                    create: recipeIngredients.map((ingredient) => ({
                        ingredientId: ingredient.ingredientId,
                        quantity: ingredient.quantity,
                        unit: ingredient.unit,
                        recipeId: ingredient.recipeId
                    }))
                }
            }
        });
        return userPlan;
    });
    
    return plan;
}

export async function getChecklistForPlan(userId: number, planId: number) {
    const checklist = await prisma.checklistItem.findMany({
        where: {
            planId: planId,
            plan: {userId: userId}
        },
        select: {
            id: true,
            ingredient: {select: {name: true}},
            quantity: true,
            unit: true,
            recipe: {select: {name: true, id: true}},
            checked: true
        },
        orderBy: [
            {recipeId: 'asc'},
            {ingredient: {name: 'asc'}}
        ]
    })

    return checklist;
}
 

export async function setChecklistItemChecked(userId: number, itemId: number, checked: boolean) {
    await prisma.checklistItem.update({
        where: {
            id: itemId,
            plan: {userId: userId}
        },
        data: {
            checked: checked
        }
    })

}
