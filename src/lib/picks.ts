export function pickRandom<T>(items: T[], count: number): T[] {
    const itemsCopy = [...items];

    for(let i = itemsCopy.length - 1; i > 0; i--) { //fisher-yates shuffle
        const j = Math.floor(Math.random() * (i + 1));
        [itemsCopy[i], itemsCopy[j]] = [itemsCopy[j], itemsCopy[i]]; //swap elements
    }

    return itemsCopy.slice(0, count); //get first count elems
}