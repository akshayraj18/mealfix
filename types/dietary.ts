export type DietaryRestriction = 
  | 'vegetarian'
  | 'vegan'
  | 'gluten-free'
  | 'dairy-free'
  | 'nut-free'
  | 'kosher'
  | 'halal'
  | 'soy-free';

export type DietaryAllergies = 
  | 'peanuts'
  | 'tree nuts'
  | 'milk'
  | 'eggs'
  | 'shellfish'
  | 'soy'
  | 'wheat'
  | 'fish';

export type DietaryPlan = 
  | 'keto'
  | 'paleo'
  | 'low-carb'
  | 'high-protein'
  | 'mediterranean'
  | 'intermittent fasting'
  | 'low-sodium'
  | 'plant-based';

export interface DietaryPreferences {
  restrictions: DietaryRestriction[];
  allergies: DietaryAllergies[];
  preferences: DietaryPlan[];
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  dietaryInfo: {
    restrictions: DietaryRestriction[];
    allergens: DietaryAllergies[];
    preferences: DietaryPlan[];
  };
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  imageUrl?: string;
}
