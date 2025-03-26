import React, { useState, useEffect } from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, ActivityIndicator, Alert } from 'react-native';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { getSavedRecipes, deleteRecipe, SavedRecipe } from '@/services/savedRecipesService';

export default function SavedRecipesScreen() {
  const [recipes, setRecipes] = useState<SavedRecipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSavedRecipes();
  }, []);

  const loadSavedRecipes = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const savedRecipes = await getSavedRecipes();
      // Sort recipes by saved date, newest first
      savedRecipes.sort((a, b) => b.savedAt.getTime() - a.savedAt.getTime());
      setRecipes(savedRecipes);
    } catch (error: any) {
      console.error('Error loading saved recipes:', error);
      setError(error.message || 'Failed to load saved recipes');
    } finally {
      setLoading(false);
    }
  };

  const handleViewRecipe = (recipe: SavedRecipe) => {
    router.push({
      pathname: '/(app)/recipe',
      params: { recipe: JSON.stringify(recipe.recipe) }
    });
  };

  const handleDeleteRecipe = async (recipe: SavedRecipe) => {
    Alert.alert(
      'Remove Recipe',
      `Are you sure you want to remove "${recipe.recipe.name}" from your saved recipes?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteRecipe(recipe.id);
              // Remove from local state
              setRecipes(recipes.filter(r => r.id !== recipe.id));
              Alert.alert('Success', 'Recipe removed from your collection');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to remove recipe');
            }
          },
        },
      ]
    );
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#FFA07A', '#FFA07A']}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <ThemedText style={styles.headerTitle}>My Saved Recipes</ThemedText>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={loadSavedRecipes}
          >
            <MaterialIcons name="refresh" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>
        
        {/* Content */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          <ThemedView style={styles.container}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#FF6B6B" />
                <ThemedText style={styles.loadingText}>Loading your saved recipes...</ThemedText>
              </View>
            ) : error ? (
              <View style={styles.errorContainer}>
                <MaterialIcons name="error" size={48} color="#FF3B30" />
                <ThemedText style={styles.errorText}>{error}</ThemedText>
                <TouchableOpacity 
                  style={styles.retryButton}
                  onPress={loadSavedRecipes}
                >
                  <ThemedText style={styles.retryButtonText}>Try Again</ThemedText>
                </TouchableOpacity>
              </View>
            ) : recipes.length === 0 ? (
              <View style={styles.emptyContainer}>
                <MaterialIcons name="bookmark-border" size={64} color="#CCC" />
                <ThemedText style={styles.emptyText}>You haven't saved any recipes yet</ThemedText>
                <TouchableOpacity 
                  style={styles.exploreButton}
                  onPress={() => router.push('/(app)/home')}
                >
                  <LinearGradient
                    colors={['#FF6B6B', '#FF8B8B']}
                    style={styles.buttonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                  >
                    <MaterialIcons name="search" size={20} color="#FFF" style={styles.buttonIcon} />
                    <ThemedText style={styles.buttonText}>Explore Recipes</ThemedText>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.recipesContainer}>
                <ThemedText style={styles.recipesCount}>
                  {recipes.length} {recipes.length === 1 ? 'Recipe' : 'Recipes'} Saved
                </ThemedText>
                
                {recipes.map((savedRecipe) => (
                  <View key={savedRecipe.id} style={styles.recipeCard}>
                    <LinearGradient
                      colors={['#FFFFFF', '#F8F9FD']}
                      style={styles.cardGradient}
                    >
                      <View style={styles.recipeHeader}>
                        <ThemedText style={styles.recipeName}>{savedRecipe.recipe.name}</ThemedText>
                        <ThemedText style={styles.recipeDate}>
                          Saved on {formatDate(savedRecipe.savedAt)}
                        </ThemedText>
                      </View>

                      <View style={styles.recipeDetails}>
                        <View style={styles.detailItem}>
                          <MaterialIcons name="timer" size={20} color="#666" />
                          <ThemedText style={styles.detailText}>
                            {savedRecipe.recipe.timeEstimate} mins
                          </ThemedText>
                        </View>
                        <View style={styles.detailDivider} />
                        <View style={styles.detailItem}>
                          <MaterialIcons name="local-fire-department" size={20} color="#FF6B6B" />
                          <ThemedText style={styles.detailText}>
                            {savedRecipe.recipe.nutritionInfo.calories} cal
                          </ThemedText>
                        </View>
                      </View>

                      <View style={styles.actionButtons}>
                        <TouchableOpacity 
                          style={styles.viewButton}
                          onPress={() => handleViewRecipe(savedRecipe)}
                        >
                          <LinearGradient
                            colors={['#4CAF50', '#67BB6A']}
                            style={styles.actionButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <MaterialIcons name="visibility" size={18} color="#FFF" />
                            <ThemedText style={styles.actionButtonText}>View Recipe</ThemedText>
                          </LinearGradient>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                          style={styles.deleteButton}
                          onPress={() => handleDeleteRecipe(savedRecipe)}
                        >
                          <LinearGradient
                            colors={['#FF3B30', '#FF6B6B']}
                            style={styles.actionButtonGradient}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                          >
                            <MaterialIcons name="delete" size={18} color="#FFF" />
                            <ThemedText style={styles.actionButtonText}>Remove</ThemedText>
                          </LinearGradient>
                        </TouchableOpacity>
                      </View>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            )}
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
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.2)',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  refreshButton: {
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  errorContainer: {
    padding: 24,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    padding: 12,
    backgroundColor: '#FF6B6B',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 20,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  exploreButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  recipesContainer: {
    marginTop: 8,
  },
  recipesCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  recipeCard: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  cardGradient: {
    padding: 16,
  },
  recipeHeader: {
    marginBottom: 12,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },
  recipeDate: {
    fontSize: 13,
    color: '#888',
    fontStyle: 'italic',
  },
  recipeDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F7F9FC',
    padding: 12,
    borderRadius: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  detailDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  viewButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    overflow: 'hidden',
  },
  deleteButton: {
    width: 100,
    borderRadius: 8,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionButtonText: {
    color: '#FFF',
    marginLeft: 4,
    fontSize: 14,
    fontWeight: '600',
  },
}); 