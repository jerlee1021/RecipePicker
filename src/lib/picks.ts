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
