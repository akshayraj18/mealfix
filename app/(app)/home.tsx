import React, { useState, useEffect } from 'react';
import { ScrollView, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { auth } from '@/config/firebase';
import { generateRecipeSuggestions } from '@/services/recipeService';
import { Recipe } from '@/types/recipe';
import { DietaryPreferences } from '@/types/dietary';
import DietaryPreferencesComponent from '@/components/DietaryPreferences';
import { router } from 'expo-router';

const HomeScreen: React.FC = () => {
  const [ingredients, setIngredients] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recipes, setRecipes] = useState<Recipe[] | null>(null);
  const [username, setUsername] = useState<string>('');
  const [dietaryPreferences, setDietaryPreferences] = useState<DietaryPreferences>({
    restrictions: [],
    allergies: [],
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (user?.email) {
      setUsername(user.email.split('@')[0]);
    }
  }, []);

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
      }
    } catch (err) {
      setError('Failed to generate recipes. Please try again.');
    } finally {
      setIsLoading(false);
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

  return (
    <ScrollView style={styles.scrollView}>
      <ThemedView style={styles.container}>
        <ThemedText style={styles.greeting}>Hi {username}!</ThemedText>
        
        <ThemedText style={styles.label}>
          Please input your ingredients:
        </ThemedText>
        
        <TextInput
          style={styles.input}
          value={ingredients}
          onChangeText={setIngredients}
          multiline
          placeholder="Tomato sauce, dough, pasta, basil, olives"
          placeholderTextColor="#999"
        />

        <ThemedText style={styles.sectionTitle}>Dietary Preferences</ThemedText>
        <DietaryPreferencesComponent
          preferences={dietaryPreferences}
          onUpdate={setDietaryPreferences}
        />
        
        <TouchableOpacity 
          style={styles.generateButton} 
          onPress={handleGenerateSuggestions}
          disabled={isLoading}
        >
          <ThemedText style={styles.buttonText}>
            {isLoading ? 'GENERATING...' : 'GENERATE SUGGESTIONS'}
          </ThemedText>
        </TouchableOpacity>

        {error && (
          <ThemedText style={styles.errorText}>{error}</ThemedText>
        )}

        {isLoading && (
          <ThemedText style={styles.loadingText}>
            Generating delicious suggestions...
          </ThemedText>
        )}

        {recipes && recipes.map((recipe, index) => (
          <TouchableOpacity
            key={index}
            style={styles.recipeCard}
            onPress={() => handleRecipeSelect(recipe)}
          >
            <ThemedText style={styles.recipeName}>{recipe.name}</ThemedText>
            <ThemedText style={styles.recipeInfo}>
              Difficulty: {recipe.difficulty} • Time: {recipe.timeEstimate} mins
            </ThemedText>
            <ThemedText style={styles.recipeCost}>
              Extra ingredients cost: ${recipe.extraIngredientsCost}
            </ThemedText>
            {recipe.dietaryInfo.restrictions.length > 0 && (
              <ThemedText style={styles.dietaryInfo}>
                Dietary: {recipe.dietaryInfo.restrictions.join(', ')}
              </ThemedText>
            )}
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
          <ThemedText style={styles.buttonText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    height: 100,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  generateButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
  },
  loadingText: {
    textAlign: 'center',
    marginBottom: 10,
  },
  recipeCard: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  recipeInfo: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  recipeCost: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 5,
  },
  dietaryInfo: {
    fontSize: 14,
    color: '#4CAF50',
    fontStyle: 'italic',
  },
  signOutButton: {
    backgroundColor: '#FF3B30',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
});

export default HomeScreen; 