import { db, auth } from '@/config/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  deleteDoc, 
  doc, 
  getDoc, 
  setDoc, 
  serverTimestamp
} from 'firebase/firestore';
import { Recipe } from '@/types/recipe';

const SAVED_RECIPES_COLLECTION = 'savedRecipes';

export interface SavedRecipe {
  id: string;
  userId: string;
  recipe: Recipe;
  savedAt: Date;
}

/**
 * Saves a recipe to the user's saved recipes
 */
export async function saveRecipe(recipe: Recipe): Promise<string> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Check if recipe is already saved
    const existingRecipe = await isRecipeSaved(recipe.name);
    
    if (existingRecipe) {
      return existingRecipe; // Return the ID if it's already saved
    }
    
    // Save new recipe
    const recipeData = {
      userId: user.uid,
      recipe: recipe,
      savedAt: serverTimestamp(),
    };

    const docRef = await addDoc(collection(db, SAVED_RECIPES_COLLECTION), recipeData);
    return docRef.id;
  } catch (error: any) {
    console.error('Error saving recipe:', error);
    throw new Error(`Failed to save recipe: ${error.message}`);
  }
}

/**
 * Checks if a recipe is already saved by the current user
 */
export async function isRecipeSaved(recipeName: string): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const savedRecipesQuery = query(
      collection(db, SAVED_RECIPES_COLLECTION),
      where('userId', '==', user.uid),
      where('recipe.name', '==', recipeName)
    );

    const querySnapshot = await getDocs(savedRecipesQuery);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    
    return null;
  } catch (error: any) {
    console.error('Error checking if recipe is saved:', error);
    throw new Error(`Failed to check if recipe is saved: ${error.message}`);
  }
}

/**
 * Gets all saved recipes for the current user
 */
export async function getSavedRecipes(): Promise<SavedRecipe[]> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const savedRecipesQuery = query(
      collection(db, SAVED_RECIPES_COLLECTION),
      where('userId', '==', user.uid)
    );

    const querySnapshot = await getDocs(savedRecipesQuery);
    
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        recipe: data.recipe as Recipe,
        savedAt: data.savedAt?.toDate() || new Date(),
      };
    });
  } catch (error: any) {
    console.error('Error getting saved recipes:', error);
    throw new Error(`Failed to get saved recipes: ${error.message}`);
  }
}

/**
 * Deletes a saved recipe
 */
export async function deleteRecipe(recipeId: string): Promise<void> {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Verify the recipe belongs to the user before deleting
    const recipeRef = doc(db, SAVED_RECIPES_COLLECTION, recipeId);
    const recipeDoc = await getDoc(recipeRef);
    
    if (!recipeDoc.exists()) {
      throw new Error('Recipe not found');
    }
    
    const recipeData = recipeDoc.data();
    if (recipeData.userId !== user.uid) {
      throw new Error('Unauthorized to delete this recipe');
    }
    
    await deleteDoc(recipeRef);
  } catch (error: any) {
    console.error('Error deleting recipe:', error);
    throw new Error(`Failed to delete recipe: ${error.message}`);
  }
} 