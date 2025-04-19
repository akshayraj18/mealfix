import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet, Platform, View, Animated, Switch, Text } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/config/firebase';
import { generateRecipeSuggestions } from '@/services/recipeService';
import { Recipe } from '@/types/recipe';
import { DietaryPreferences } from '@/types/dietary';
import DietaryPreferencesComponent from '@/components/DietaryPreferences';
import RecipeFiltersComponent, { RecipeFilters } from '@/components/RecipeFilters';
import { filterRecipes, countActiveFilters } from '@/utils/recipeFilters';
import { router } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { trackScreenView, trackIngredientSearch, trackError, logAnalyticsEvent } from '@/services/analyticsService';
import { logEvent, RecipeEvents } from '@/config/firebase';
import { usePremiumFeature } from '@/context/PremiumFeatureContext';

const HomeScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [filteredRecipes, setFilteredRecipes] = useState<Recipe[] | null>(null);
  const [username, setUsername] = useState<string>('');
  const [screenStartTime] = useState(Date.now());
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    restrictions: [],
    allergies: [],
    preferences: [],
  });
  
  // Recipe filters state
  const [recipeFilters, setRecipeFilters] = useState<RecipeFilters>({
    timeRange: { min: null, max: null },
    difficulty: [],
    nutrition: {
      calories: { min: null, max: null },
      protein: { min: null, max: null },
    },
  });

  const [bounceAnim] = useState(new Animated.Value(1));

  const { premiumEnabled, setPremiumEnabled } = usePremiumFeature();

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.displayName) {
      setUsername(user.displayName); 
    } else if (user?.email) { //fallback stuff
      setUsername(user.email.split('@')[0]);
    }

    return () => {
      // Logging screen time
      const timeSpent = Math.round((Date.now() - screenStartTime) / 1000); 
      trackScreenView('home', timeSpent);
    };
  }, [screenStartTime, recipes]);
  
  useEffect(() => {
    if (recipes) {
      const filtered = filterRecipes(recipes, recipeFilters);
      setFilteredRecipes(filtered);
      
      // Log filter event
      if (countActiveFilters(recipeFilters) > 0) {
        logAnalyticsEvent('apply_filters', {
          filter_count: countActiveFilters(recipeFilters),
          result_count: filtered.length
        });
      }
    }
  }, [recipes, recipeFilters]);

  const handleGenerateSuggestions = async () => {
    if (!ingredients.trim()) {
      setError('Please enter some ingredients');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await generateRecipeSuggestions(ingredients, dietaryPreferences);
      if (result.error) {
        setError(result.error);
      } else {
        setRecipes(result.recipes);
        setFilteredRecipes(filterRecipes(result.recipes || [], recipeFilters));
      }
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyFilters = () => {
    if (recipes) {
      setFilteredRecipes(filterRecipes(recipes, recipeFilters));
    }
  };

  const handleRecipeSelect = (recipe: Recipe) => {
    router.push({
      pathname: '/(app)/recipe',
      params: { recipe: JSON.stringify(recipe) }
    });
  };

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(bounceAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(bounceAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <LinearGradient
      colors={['#FFA07A', '#FFA07A']}
      style={styles.gradient}
    >
      <ScrollView 
        style={styles.scrollView} 
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView style={styles.container}>
          <View style={styles.headerContainer}>
            <ThemedText style={styles.greeting}>Hi {username}! 👋</ThemedText>
            <ThemedText style={styles.subtitle}>Let's cook something amazing today!</ThemedText>
          </View>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Enable Premium Features</Text>
            <Switch
              value={premiumEnabled}
              onValueChange={(value) => {
                setPremiumEnabled(value);
              }}
              trackColor={{ false: '#767577', true: '#FF8B8B' }}
              thumbColor={premiumEnabled ? '#FF6B6B' : '#f4f3f4'}
              ios_backgroundColor="#3e3e3e"
            />
          </View>
          
          <View style={styles.searchSection}>
            <ThemedText style={styles.label}>
              What ingredients do you have?
            </ThemedText>
            
            <View style={styles.inputContainer}>
              <MaterialIcons name="search" size={24} color="#888" style={styles.searchIcon} />
              <TextInput
                style={styles.input}
                value={ingredients}
                onChangeText={setIngredients}
                multiline
                placeholder="e.g., tomato sauce, dough, pasta, basil, olives"
                placeholderTextColor="#C0C0C0"
              />
            </View>
          </View>

          <View style={styles.preferencesSection}>
            <ThemedText style={styles.sectionTitle}>
              <MaterialIcons name="restaurant" size={24} color="#FFB6B6" />
              {" "}Dietary Preferences
            </ThemedText>
            <DietaryPreferencesComponent
              preferences={dietaryPreferences}
              onUpdate={setDietaryPreferences}
            />
          </View>
          
          <Animated.View style={{ transform: [{ scale: bounceAnim }] }}>
            <TouchableOpacity 
              style={[styles.generateButton, isLoading && { opacity: 0.5 }]}
              onPress={() => {
                animateButton();
                handleGenerateSuggestions();
              }}
              disabled={isLoading}
            >
              <LinearGradient
                colors={isLoading ? ['#FFB5B5', '#FFC5C5'] : ['#FF6B6B', '#FF8B8B']}
                style={styles.buttonGradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <MaterialIcons name="restaurant-menu" size={24} color="#FFF" style={styles.buttonIcon} />
                <ThemedText style={styles.buttonText}>
                  {isLoading ? 'COOKING UP IDEAS...' : 'FIND RECIPES'}
                </ThemedText>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          {error && (
            <View style={styles.errorContainer}>
              <MaterialIcons name="error" size={20} color="#FF3B30" />
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            </View>
          )}

          {isLoading && (
            <View style={styles.loadingContainer}>
              <MaterialIcons name="restaurant" size={24} color="#FFF" />
              <ThemedText style={styles.loadingText}>
                🧑‍🍳 Creating delicious suggestions for you...
              </ThemedText>
            </View>
          )}

          {filteredRecipes && filteredRecipes.length > 0 && (
            <View style={styles.filtersContainer}>
              <ThemedText style={styles.resultsCount}>
                {filteredRecipes.length} {filteredRecipes.length === 1 ? 'Recipe' : 'Recipes'} Found
              </ThemedText>
              <RecipeFiltersComponent
                filters={recipeFilters}
                onUpdateFilters={setRecipeFilters}
                onApplyFilters={handleApplyFilters}
                activeFilterCount={countActiveFilters(recipeFilters)}
              />
            </View>
          )}

          {filteredRecipes && filteredRecipes.length === 0 && recipes && recipes.length > 0 && (
            <View style={styles.noMatchesContainer}>
              <MaterialIcons name="filter-alt-off" size={48} color="#666" />
              <ThemedText style={styles.noMatchesText}>
                No recipes match your filters
              </ThemedText>
              <TouchableOpacity 
                style={styles.resetFiltersButton} 
                onPress={() => {
                  setRecipeFilters({
                    timeRange: { min: null, max: null },
                    difficulty: [],
                    nutrition: {
                      calories: { min: null, max: null },
                      protein: { min: null, max: null },
                    },
                  });
                }}
              >
                <ThemedText style={styles.resetFiltersText}>Reset Filters</ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {filteredRecipes && filteredRecipes.map((recipe, index) => (
            <TouchableOpacity
              key={index}
              style={styles.recipeCard}
              onPress={() => handleRecipeSelect(recipe)}
            >
              <LinearGradient
                colors={['#FFFFFF', '#F8F9FD']}
                style={styles.cardGradient}
              >
                <View style={styles.recipeHeader}>
                  <ThemedText style={styles.recipeName}>{recipe.name}</ThemedText>
                  <MaterialIcons name="arrow-forward" size={24} color="#FF6B6B" />
                </View>

                <View style={styles.recipeDetails}>
                  <View style={styles.detailItem}>
                    <MaterialIcons name="timer" size={20} color="#666" />
                    <ThemedText style={styles.detailText}>{recipe.timeEstimate} mins</ThemedText>
                  </View>
                  <View style={styles.detailDivider} />
                  <View style={styles.detailItem}>
                    <MaterialIcons name="school" size={20} color="#666" />
                    <ThemedText style={styles.detailText}>{recipe.difficulty}</ThemedText>
                  </View>
                </View>

                <View style={styles.nutritionPreview}>
                  <View style={styles.nutritionItem}>
                    <MaterialIcons name="local-fire-department" size={16} color="#FF6B6B" />
                    <ThemedText style={styles.nutritionText}>{recipe.nutritionInfo.calories} cal</ThemedText>
                  </View>
                  <View style={styles.nutritionItem}>
                    <MaterialIcons name="fitness-center" size={16} color="#4CAF50" />
                    <ThemedText style={styles.nutritionText}>{recipe.nutritionInfo.protein}g protein</ThemedText>
                  </View>
                </View>

                <View style={styles.recipeCost}>
                  <MaterialIcons name="shopping-cart" size={20} color="#FF6B6B" />
                  <ThemedText style={styles.costText}>
                    ${recipe.extraIngredientsCost.toFixed(2)} for extra ingredients
                  </ThemedText>
                </View>

                {recipe.dietaryInfo.restrictions.length > 0 && (
                  <View style={styles.dietaryContainer}>
                    {recipe.dietaryInfo.restrictions.map((restriction, idx) => (
                      <View key={idx} style={styles.dietaryBadge}>
                        <MaterialIcons name="check-circle" size={16} color="#4CAF50" />
                        <ThemedText style={styles.dietaryText}>{restriction}</ThemedText>
                      </View>
                    ))}
                  </View>
                )}
              </LinearGradient>
            </TouchableOpacity>
          ))}

          <TouchableOpacity 
            style={styles.signOutButton} 
            onPress={handleSignOut}
          >
            <LinearGradient
              colors={['#FF6B6B', '#FF8B8B']}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <MaterialIcons name="exit-to-app" size={24} color="#FFF" style={styles.buttonIcon} />
              <ThemedText style={styles.buttonText}>SIGN OUT</ThemedText>
            </LinearGradient>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
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
  headerContainer: {
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#E0E0E0',
    marginTop: 8,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  searchSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 20,
    marginBottom: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  searchIcon: {
    padding: 16,
  },
  input: {
    flex: 1,
    minHeight: 100,
    fontSize: 16,
    color: '#1A1A1A',
    paddingRight: 16,
    paddingVertical: 16,
  },
  preferencesSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  generateButton: {
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF6B6B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  buttonIcon: {
    
    
    
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 59, 48, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.2)',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 8,
    fontWeight: '500',
  },
  recipeCard: {
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  cardGradient: {
    padding: 20,
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recipeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 16,
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F7F9FC',
    borderRadius: 12,
    padding: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 8,
    fontWeight: '500',
  },
  detailDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 12,
  },
  recipeCost: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  costText: {
    fontSize: 16,
    color: '#FF6B6B',
    marginLeft: 8,
    fontWeight: '600',
  },
  dietaryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dietaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9F0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  dietaryText: {
    fontSize: 14,
    color: '#4CAF50',
    marginLeft: 6,
    fontWeight: '500',
  },
  nutritionPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16,
  },
  nutritionText: {
    fontSize: 16,
    color: '#888',
    marginLeft: 8,
    fontWeight: '500',
  },
  signOutButton: {
    marginTop: 20,
    borderRadius: 16,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#FF3B30',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
  filtersContainer: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultsCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFF',
  },
  noMatchesContainer: {
    marginTop: 20,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
    alignItems: 'center',
  },
  noMatchesText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
    marginTop: 12,
    marginBottom: 12,
  },
  resetFiltersButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  resetFiltersText: {
    color: '#FFF',
    fontWeight: '500',
  },
  toggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginVertical: 12,
  },
  toggleLabel: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
  },
});

export default HomeScreen; 