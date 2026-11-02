export const PICKS_PER_WEEK = 3;

export function pickRandom<T>(items: T[], count: number): T[] {
    const itemsCopy = [...items];

    for(let i = itemsCopy.length - 1; i > 0; i--) { //fisher-yates shuffle
        const j = Math.floor(Math.random() * (i + 1));
        [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]]; //swap elements
    }

    return itemsCopy.slice(0, count); //get first count elems
}

export function refreshPicks<T extends { id: number }>(allRecipes: T[], currentPicks: T[], heldIds: Set<number>, seenIds: Set<number>): T[] {
    
    //exclude all held and shown picks + shuffle
    const availableRecipes = pickRandom(allRecipes.filter(recipe => !heldIds.has(recipe.id) && !currentPicks.some(pick => pick.id === recipe.id)), allRecipes.filter(recipe => !heldIds.has(recipe.id) && !currentPicks.some(pick => pick.id === recipe.id)).length);

    //unseen should be first, then seen but not shown
    availableRecipes.sort((a, b) => {
        const aSeen = seenIds.has(a.id);
        const bSeen = seenIds.has(b.id);
        if(aSeen && !bSeen) return 1;
        if(!aSeen && bSeen) return -1;
        return 0;
    });

    //replace current picks with available recipes, keeping held picks
    let next = 0;
    const refreshedPicks = currentPicks.map(pick => {
        if(heldIds.has(pick.id)) {
            return pick;
        }
        //replace the current pick with a new available recipe
        const newPick = availableRecipes[next++];
        //if no new pick is available, keep the current pick
        return newPick ?? pick;
    });

    return refreshedPicks;
}

//A: If the selected pick is already in the current picks, it will be held and not replaced.
//B: If the selected pick is not in the current picks, add it by replacing the first unheld slot and hold it 
//C: If there are 3 held picks disable the hold button, do nothing
export function holdFromSearch<T extends { id: number }>(currentPicks: T[], heldIds: Set<number>, recipe: T): { picks: T[]; heldIds: Set<number> } {
    const updatedPicks = [...currentPicks];
    const updatedHeldIds = new Set(heldIds);
    if(!heldIds.has(recipe.id)) {
        //case A, just hold it
        if(currentPicks.some(pick => pick.id === recipe.id)) {
            updatedHeldIds.add(recipe.id);
            return { picks: updatedPicks, heldIds: updatedHeldIds };
        } else {
            const firstUnheldIndex = updatedPicks.findIndex(pick => !updatedHeldIds.has(pick.id));
            //Case B Replace
            if(firstUnheldIndex !== -1) {
                updatedPicks[firstUnheldIndex] = recipe;
                updatedHeldIds.add(recipe.id);
                return { picks: updatedPicks, heldIds: updatedHeldIds };
            }
            //Case C, all picks are held need to disable the hold button in the UI
        }
    }
    return { picks: updatedPicks, heldIds: updatedHeldIds };
}
