import { Recipe } from '@/types/recipe';
import { RecipeFilters } from '@/components/RecipeFilters';
import { SavedRecipe } from '@/services/savedRecipesService';

/**
 * Count active filters in the RecipeFilters object
 */
export function countActiveFilters(filters: RecipeFilters): number {
  let count = 0;
  
  // Count time range filters
  if (filters.timeRange.min !== null) count++;
  if (filters.timeRange.max !== null) count++;
  
  // Count difficulty filters
  count += filters.difficulty.length;
  
  // Count nutrition filters
  if (filters.nutrition.calories.min !== null) count++;
  if (filters.nutrition.calories.max !== null) count++;
  if (filters.nutrition.protein.min !== null) count++;
  if (filters.nutrition.protein.max !== null) count++;
  
  return count;
}

/**
 * Apply RecipeFilters to filter a list of recipes
 */
export function filterRecipes(recipes: Recipe[], filters: RecipeFilters): Recipe[] {
  if (countActiveFilters(filters) === 0) {
    return recipes; // No filters, return all recipes
  }
  
  return recipes.filter(recipe => {
    // Filter by time
    if (filters.timeRange.min !== null && recipe.timeEstimate < filters.timeRange.min) {
      return false;
    }
    if (filters.timeRange.max !== null && recipe.timeEstimate > filters.timeRange.max) {
      return false;
    }
    
    // Filter by difficulty
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(recipe.difficulty)) {
      return false;
    }
    
    // Filter by calories
    if (filters.nutrition.calories.min !== null && 
        recipe.nutritionInfo.calories < filters.nutrition.calories.min) {
      return false;
    }
    if (filters.nutrition.calories.max !== null && 
        recipe.nutritionInfo.calories > filters.nutrition.calories.max) {
      return false;
    }
    
    // Filter by protein
    if (filters.nutrition.protein.min !== null && 
        recipe.nutritionInfo.protein < filters.nutrition.protein.min) {
      return false;
    }
    if (filters.nutrition.protein.max !== null && 
        recipe.nutritionInfo.protein > filters.nutrition.protein.max) {
      return false;
    }
    
    // If it passed all filters, include it
    return true;
  });
}

/**
 * Apply RecipeFilters to filter a list of saved recipes
 */
export function filterSavedRecipes(savedRecipes: SavedRecipe[], filters: RecipeFilters): SavedRecipe[] {
  if (countActiveFilters(filters) === 0) {
    return savedRecipes; // No filters, return all recipes
  }
  
  return savedRecipes.filter(savedRecipe => {
    const recipe = savedRecipe.recipe;
    
    // Filter by time
    if (filters.timeRange.min !== null && recipe.timeEstimate < filters.timeRange.min) {
      return false;
    }
    if (filters.timeRange.max !== null && recipe.timeEstimate > filters.timeRange.max) {
      return false;
    }
    
    // Filter by difficulty
    if (filters.difficulty.length > 0 && !filters.difficulty.includes(recipe.difficulty)) {
      return false;
    }
    
    // Filter by calories
    if (filters.nutrition.calories.min !== null && 
        recipe.nutritionInfo.calories < filters.nutrition.calories.min) {
      return false;
    }
    if (filters.nutrition.calories.max !== null && 
        recipe.nutritionInfo.calories > filters.nutrition.calories.max) {
      return false;
    }
    
    // Filter by protein
    if (filters.nutrition.protein.min !== null && 
        recipe.nutritionInfo.protein < filters.nutrition.protein.min) {
      return false;
    }
    if (filters.nutrition.protein.max !== null && 
        recipe.nutritionInfo.protein > filters.nutrition.protein.max) {
      return false;
    }
    
    // If it passed all filters, include it
    return true;
  });
} 