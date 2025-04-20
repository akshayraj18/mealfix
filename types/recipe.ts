export interface Recipe {
  id?: string;
  name: string;
  timeEstimate: number;
  difficulty: string;
  extraIngredientsCost: number;
  currentIngredients: string[];
  extraIngredients: {
    item: string;
    cost: number;
    amount: string;
  }[];
  instructions: string[];
  dietaryInfo: {
    restrictions: string[];
    allergens: string[];
  };
  nutritionInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
    sodium: number;
    servings: number;
  };
} 