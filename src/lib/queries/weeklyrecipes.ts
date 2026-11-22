import { prisma } from "../prisma";
import type { RecipeInput } from "../recipeInput";

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

// Discriminated union: when deleted is false, reason says why.
export type DeletePlanResult =
    | { deleted: true }
    | { deleted: false; reason: "cooked" | "missing" };

// Deletes the weekly plan for a specific user and week.
// Block delete if a plan has any picked recipes that have been cooked.
export async function deletePlanForWeek(userId: number, weekStart: Date): Promise<DeletePlanResult> {
    const plan = await prisma.weeklyPlan.findUnique({
        where: {
            userId_weekStart: {
                userId: userId,
                weekStart: weekStart
            }
        },
        include: {
            // Count only the cooked picks; any at all blocks the delete
            _count: {
                select: {
                    pickedRecipes: { where: { cookedAt: { not: null } } }
                }
            }
        }
    });

    if (!plan) {
        return { deleted: false, reason: "missing" };
    }

    if (plan._count.pickedRecipes > 0) {
        return { deleted: false, reason: "cooked" };
    }

    await prisma.weeklyPlan.delete({
        where: {
            userId_weekStart: {
                userId: userId,
                weekStart: weekStart
            }
        }
    });
    return { deleted: true };
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

// One nested create, so the recipe, its lines, and its tag links save all-or-nothing.
// Ingredients are shared across users: each line links to the existing row by its
// (already normalized) name, creating it on first use, as the seed does.
// Tags must already exist; connect throws P2025 if an id doesn't.
export async function createRecipeForUser(userId: number, data: RecipeInput) {
    const recipe = await prisma.recipe.create({
        data: {
            userId,
            name: data.name,
            source: data.source,
            sourceUrl: data.sourceUrl,
            ingredients: {
                create: data.ingredients.map((line) => ({
                    quantity: line.quantity,
                    unit: line.unit,
                    note: line.note,
                    ingredient: {
                        connectOrCreate: {
                            where: { name: line.name },
                            create: { name: line.name },
                        },
                    },
                })),
            },
            tags: {
                connect: data.tagIds.map((id) => ({ id })),
            },
        },
    });
    return recipe;
}

// Mark a picked recipe as cooked and attach its rating
export async function markPickCooked(userId:number, pickId:number, rating:number) {
    await prisma.pickedRecipe.update({
        where: {
            id: pickId,
            plan: {userId: userId}, //plan belongs to the user
            cookedAt: null //only update if not already cooked
        },
        data: {
            cookedAt: new Date(),
            rating: rating
        }
    });
}

export async function setPickRating(userId:number, pickId:number, rating:number) {

    await prisma.pickedRecipe.update({
        where: {
            id: pickId,
            plan: {userId: userId}, //plan belongs to the user
            cookedAt: {not: null} //only update if already cooked
        },
        data: {
            rating: rating
        }
    });
}
