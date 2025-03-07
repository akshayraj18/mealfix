export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'shellfish-free'
  | 'soy-free'
  | 'egg-free'
  | 'fish-free'
  | 'halal'
  | 'kosher'
  | 'low-carb'
  | 'keto'
  | 'paleo'
  | 'mediterranean'
  | 'low-fat'
  | 'low-sodium'
  | 'diabetic-friendly';

export interface DietaryPreferences {
  restrictions: DietaryRestriction[];
  allergies: string[];
  dietPlan?: string;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  dietaryInfo: {
    restrictions: DietaryRestriction[];
    allergens: string[];
    dietPlan?: string;
  };
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  imageUrl?: string;
} 