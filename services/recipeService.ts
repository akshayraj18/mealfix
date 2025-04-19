import { groq } from '@/config/groq';
import { Recipe } from '@/types/recipe';
import { DietaryPreferences } from '@/types/dietary';
import { logEvent, RecipeEvents } from '@/config/firebase';
import { 
  trackRecipeGenerationComplete, 
  trackError,
  trackPerformanceMetric 
} from '@/services/analyticsService';

import { db, auth } from '@/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

interface GenerateRecipesResponse {
  recipes: Recipe[] | null;
  error: string | null;
}

export async function generateRecipeSuggestions(
  ingredients: string,
  dietaryPreferences: DietaryPreferences
): Promise<GenerateRecipesResponse> {
  // Record the start time for performance tracking
  const startTime = performance.now();
  
  try {
    // Get the current user
    const user = auth.currentUser;
    if (!user) {
      console.log('No authenticated user found when generating recipes');
    }
    
    let pantryItems: string[] = [];
    
    // Only fetch pantry items if a user is logged in
    if (user) {
      const PANTRY_COLLECTION = 'pantryItems';
      const docRef = doc(db, PANTRY_COLLECTION, user.uid);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        pantryItems = (data.items || []) as string[];
      }
    }

    // 🔹 Append pantry items if available
    const allIngredients = pantryItems.length > 0
      ? `${ingredients}, ${pantryItems.join(', ')}`
      : ingredients;

    // 🔹 Log start of recipe generation
    await logEvent(RecipeEvents.GENERATE_RECIPE, {
      ingredientCount: allIngredients.split(',').length,
      dietaryRestrictions: dietaryPreferences.restrictions,
      allergies: dietaryPreferences.allergies,
      dietPlan: dietaryPreferences.preferences
    });

    const dietaryInfo = `
Dietary Restrictions: ${dietaryPreferences.restrictions.join(', ') || 'None'}
Allergies: ${dietaryPreferences.allergies.join(', ') || 'None'}
Diet Plan: ${dietaryPreferences.preferences || 'None'}`;

    const prompt = `Given these ingredients: ${allIngredients}

${dietaryInfo}

Please suggest 3 different dishes I could make that respect these dietary requirements. 
Create 2 completely unique and innovative dishes that incorporate these ingredients in unexpected ways and keep 1 as somewhat basic.
When regenerating, all recipes should be unique, meaning the dish should not be similar in any way to the previous recipes.
Don't just make the given ingredients as stars of the dish - find creative supporting roles for them and add plenty of extra ingredients for a complex dish.
For each dish, provide the information in this exact format:

NAME: [Creative dish name]
DIFFICULTY: [Beginner/Intermediate/Advanced]
TIME: [Estimated minutes to prepare and cook]
COST: [Total cost of extra ingredients needed in USD]
DIETARY_INFO: [List of dietary restrictions and allergens this recipe is compatible with]
NUTRITION_INFO: [Nutritional breakdown in the following format:]
* Calories: [total calories per serving]
* Protein: [grams of protein per serving]
* Fat: [grams of fat per serving]
* Carbs: [grams of carbohydrates per serving]
* Fiber: [grams of fiber per serving]
* Sugar: [grams of sugar per serving]
* Sodium: [milligrams of sodium per serving]
* Servings: [number of servings this recipe makes]
CURRENT_INGREDIENTS: [List ingredients from user's input that will be used, one per line with * bullet points. For each ingredient that has a common substitution, include it in parentheses after the ingredient like: "* chicken (or tofu for vegetarian)"]
EXTRA_INGREDIENTS: [List additional ingredients needed with their estimated costs and amounts, one per line with * bullet points, format: "* item ($X.XX for amount) (or substitute for dietary needs)"]
INSTRUCTIONS: [Numbered steps of cooking steps with DETAILED directions, including time per step, warnings (e.g., 'hot oil'), and utensils needed (e.g., 'whisk').]

For each recipe, include at least one suggested substitution either in the CURRENT_INGREDIENTS or EXTRA_INGREDIENTS sections.
For each step in the cooking instructions, add a "(Time: x minutes)" at the end of the step. Each step needs to be as descriptive as possible so a beginner can understand. 

Keep the format consistent and make sure to include all sections for each recipe. Separate recipes with ---`;

    // Track API call start time
    const apiStartTime = performance.now();
    
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1500,
    });
    
    // Calculate and track API latency
    const apiEndTime = performance.now();
    trackPerformanceMetric('llm_api_latency', apiEndTime - apiStartTime);

    // Log the LLM response
    await logEvent(RecipeEvents.LLM_RESPONSE, {
      success: true,
      responseLength: response.choices[0]?.message?.content?.length || 0,
      model: "llama-3.3-70b-versatile",
      latency_ms: Math.round(apiEndTime - apiStartTime)
    });

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
      await logEvent(RecipeEvents.RECIPE_ERROR, {
        error: 'No content in LLM response',
        stage: 'content_check'
      });
      trackError('recipe_generation', 'No content in LLM response');
      return { recipes: null, error: 'Failed to generate suggestions. Please try again.' };
    }

    // Parse the response into Recipe objects
    const recipeTexts = content.split('---').filter((text: string) => text.trim());
    const recipes: Recipe[] = recipeTexts.map((recipeText: string) => {
      const lines = recipeText.trim().split('\n');
      const recipe: Partial<Recipe> = {
        currentIngredients: [],
        extraIngredients: [],
        instructions: [],
        dietaryInfo: {
          restrictions: [],
          allergens: []
        },
        nutritionInfo: {
          calories: 0,
          protein: 0,
          fat: 0,
          carbs: 0,
          fiber: 0,
          sugar: 0,
          sodium: 0,
          servings: 1
        }
      };

      let currentSection = '';
      
      lines.forEach((line: string) => {
        line = line.trim();
        if (!line) return;

        if (line.startsWith('NAME:')) {
          recipe.name = line.replace('NAME:', '').trim();
        } else if (line.startsWith('DIFFICULTY:')) {
          recipe.difficulty = line.replace('DIFFICULTY:', '').trim();
        } else if (line.startsWith('TIME:')) {
          recipe.timeEstimate = parseInt(line.replace('TIME:', '').replace('minutes', '').trim());
        } else if (line.startsWith('COST:')) {
          recipe.extraIngredientsCost = parseFloat(line.replace('COST:', '').replace('$', '').trim());
        } else if (line.startsWith('DIETARY_INFO:')) {
          currentSection = 'dietary';
        } else if (line.startsWith('NUTRITION_INFO:')) {
          currentSection = 'nutrition';
        } else if (line.startsWith('CURRENT_INGREDIENTS:')) {
          currentSection = 'current';
        } else if (line.startsWith('EXTRA_INGREDIENTS:')) {
          currentSection = 'extra';
        } else if (line.startsWith('INSTRUCTIONS:')) {
          currentSection = 'instructions';
        } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          const item = line.replace('•', '').replace('-', '').replace('*', '').trim();
          if (currentSection === 'current') {
            recipe.currentIngredients?.push(item);
          } else if (currentSection === 'extra') {
            const match = item.match(/(.*?)\s*\((\$[\d.]+)\s+for\s+(.*?)\)/);
            if (match) {
              recipe.extraIngredients?.push({
                item: match[1].trim(),
                cost: parseFloat(match[2].replace('$', '')),
                amount: match[3].trim()
              });
            } else {
              // Handle case where the format doesn't match exactly
              recipe.extraIngredients?.push({
                item: item,
                cost: 0,
                amount: 'unknown'
              });
            }
          } else if (currentSection === 'dietary') {
            // Parse dietary info into restrictions and allergens
            const dietaryItem = item.toLowerCase();
            if (dietaryItem.includes('free') || dietaryItem.includes('vegetarian') || dietaryItem.includes('vegan')) {
              recipe.dietaryInfo?.restrictions.push(dietaryItem);
            } else {
              recipe.dietaryInfo?.allergens.push(dietaryItem);
            }
          } else if (currentSection === 'nutrition') {
            // Parse nutrition info
            if (item.startsWith('Calories:')) {
              recipe.nutritionInfo!.calories = parseInt(item.replace('Calories:', '').trim());
            } else if (item.startsWith('Protein:')) {
              recipe.nutritionInfo!.protein = parseInt(item.replace('Protein:', '').replace('g', '').trim());
            } else if (item.startsWith('Fat:')) {
              recipe.nutritionInfo!.fat = parseInt(item.replace('Fat:', '').replace('g', '').trim());
            } else if (item.startsWith('Carbs:')) {
              recipe.nutritionInfo!.carbs = parseInt(item.replace('Carbs:', '').replace('g', '').trim());
            } else if (item.startsWith('Fiber:')) {
              recipe.nutritionInfo!.fiber = parseInt(item.replace('Fiber:', '').replace('g', '').trim());
            } else if (item.startsWith('Sugar:')) {
              recipe.nutritionInfo!.sugar = parseInt(item.replace('Sugar:', '').replace('g', '').trim());
            } else if (item.startsWith('Sodium:')) {
              recipe.nutritionInfo!.sodium = parseInt(item.replace('Sodium:', '').replace('mg', '').trim());
            } else if (item.startsWith('Servings:')) {
              recipe.nutritionInfo!.servings = parseInt(item.replace('Servings:', '').trim());
            }
          }
        } else if (line.match(/^\d+\./)) {
          if (currentSection === 'instructions') {
            recipe.instructions?.push(line.replace(/^\d+\.\s*/, ''));
          }
        } else if (currentSection === 'instructions' && line.trim()) {
          // Capture any non-empty line in the instructions section that might not start with a number
          recipe.instructions?.push(line.trim());
        }
      });

      // Debug log to check recipe structure
      console.log('Parsed recipe:', JSON.stringify({
        name: recipe.name,
        instructionsCount: recipe.instructions?.length || 0,
        currentIngredientsCount: recipe.currentIngredients?.length || 0,
        extraIngredientsCount: recipe.extraIngredients?.length || 0,
        dietaryInfo: recipe.dietaryInfo
      }));

      return recipe as Recipe; // Type assertion since we've built all required fields
    });
    
    // Calculate total generation time and track it
    const endTime = performance.now();
    const totalTimeMs = Math.round(endTime - startTime);
    
    // Track recipe generation completion
    trackRecipeGenerationComplete(
      ingredients.split(',').length,
      recipes.length,
      totalTimeMs
    );
    
    // Track overall performance
    trackPerformanceMetric('recipe_generation_total_time', totalTimeMs);

    return { recipes, error: null };
  } catch (error: any) {
    // Log and track error
    console.error('Error generating recipe suggestions:', error);
    await logEvent(RecipeEvents.RECIPE_ERROR, {
      error: error.message || 'Unknown error',
      stage: 'api_call'
    });
    
    trackError('recipe_generation', error.message || 'Unknown error', error.stack);
    
    return { recipes: null, error: 'Failed to generate suggestions. Please try again.' };
  }
} 