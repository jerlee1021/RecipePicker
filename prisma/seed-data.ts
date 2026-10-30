import type { TagCategory } from "../src/generated/prisma/enums";

// Ingredient names are canonical: lowercase, singular, the thing you buy.
// Anything specific to one recipe (prep, variety, "for garnish") goes in note.
// Each ingredient appears at most once per recipe; duplicates are combined.

type SeedIngredient = {
  name: string;
  quantity: number | null; // null = "to taste" / unspecified
  unit: string | null;
  note?: string;
};

type SeedRecipe = {
  name: string;
  source: string | null; // null for my own recipes
  sourceUrl: string | null;
  tags: { category: TagCategory; name: string }[];
  ingredients: SeedIngredient[];
};

export const seedRecipes: SeedRecipe[] = [
  {
    name: "Creamy Coconut Curry Chicken",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/one-pot-creamy-coconut-curry-chicken/",
    tags: [
      { category: "CUISINE", name: "japanese" },
      { category: "PROTEIN", name: "chicken" },
      { category: "METHOD", name: "one-pot" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "comfort" },
    ],
    ingredients: [
      { name: "chicken thigh", quantity: 4, unit: null, note: "boneless, skin-on" },
      { name: "paprika", quantity: 1, unit: "tsp" },
      { name: "garlic powder", quantity: 1, unit: "tsp" },
      { name: "curry powder", quantity: 1, unit: "tsp" },
      { name: "turmeric", quantity: 0.5, unit: "tsp" },
      { name: "salt", quantity: null, unit: null },
      { name: "black pepper", quantity: null, unit: null },
      { name: "olive oil", quantity: 1, unit: "tbsp" },
      { name: "yellow onion", quantity: 0.5, unit: null, note: "finely chopped" },
      { name: "garlic", quantity: 1, unit: "tbsp", note: "minced" },
      { name: "coconut milk", quantity: 1.5, unit: "cup" },
      { name: "japanese curry cube", quantity: 2, unit: null },
      { name: "rice", quantity: null, unit: null, note: "cooked, to serve" },
      { name: "green onion", quantity: null, unit: null, note: "chopped, for garnish" },
      { name: "red pepper flakes", quantity: null, unit: null },
    ],
  },
  {
    name: "15 Minute Thai Inspired Holy Basil Pork Stir Fry",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/thai-inspired-four-season-holy-basil-pork-stir-fry/",
    tags: [
      { category: "CUISINE", name: "thai" },
      { category: "PROTEIN", name: "pork" },
      { category: "METHOD", name: "stir-fry" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "adjacent" },
    ],
    ingredients: [
      { name: "ground pork", quantity: 300, unit: "g", note: "or ground chicken" },
      { name: "garlic", quantity: 1, unit: "tbsp", note: "minced" },
      { name: "thai bird's eye chili", quantity: 2, unit: null, note: "chopped" },
      { name: "green bean", quantity: 1, unit: "cup", note: "chopped" },
      { name: "oyster sauce", quantity: 2, unit: "tbsp" },
      { name: "soy sauce", quantity: 2, unit: "tbsp" },
      { name: "honey", quantity: 0.5, unit: "tbsp" },
      { name: "thai holy basil", quantity: 1, unit: "cup", note: "fresh leaves" },
      { name: "egg", quantity: 2, unit: null, note: "for topping" },
    ],
  },
  {
    name: "One Pot Thai Crispy Chicken with Ginger Scallion Rice",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/one-pot-thai-crispy-chicken-with-ginger-scallion-rice/",
    tags: [
      { category: "CUISINE", name: "thai" },
      { category: "PROTEIN", name: "chicken" },
      { category: "METHOD", name: "one-pot" },
      { category: "EFFORT", name: "medium" },
      { category: "STRETCH", name: "adjacent" },
    ],
    ingredients: [
      { name: "chicken thigh", quantity: 4, unit: null, note: "boneless, skin-on" },
      { name: "salt", quantity: null, unit: null },
      { name: "black pepper", quantity: null, unit: null },
      { name: "green onion", quantity: 4, unit: "stalk", note: "chopped, white and green separated" },
      { name: "ginger", quantity: 1, unit: "tbsp", note: "fresh, grated" },
      { name: "jasmine rice", quantity: 1, unit: "cup", note: "rinsed and drained" },
      { name: "chicken stock", quantity: 1.25, unit: "cup" },
      { name: "soy sauce", quantity: 1, unit: "tbsp" },
      { name: "bay leaf", quantity: 1, unit: null },
      { name: "thai red chili", quantity: null, unit: null, note: "sliced, for serving" },
    ],
  },
  {
    name: "Beef Gyudon",
    source: "The Woks of Life",
    sourceUrl: "https://thewoksoflife.com/gyudon-recipe-beef-rice/#recipe",
    tags: [
      { category: "CUISINE", name: "japanese" },
      { category: "PROTEIN", name: "beef" },
      { category: "METHOD", name: "simmer" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "comfort" },
    ],
    ingredients: [
      { name: "neutral oil", quantity: null, unit: null },
      { name: "yellow onion", quantity: 2, unit: null, note: "medium, very thinly sliced" },
      { name: "beef", quantity: 1, unit: "lb", note: "very thinly sliced, fatty chuck or ribeye" },
      { name: "sugar", quantity: 2, unit: "tsp" },
      { name: "mirin", quantity: 2, unit: "tbsp" },
      { name: "soy sauce", quantity: 2, unit: "tbsp" },
      { name: "dashi stock", quantity: 1, unit: "cup", note: "or beef/chicken stock" },
      { name: "egg", quantity: 4, unit: null },
      { name: "rice", quantity: 4, unit: "cup", note: "cooked white rice" },
      { name: "green onion", quantity: 1, unit: null, note: "chopped" },
      { name: "sesame seed", quantity: 2, unit: "tsp", note: "toasted" },
    ],
  },
  {
    name: "Chicken Oyakodon",
    source: null,
    sourceUrl: null,
    tags: [
      { category: "CUISINE", name: "japanese" },
      { category: "PROTEIN", name: "chicken" },
      { category: "METHOD", name: "simmer" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "comfort" },
    ],
    ingredients: [
      { name: "green onion", quantity: 1, unit: null },
      { name: "mirin", quantity: 0.5, unit: "cup", note: "aji-mirin" },
      { name: "soy sauce", quantity: 0.5, unit: "cup" },
      { name: "dashi powder", quantity: 1, unit: "tbsp" },
      { name: "egg", quantity: 4, unit: null },
      { name: "chicken thigh", quantity: 1.5, unit: "lb" },
      { name: "yellow onion", quantity: 1, unit: null },
    ],
  },
  {
    name: "Mapo Tofu",
    source: null,
    sourceUrl: null,
    tags: [
      { category: "CUISINE", name: "chinese" },
      { category: "PROTEIN", name: "tofu" },
      { category: "METHOD", name: "simmer" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "comfort" },
    ],
    ingredients: [
      { name: "silken tofu", quantity: 1, unit: null },
      { name: "green onion", quantity: 1, unit: null },
      { name: "garlic", quantity: 4, unit: "clove" },
      { name: "soybean sauce", quantity: 1, unit: "spoonful" },
      { name: "doubanjiang", quantity: 1, unit: "spoonful", note: "chili hot bean sauce" },
      { name: "oyster sauce", quantity: 1, unit: "tbsp" },
      { name: "chicken stock", quantity: 0.5, unit: "cup", note: "or broth" },
      { name: "chinese cooking wine", quantity: null, unit: null },
    ],
  },
  {
    name: "One-Pot Steak & Mushroom Butter Rice",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/one-pot-steak-mushroom-rice/",
    tags: [
      { category: "CUISINE", name: "japanese" },
      { category: "PROTEIN", name: "beef" },
      { category: "METHOD", name: "pan-sear" },
      { category: "EFFORT", name: "medium" },
      { category: "STRETCH", name: "adjacent" },
    ],
    ingredients: [
      { name: "ribeye steak", quantity: 1, unit: null, note: "thick-cut, 12-16 oz" },
      { name: "salt", quantity: null, unit: null },
      { name: "black pepper", quantity: null, unit: null, note: "freshly ground" },
      { name: "neutral oil", quantity: 1, unit: "tbsp" },
      { name: "mixed mushrooms", quantity: 8, unit: "oz", note: "shiitake, oyster, shimeji; sliced or torn" },
      { name: "shallot", quantity: 1, unit: null, note: "small, finely chopped" },
      { name: "rice", quantity: 2, unit: "cup", note: "cooked, cold" },
      // Combined: 1.5 tbsp (4.5 tsp) for the rice + 1 tsp for the optional steak jus
      { name: "soy sauce", quantity: 5.5, unit: "tsp", note: "includes 1 tsp for optional steak jus" },
      // Combined: 1 tbsp (3 tsp) for the rice + 1 tsp for the optional steak jus
      { name: "mirin", quantity: 4, unit: "tsp", note: "includes 1 tsp for optional steak jus" },
      { name: "dashi powder", quantity: 1, unit: "tsp", note: "plus a pinch for optional steak jus" },
      { name: "butter", quantity: 1, unit: "tbsp" },
      { name: "green onion", quantity: 2, unit: null, note: "chopped" },
      { name: "chive", quantity: 1, unit: "tbsp", note: "finely chopped" },
    ],
  },
  {
    name: "Taiwanese-Inspired Birria Tacos",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/taiwanese-inspired-birria-tacos-instant-pot-or-stove/",
    tags: [
      { category: "CUISINE", name: "taiwanese" },
      { category: "CUISINE", name: "mexican" },
      { category: "PROTEIN", name: "beef" },
      { category: "METHOD", name: "braise" },
      { category: "EFFORT", name: "hard" },
      { category: "STRETCH", name: "new" },
    ],
    ingredients: [
      { name: "beef short rib", quantity: 3, unit: "lb", note: "cut into large chunks" },
      { name: "salt", quantity: null, unit: null },
      { name: "black pepper", quantity: null, unit: null },
      { name: "neutral oil", quantity: 1, unit: "tbsp" },
      { name: "yellow onion", quantity: 1, unit: null, note: "roughly chopped" },
      { name: "tomato", quantity: 5, unit: null, note: "roughly chopped" },
      { name: "garlic", quantity: 8, unit: "clove" },
      { name: "dried red chili", quantity: 5, unit: null, note: "seeds removed" },
      { name: "doubanjiang", quantity: 2, unit: "tbsp", note: "spicy fermented bean paste" },
      // Combined: 2 cups for blending + 2 cups for braising
      { name: "beef stock", quantity: 4, unit: "cup", note: "or water; 2 cups for blending, 2 for braising" },
      { name: "soy sauce", quantity: 3, unit: "tbsp" },
      { name: "chinese cooking wine", quantity: 2, unit: "tbsp" },
      { name: "sugar", quantity: 1, unit: "tbsp" },
      { name: "bay leaf", quantity: 2, unit: null },
      { name: "corn tortilla", quantity: null, unit: null },
      { name: "shredded cheese", quantity: null, unit: null, note: "mozzarella, Oaxaca, or Monterey Jack" },
      { name: "cilantro", quantity: null, unit: null, note: "chopped" },
      { name: "green onion", quantity: null, unit: null, note: "chopped" },
      { name: "white onion", quantity: null, unit: null, note: "diced" },
      { name: "lime", quantity: null, unit: null, note: "cut into wedges" },
    ],
  },
  {
    name: "Chinese Tomato Egg Stir Fry with Beef",
    source: "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/chinese-tomato-egg-stir-fry-with-beef/",
    tags: [
      { category: "CUISINE", name: "chinese" },
      { category: "PROTEIN", name: "beef" },
      { category: "METHOD", name: "stir-fry" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "comfort" },
    ],
    ingredients: [
      { name: "egg", quantity: 3, unit: null },
      { name: "salt", quantity: null, unit: null },
      { name: "tomato", quantity: 4, unit: null, note: "medium" },
      { name: "green onion", quantity: null, unit: null, note: "chopped, for garnish" },
      { name: "beef", quantity: 1, unit: "lb", note: "sliced" },
      { name: "oyster sauce", quantity: 2, unit: "tbsp" },
      { name: "neutral oil", quantity: 1.5, unit: "tbsp" },
      { name: "black pepper", quantity: 0.5, unit: "tsp" },
      { name: "cornstarch", quantity: 3, unit: "tbsp" },
      { name: "garlic", quantity: 0.5, unit: "tbsp", note: "minced" },
      { name: "white pepper", quantity: 0.5, unit: "tsp" },
      { name: "ketchup", quantity: 2.5, unit: "tbsp" },
      { name: "soy sauce", quantity: 1.5, unit: "tbsp" },
      { name: "water", quantity: 2, unit: "tbsp", note: "cold" },
    ],
  },
  {
    name: "Kimchi Spam Onigirazu",
    source:  "Tiffy Cooks",
    sourceUrl: "https://tiffycooks.com/kimchi-spam-onigirazu-easy-10-minute-lunch/",
    tags: [
      { category: "CUISINE", name: "korean" },
      { category: "CUISINE", name: "japanese" },
      { category: "PROTEIN", name: "spam" },
      { category: "METHOD", name: "assemble" },
      { category: "EFFORT", name: "easy" },
      { category: "STRETCH", name: "adjacent" },
    ],
    ingredients: [
      { name: "spam", quantity: 2, unit: "slice" },
      { name: "kimchi", quantity: 0.25, unit: "cup", note: "chopped" },
      { name: "sesame oil", quantity: 1, unit: "tsp" },
      { name: "rice", quantity: 0.66, unit: "cup", note: "cooked" },
      { name: "perilla leaf", quantity: 2, unit: null, note: "optional" },
      { name: "cucumber", quantity: 8, unit: "slice", note: "thin" },
      { name: "roasted seaweed", quantity: 2, unit: "sheet" },
    ],
  },
];
