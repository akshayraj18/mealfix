import React from 'react';
import { View, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, Platform, StatusBar } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Recipe } from '@/types/recipe';

export default function RecipePage() {
  const params = useLocalSearchParams<{ recipe: string }>();
  const recipe: Recipe = params.recipe ? JSON.parse(params.recipe) : null;

  if (!recipe) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ThemedView style={styles.container}>
          <ThemedText style={styles.defaultText}>Recipe not found</ThemedText>
        </ThemedView>
      </SafeAreaView>
    );
  }

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Fixed Header with Back Button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
          activeOpacity={0.7}
        >
          <ThemedText style={styles.backButtonText}>← Back</ThemedText>
        </TouchableOpacity>
        <ThemedText style={styles.headerTitle} numberOfLines={1} ellipsizeMode="tail">
          {recipe.name}
        </ThemedText>
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
            <ThemedText style={styles.infoText}>
              Level of Expertise: {recipe.difficulty}
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Time Estimate: {recipe.timeEstimate} Minutes
            </ThemedText>
            <ThemedText style={styles.infoText}>
              Extra Ingredients Cost: ${recipe.extraIngredientsCost}
            </ThemedText>
          </View>

          {/* Current Ingredients */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Ingredients already have:
            </ThemedText>
            {recipe.currentIngredients && recipe.currentIngredients.length > 0 ? (
              recipe.currentIngredients.map((ingredient, index) => (
                <ThemedText key={index} style={styles.listItem}>
                  • {ingredient}
                </ThemedText>
              ))
            ) : (
              <ThemedText style={styles.listItem}>No ingredients specified</ThemedText>
            )}
          </View>

          {/* Extra Ingredients */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Extra Ingredients:
            </ThemedText>
            {recipe.extraIngredients && recipe.extraIngredients.length > 0 ? (
              recipe.extraIngredients.map((ingredient, index) => (
                <ThemedText key={index} style={styles.listItem}>
                  • {ingredient.item} (${ingredient.cost.toFixed(2)} for {ingredient.amount})
                </ThemedText>
              ))
            ) : (
              <ThemedText style={styles.listItem}>No extra ingredients needed</ThemedText>
            )}
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <ThemedText style={styles.sectionTitle}>
              Instructions:
            </ThemedText>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              recipe.instructions.map((instruction, index) => (
                <ThemedText key={index} style={styles.listItem}>
                  {index + 1}. {instruction}
                </ThemedText>
              ))
            ) : (
              <ThemedText style={styles.listItem}>
                1. Bring a large pot of salted water to a boil.
                {'\n'}2. Cook the pasta according to the package instructions until it's al dente.
                {'\n'}3. While the pasta is cooking, heat the tomato sauce in a saucepan over medium heat.
                {'\n'}4. Drain the cooked pasta and add it to the tomato sauce.
                {'\n'}5. Stir in some grated Parmesan cheese and a sprinkle of salt.
                {'\n'}6. Drizzle with olive oil and garnish with fresh basil leaves.
                {'\n'}7. Serve hot and enjoy!
              </ThemedText>
            )}
          </View>

          {/* Add to Made Recipes Button */}
          <TouchableOpacity 
            style={styles.addButton}
            activeOpacity={0.7}
          >
            <ThemedText style={styles.addButtonText}>
              ADD TO MADE RECIPES
            </ThemedText>
          </TouchableOpacity>
        </ThemedView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  header: {
    height: 50,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollViewContent: {
    paddingBottom: 20,
    paddingTop: 10,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  defaultText: {
    color: '#000',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginLeft: 10,
    flex: 1,
  },
  quickInfo: {
    backgroundColor: '#F8F8F8',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    marginTop: 10,
  },
  infoText: {
    fontSize: 14,
    marginBottom: 8,
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#000',
  },
  listItem: {
    fontSize: 16,
    marginBottom: 8,
    paddingLeft: 10,
    color: '#000',
  },
  addButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 