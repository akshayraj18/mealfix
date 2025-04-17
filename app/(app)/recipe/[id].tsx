import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '@/types/recipe';
import { isRecipeSaved, saveRecipe, deleteRecipe } from '@/services/savedRecipesService';
import { trackRecipeView, trackRecipeSave } from '@/services/analyticsService';
import { isFeatureEnabled, getABTestVariant } from '@/services/featureFlagService';

interface LayoutProps {
  recipe: Recipe;
  isSaved: boolean;
  onSaveToggle: () => Promise<void>;
  variant?: string;
}

export default function RecipeScreen() {
  const { id } = useLocalSearchParams();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [useNewLayout, setUseNewLayout] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState<string>('control');

  useEffect(() => {
    const loadRecipe = async () => {
      try {
        // This is dummy data - in a real app, you would fetch the recipe from an API
        const recipeData: Recipe = {
          name: 'Vegetarian Pasta',
          difficulty: 'Easy',
          timeEstimate: 30,
          extraIngredientsCost: 8,
          currentIngredients: [
            '250g pasta',
            '2 tbsp olive oil',
            '1 onion',
          ],
          extraIngredients: [
            { item: 'zucchini', cost: 2, amount: '1 medium' },
            { item: 'bell pepper', cost: 1.5, amount: '1 medium' },
            { item: 'canned tomatoes', cost: 1.5, amount: '400g' },
            { item: 'fresh basil', cost: 3, amount: '1 bunch' },
          ],
          instructions: [
            'Boil pasta according to package instructions.',
            'Heat olive oil in a pan over medium heat.',
            'Add onion and garlic, sauté until fragrant.',
            'Add zucchini and bell pepper, cook for 5 minutes.',
            'Add canned tomatoes, simmer for 10 minutes.',
            'Drain pasta and add to the sauce.',
            'Season with salt, pepper, and fresh basil.'
          ],
          dietaryInfo: {
            restrictions: ['vegetarian'],
            allergens: [],
          },
          nutritionInfo: {
            calories: 450,
            protein: 12,
            carbs: 65,
            fat: 15,
            fiber: 8,
            sugar: 5,
            sodium: 400,
            servings: 4
          }
        };
        
        setRecipe(recipeData);
        
        // Check if this recipe is saved
        const savedId = await isRecipeSaved(recipeData.name);
        setIsSaved(!!savedId);

        // Track recipe view for analytics
        trackRecipeView(recipeData);

        // Check feature flags
        const newLayoutEnabled = await isFeatureEnabled('new_recipe_screen');
        setUseNewLayout(newLayoutEnabled);

        // Check A/B test variant
        const variant = await getABTestVariant('recipe_detail_layout');
        if (variant) {
          setLayoutVariant(variant);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error loading recipe:', error);
        setLoading(false);
      }
    };

    loadRecipe();
  }, [id]);

  const handleSaveToggle = async () => {
    if (!recipe) return;

    try {
      if (isSaved) {
        // We need to get the saved ID first
        const savedId = await isRecipeSaved(recipe.name);
        if (savedId) {
          await deleteRecipe(savedId);
          setIsSaved(false);
          Alert.alert('Recipe removed from saved recipes');
        }
      } else {
        await saveRecipe(recipe);
        setIsSaved(true);
        
        // Track recipe save for analytics
        trackRecipeSave(recipe);
        
        Alert.alert('Recipe saved successfully');
      }
    } catch (error) {
      console.error('Error toggling save:', error);
      Alert.alert('Error', 'Failed to save/unsave recipe');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading recipe...</Text>
      </View>
    );
  }

  if (!recipe) {
    return (
      <View style={styles.container}>
        <Text>Recipe not found</Text>
      </View>
    );
  }

  // Choose layout based on feature flag and A/B test
  return useNewLayout ? (
    <NewRecipeLayout 
      recipe={recipe} 
      isSaved={isSaved} 
      onSaveToggle={handleSaveToggle}
      variant={layoutVariant}
    />
  ) : (
    <DefaultRecipeLayout 
      recipe={recipe} 
      isSaved={isSaved} 
      onSaveToggle={handleSaveToggle} 
    />
  );
}

function DefaultRecipeLayout({ recipe, isSaved, onSaveToggle }: LayoutProps) {
  return (
    <ScrollView style={styles.container}>
      <Stack.Screen
        options={{
          title: recipe.name,
          headerRight: () => (
            <Pressable onPress={onSaveToggle} style={{ marginRight: 15 }}>
              <MaterialIcons
                name={isSaved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color="#007AFF"
              />
            </Pressable>
          ),
        }}
      />

      <Image
        source={{ uri: 'https://via.placeholder.com/400x300' }}
        style={styles.image}
      />

      <View style={styles.infoContainer}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <MaterialIcons name="timer" size={20} color="#666" />
            <Text style={styles.infoText}>{recipe.timeEstimate} mins</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="fitness-center" size={20} color="#666" />
            <Text style={styles.infoText}>{recipe.difficulty}</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="attach-money" size={20} color="#666" />
            <Text style={styles.infoText}>${recipe.extraIngredientsCost}</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dietary Information</Text>
        <View style={styles.tagsContainer}>
          {recipe.dietaryInfo.restrictions.map((info, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{info}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nutrition (per serving)</Text>
        <View style={styles.nutritionContainer}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutritionInfo.calories}</Text>
            <Text style={styles.nutritionLabel}>Calories</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutritionInfo.protein}g</Text>
            <Text style={styles.nutritionLabel}>Protein</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutritionInfo.carbs}g</Text>
            <Text style={styles.nutritionLabel}>Carbs</Text>
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionValue}>{recipe.nutritionInfo.fat}g</Text>
            <Text style={styles.nutritionLabel}>Fat</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients You Have</Text>
        {recipe.currentIngredients.map((ingredient, index) => (
          <View key={index} style={styles.listItem}>
            <MaterialIcons name="check-circle" size={16} color="green" />
            <Text style={styles.listItemText}>{ingredient}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Ingredients Needed</Text>
        {recipe.extraIngredients.map((ingredient, index) => (
          <View key={index} style={styles.listItem}>
            <MaterialIcons name="add-shopping-cart" size={16} color="#007AFF" />
            <Text style={styles.listItemText}>
              {ingredient.amount} {ingredient.item} (${ingredient.cost})
            </Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        {recipe.instructions.map((instruction, index) => (
          <View key={index} style={styles.listItem}>
            <Text style={styles.listItemNumber}>{index + 1}.</Text>
            <Text style={styles.listItemText}>{instruction}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

// This would be a new layout enabled by feature flag
function NewRecipeLayout({ recipe, isSaved, onSaveToggle, variant }: LayoutProps) {
  // In real implementation, you would have different layouts based on variant
  const isVariantA = variant === 'variant';
  
  return (
    <ScrollView style={[styles.container, { backgroundColor: isVariantA ? '#f5f5f5' : '#ffffff' }]}>
      <Stack.Screen
        options={{
          title: recipe.name,
          headerRight: () => (
            <Pressable onPress={onSaveToggle} style={{ marginRight: 15 }}>
              <MaterialIcons
                name={isSaved ? 'bookmark' : 'bookmark-border'}
                size={24}
                color={isVariantA ? "#FF6B6B" : "#007AFF"}
              />
            </Pressable>
          ),
        }}
      />

      <Image
        source={{ uri: 'https://via.placeholder.com/400x300' }}
        style={styles.image}
      />

      <View style={[styles.newLayout, { padding: isVariantA ? 16 : 12 }]}>
        <Text style={[styles.newTitle, { color: isVariantA ? '#333' : '#222' }]}>{recipe.name}</Text>
        
        <View style={styles.infoContainer}>
          <View style={styles.infoRow}>
            <View style={styles.infoItem}>
              <MaterialIcons name="timer" size={20} color={isVariantA ? "#FF6B6B" : "#007AFF"} />
              <Text style={styles.infoText}>{recipe.timeEstimate} mins</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="fitness-center" size={20} color={isVariantA ? "#FF6B6B" : "#007AFF"} />
              <Text style={styles.infoText}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.infoItem}>
              <MaterialIcons name="attach-money" size={20} color={isVariantA ? "#FF6B6B" : "#007AFF"} />
              <Text style={styles.infoText}>${recipe.extraIngredientsCost}</Text>
            </View>
          </View>
        </View>
        
        {/* Rest of the layout would be similar but with styling differences */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients You'll Need</Text>
          <View style={styles.section}>
            <Text style={[styles.sectionSubtitle, { color: isVariantA ? "#FF6B6B" : "#007AFF" }]}>You already have:</Text>
            {recipe.currentIngredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <MaterialIcons name="check-circle" size={16} color={isVariantA ? "#4CAF50" : "green"} />
                <Text style={styles.listItemText}>{ingredient}</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.section}>
            <Text style={[styles.sectionSubtitle, { color: isVariantA ? "#FF6B6B" : "#007AFF" }]}>You'll need to buy:</Text>
            {recipe.extraIngredients.map((ingredient, index) => (
              <View key={index} style={styles.listItem}>
                <MaterialIcons name="add-shopping-cart" size={16} color={isVariantA ? "#FF6B6B" : "#007AFF"} />
                <Text style={styles.listItemText}>
                  {ingredient.amount} {ingredient.item} (${ingredient.cost})
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.listItem}>
              <Text style={[styles.listItemNumber, { color: isVariantA ? "#FF6B6B" : "#007AFF" }]}>{index + 1}.</Text>
              <Text style={styles.listItemText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  image: {
    width: '100%',
    height: 250,
  },
  infoContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 5,
    fontSize: 14,
    color: '#666',
  },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  sectionSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#007AFF',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#e0f7fa',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    color: '#00838f',
    fontSize: 12,
  },
  nutritionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  nutritionLabel: {
    fontSize: 12,
    color: '#666',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  listItemNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
    width: 20,
  },
  listItemText: {
    fontSize: 14,
    color: '#333',
    flex: 1,
    marginLeft: 8,
  },
  // New Layout styles
  newLayout: {
    padding: 12,
  },
  newTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#222',
  },
}); 