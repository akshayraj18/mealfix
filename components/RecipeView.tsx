import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Share, Alert } from 'react-native';
import { Recipe } from '@/types/recipe';
import { saveRecipe, isRecipeSaved, deleteRecipe } from '@/services/savedRecipesService';
import { trackRecipeView, trackRecipeShare, trackRecipeRating, trackRecipeSave } from '@/services/analyticsService';
import { useAnalytics } from '@/hooks/useAnalytics';
import { AntDesign } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NutritionInfo from './NutritionInfo';

interface RecipeViewProps {
  recipe: Recipe;
  onClose?: () => void;
}

export default function RecipeView({ recipe, onClose }: RecipeViewProps) {
  const [saved, setSaved] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Use the analytics hook to track screen time and interactions
  const { trackInteraction } = useAnalytics({
    screenName: `recipe_${recipe.name.replace(/\s+/g, '_').toLowerCase()}`,
  });
  
  // Check if the recipe is already saved when the component mounts
  useEffect(() => {
    // Track recipe view when component mounts
    trackRecipeView(recipe);
    
    // Check if recipe is already saved
    const checkSavedStatus = async () => {
      try {
        const recipeId = await isRecipeSaved(recipe.name);
        setSaved(!!recipeId);
        setSavedId(recipeId);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    
    checkSavedStatus();
  }, [recipe]);
  
  // Handle save/unsave recipe
  const handleSaveToggle = async () => {
    trackInteraction('save_toggle_button');
    setLoading(true);
    
    try {
      if (saved && savedId) {
        await deleteRecipe(savedId);
        setSaved(false);
        setSavedId(null);
        // Track recipe unsave
        trackRecipeSave(recipe, false);
      } else {
        const id = await saveRecipe(recipe);
        setSaved(true);
        setSavedId(id);
        // Track recipe save
        trackRecipeSave(recipe, true);
      }
    } catch (error) {
      console.error('Error toggling save status:', error);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle sharing the recipe
  const handleShare = async () => {
    trackInteraction('share_button');
    
    try {
      // Format recipe as text for sharing
      const recipeText = `
${recipe.name}
Difficulty: ${recipe.difficulty}
Time: ${recipe.timeEstimate} minutes
Cost: $${recipe.extraIngredientsCost.toFixed(2)}

Ingredients:
${recipe.currentIngredients.map(i => `• ${i}`).join('\n')}
${recipe.extraIngredients.map(i => `• ${i.item} (${i.amount})`).join('\n')}

Instructions:
${recipe.instructions.map((step, index) => `${index + 1}. ${step}`).join('\n')}
      `.trim();
      
      const result = await Share.share({
        message: recipeText,
        title: recipe.name
      });
      
      if (result.action === Share.sharedAction) {
        trackRecipeShare(recipe.name, result.activityType || 'unknown');
      }
    } catch (error) {
      console.error('Error sharing recipe:', error);
    }
  };
  
  // Handle rating the recipe
  const handleRate = (rating: number) => {
    setUserRating(rating);
    trackRecipeRating(recipe.name, rating);
    trackInteraction('rate_recipe', { rating });
  };
  
  return (
    <View style={styles.container}>
      {onClose && (
        <TouchableOpacity 
          style={styles.closeButton} 
          onPress={() => {
            trackInteraction('close_button');
            onClose();
          }}
        >
          <AntDesign name="close" size={24} color="black" />
        </TouchableOpacity>
      )}
      
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{recipe.name}</Text>
          <View style={styles.metaInfo}>
            <Text style={styles.metaItem}>Difficulty: {recipe.difficulty}</Text>
            <Text style={styles.metaItem}>Time: {recipe.timeEstimate} minutes</Text>
            <Text style={styles.metaItem}>Cost: ${recipe.extraIngredientsCost.toFixed(2)}</Text>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dietary Information</Text>
          {recipe.dietaryInfo.restrictions.length > 0 ? (
            <View style={styles.dietaryTags}>
              {recipe.dietaryInfo.restrictions.map((restriction, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{restriction}</Text>
                </View>
              ))}
            </View>
          ) : (
            <Text>No specific dietary restrictions</Text>
          )}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
          <View style={styles.nutritionGrid}>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
              <Text style={styles.nutritionLabel}>Calories</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}g</Text>
              <Text style={styles.nutritionLabel}>Protein</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}g</Text>
              <Text style={styles.nutritionLabel}>Fat</Text>
            </View>
            <View style={styles.nutritionItem}>
              <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}g</Text>
              <Text style={styles.nutritionLabel}>Carbs</Text>
            </View>
          </View>
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Current Ingredients</Text>
          {recipe.currentIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>• {ingredient}</Text>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Extra Ingredients</Text>
          {recipe.extraIngredients.map((ingredient, index) => (
            <Text key={index} style={styles.ingredient}>
              • {ingredient.item} (${ingredient.cost.toFixed(2)} for {ingredient.amount})
            </Text>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionStep}>
              <Text style={styles.stepNumber}>{index + 1}</Text>
              <Text style={styles.stepText}>{instruction}</Text>
            </View>
          ))}
        </View>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rate this recipe</Text>
          <View style={styles.ratingContainer}>
            {[1, 2, 3, 4, 5].map((rating) => (
              <TouchableOpacity 
                key={rating} 
                onPress={() => handleRate(rating)}
                style={styles.ratingButton}
              >
                <AntDesign 
                  name={rating <= (userRating || 0) ? "star" : "staro"} 
                  size={30} 
                  color={rating <= (userRating || 0) ? "#FFD700" : "#bbb"} 
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
      
      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={[styles.actionButton, saved ? styles.unsaveButton : styles.saveButton]}
          onPress={handleSaveToggle}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>
            {loading ? 'Processing...' : saved ? 'Unsave Recipe' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.shareButton}
          onPress={handleShare}
        >
          <Text style={styles.actionButtonText}>Share Recipe</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff'
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    padding: 10
  },
  scrollView: {
    flex: 1,
    padding: 16
  },
  header: {
    marginBottom: 24
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8
  },
  metaInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  metaItem: {
    marginRight: 12,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginBottom: 4
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 4
  },
  dietaryTags: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    backgroundColor: '#e1f5fe',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    color: '#0277bd',
    fontSize: 12
  },
  nutritionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap'
  },
  nutritionItem: {
    width: '48%',
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    alignItems: 'center'
  },
  nutritionValue: {
    fontSize: 18,
    fontWeight: 'bold'
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666'
  },
  ingredient: {
    marginBottom: 6,
    fontSize: 16
  },
  instructionStep: {
    flexDirection: 'row',
    marginBottom: 16
  },
  stepNumber: {
    backgroundColor: '#4caf50',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    marginTop: 2
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  actionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginRight: 8
  },
  saveButton: {
    backgroundColor: '#4caf50'
  },
  unsaveButton: {
    backgroundColor: '#f44336'
  },
  shareButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#2196f3'
  },
  actionButtonText: {
    color: 'white',
    fontWeight: 'bold'
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 8
  },
  ratingButton: {
    padding: 8
  }
}); 