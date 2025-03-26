import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, Alert } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Recipe } from '@/types/recipe';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import NutritionInfo from '@/components/NutritionInfo';
import { saveRecipe, isRecipeSaved, deleteRecipe } from '@/services/savedRecipesService';

export default function RecipePage() {
  const params = useLocalSearchParams<{ recipe: string }>();
  const recipe: Recipe = params.recipe ? JSON.parse(params.recipe) : null;
  const [isSaved, setIsSaved] = useState(false);
  const [savedRecipeId, setSavedRecipeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfRecipeIsSaved();
  }, []);

  const checkIfRecipeIsSaved = async () => {
    if (!recipe) return;
    
    try {
      const recipeId = await isRecipeSaved(recipe.name);
      setIsSaved(!!recipeId);
      setSavedRecipeId(recipeId);
    } catch (error) {
      console.error('Error checking if recipe is saved:', error);
    }
  };

  const handleSaveRecipe = async () => {
    if (!recipe) return;
    
    setLoading(true);
    try {
      if (isSaved && savedRecipeId) {
        await deleteRecipe(savedRecipeId);
        setIsSaved(false);
        setSavedRecipeId(null);
        Alert.alert('Success', 'Recipe removed from your saved recipes');
      } else {
        const recipeId = await saveRecipe(recipe);
        setIsSaved(true);
        setSavedRecipeId(recipeId);
        Alert.alert('Success', 'Recipe saved to your collection!');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <LinearGradient
          colors={['#F7F9FC', '#E8EEF9']}
          style={styles.gradient}
        >
          <ThemedView style={styles.container}>
            <View style={styles.errorCard}>
              <MaterialIcons name="error" size={48} color="#FF3B30" />
              <ThemedText style={styles.defaultText}>Recipe not found</ThemedText>
            </View>
          </ThemedView>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  const handleBackPress = () => {
    router.back();
  };

  const renderDietaryBadges = () => {
    if (!recipe.dietaryInfo.restrictions.length && !recipe.dietaryInfo.allergens.length) {
      return null;
    }

    return (
      <View style={styles.dietarySection}>
        <ThemedText style={styles.sectionTitle}>
          <MaterialIcons name="restaurant" size={24} color="#FF6B6B" />
          {" "}Dietary Information
        </ThemedText>
        <View style={styles.badgesContainer}>
          {recipe.dietaryInfo.restrictions.map((restriction, index) => (
            <LinearGradient
              key={`restriction-${index}`}
              colors={['#F0F9F0', '#E8F5E8']}
              style={styles.badge}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="restaurant-menu" size={16} color="#4CAF50" />
              <ThemedText style={styles.badgeText}>{restriction}</ThemedText>
            </LinearGradient>
          ))}
          {recipe.dietaryInfo.allergens.map((allergen, index) => (
            <LinearGradient
              key={`allergen-${index}`}
              colors={['#FFF3F3', '#FFE5E5']}
              style={[styles.badge, styles.allergenBadge]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="warning" size={16} color="#FF3B30" />
              <ThemedText style={[styles.badgeText, styles.allergenText]}>
                {allergen} Free
              </ThemedText>
            </LinearGradient>
          ))}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#F7F9FC', '#E8EEF9']}
        style={styles.gradient}
      >
        {/* Fixed Header with Back Button */}
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
            activeOpacity={0.7}
          >
            <MaterialIcons name="arrow-back" size={24} color="#1A1A1A" />
          </TouchableOpacity>
          <ThemedText style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
            {recipe.name}
          </ThemedText>
          <TouchableOpacity 
            style={styles.saveButton}
            onPress={handleSaveRecipe}
            disabled={loading}
          >
            <MaterialIcons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={28} 
              color={isSaved ? "#FF6B6B" : "#666"} 
            />
          </TouchableOpacity>
        </View>

        {/* Scrollable Content */}
        <ScrollView 
          style={styles.scrollView} 
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            {/* Quick Info */}
            <View style={styles.quickInfo}>
              <View style={styles.infoRow}>
                <MaterialIcons name="school" size={20} color="#666" />
                <ThemedText style={styles.infoText}>
                  Level: {recipe.difficulty}
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="timer" size={20} color="#666" />
                <ThemedText style={styles.infoText}>
                  Time: {recipe.timeEstimate} Minutes
                </ThemedText>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="shopping-cart" size={20} color="#666" />
                <ThemedText style={styles.infoText}>
                  Extra Cost: ${recipe.extraIngredientsCost.toFixed(2)}
                </ThemedText>
              </View>
            </View>

            {/* Dietary Information */}
            {renderDietaryBadges()}

            {/* Nutrition Information */}
            {recipe.nutritionInfo && (
              <NutritionInfo nutritionInfo={recipe.nutritionInfo} />
            )}

            {/* Current Ingredients */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                <MaterialIcons name="kitchen" size={24} color="#FF6B6B" />
                {" "}Available Ingredients
              </ThemedText>
              {recipe.currentIngredients && recipe.currentIngredients.length > 0 ? (
                recipe.currentIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <MaterialIcons name="check" size={20} color="#4CAF50" />
                    <ThemedText style={styles.listItem}>{ingredient}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>No ingredients specified</ThemedText>
              )}
            </View>

            {/* Extra Ingredients */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                <MaterialIcons name="add-shopping-cart" size={24} color="#FF6B6B" />
                {" "}Shopping List
              </ThemedText>
              {recipe.extraIngredients && recipe.extraIngredients.length > 0 ? (
                recipe.extraIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientItem}>
                    <MaterialIcons name="add" size={20} color="#FF6B6B" />
                    <ThemedText style={styles.listItem}>
                      {ingredient.item}
                      <ThemedText style={styles.ingredientDetail}>
                        {" "}(${ingredient.cost.toFixed(2)} for {ingredient.amount})
                      </ThemedText>
                    </ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>No extra ingredients needed</ThemedText>
              )}
            </View>

            {/* Instructions */}
            <View style={styles.section}>
              <ThemedText style={styles.sectionTitle}>
                <MaterialIcons name="format-list-numbered" size={24} color="#FF6B6B" />
                {" "}Cooking Steps
              </ThemedText>
              {recipe.instructions && recipe.instructions.length > 0 ? (
                recipe.instructions.map((instruction, index) => (
                  <View key={index} style={styles.instructionItem}>
                    <LinearGradient
                      colors={['#FF6B6B', '#FF8B8B']}
                      style={styles.stepNumber}
                    >
                      <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                    </LinearGradient>
                    <ThemedText style={styles.instructionText}>{instruction}</ThemedText>
                  </View>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>No instructions available</ThemedText>
              )}
            </View>
          </ThemedView>
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1A1A1A',
  },
  saveButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 40,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  errorCard: {
    backgroundColor: '#FFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  quickInfo: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 12,
    flex: 1,
  },
  dietarySection: {
    marginBottom: 24,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  allergenBadge: {
    backgroundColor: '#FFF3F3',
  },
  badgeText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  allergenText: {
    color: '#FF3B30',
  },
  section: {
    backgroundColor: '#FFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#1A1A1A',
    flexDirection: 'row',
    alignItems: 'center',
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingVertical: 4,
  },
  listItem: {
    fontSize: 16,
    color: '#4A4A4A',
    marginLeft: 12,
    flex: 1,
  },
  ingredientDetail: {
    color: '#666',
    fontSize: 14,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 16,
    color: '#4A4A4A',
    flex: 1,
    lineHeight: 24,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  defaultText: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginTop: 16,
    fontWeight: '500',
  },
}); 