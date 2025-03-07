import { groq } from '@/config/groq';
import { Recipe } from '@/types/recipe';
import { DietaryPreferences } from '@/types/dietary';

interface GenerateRecipesResponse {
  recipes: Recipe[] | null;
  error: string | null;
}

export async function generateRecipeSuggestions(
  ingredients: string,
  dietaryPreferences: DietaryPreferences
): Promise<GenerateRecipesResponse> {
  try {
    const dietaryInfo = `
Dietary Restrictions: ${dietaryPreferences.restrictions.join(', ') || 'None'}
Allergies: ${dietaryPreferences.allergies.join(', ') || 'None'}
Diet Plan: ${dietaryPreferences.dietPlan || 'None'}`;

    const prompt = `Given these ingredients: ${ingredients}

${dietaryInfo}

Please suggest 3 different dishes I could make that respect these dietary requirements. For each dish, provide the information in this exact format:

NAME: [Creative dish name]
DIFFICULTY: [Beginner/Intermediate/Advanced]
TIME: [Estimated minutes to prepare and cook]
COST: [Total cost of extra ingredients needed in USD]
DIETARY_INFO: [List of dietary restrictions and allergens this recipe is compatible with]
CURRENT_INGREDIENTS: [List ingredients from user's input that will be used, one per line with * bullet points]
EXTRA_INGREDIENTS: [List additional ingredients needed with their estimated costs and amounts, one per line with * bullet points, format: "* item ($X.XX for amount)"]
INSTRUCTIONS: [Numbered list of cooking steps]

Keep the format consistent and make sure to include all sections for each recipe. Separate recipes with ---`;

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

    const content = response.choices[0]?.message?.content;
    
    if (!content) {
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

      return recipe as Recipe;
    });

    return { recipes, error: null };
  } catch (error: any) {
    console.error('Error generating recipes:', error);
    return {
      recipes: null,
      error: error.message || 'Failed to generate suggestions. Please try again.'
    };
  }
} 