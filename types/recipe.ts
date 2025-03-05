export interface Recipe {
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
} 