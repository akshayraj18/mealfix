import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import { Recipe } from '../../../types/dietary';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams();
  // TODO: Fetch recipe data using the ID
  // For now, we'll use dummy data
  const recipe: Recipe = {
    id: id as string,
    title: 'Sample Recipe',
    description: 'This is a sample recipe description.',
    ingredients: [
      'Ingredient 1',
      'Ingredient 2',
      'Ingredient 3',
    ],
    instructions: [
      'Step 1: Do this',
      'Step 2: Do that',
      'Step 3: Finish',
    ],
    dietaryInfo: {
      restrictions: ['vegetarian', 'gluten-free'],
      allergens: [],
    },
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    calories: 350,
  };

  const renderDietaryBadges = () => (
    <View style={styles.badgesContainer}>
      {recipe.dietaryInfo.restrictions.map((restriction) => (
        <View key={restriction} style={styles.badge}>
          <MaterialIcons name="restaurant-menu" size={16} color="#007AFF" />
          <Text style={styles.badgeText}>{restriction.replace('-', ' ')}</Text>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      {recipe.imageUrl && (
        <Image
          source={{ uri: recipe.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
      )}
      
      <View style={styles.content}>
        <Text style={styles.title}>{recipe.title}</Text>
        <Text style={styles.description}>{recipe.description}</Text>
        
        {renderDietaryBadges()}
        
        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <MaterialIcons name="timer" size={20} color="#666" />
            <Text style={styles.infoText}>
              {recipe.prepTime + recipe.cookTime} mins
            </Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="people" size={20} color="#666" />
            <Text style={styles.infoText}>{recipe.servings} servings</Text>
          </View>
          <View style={styles.infoItem}>
            <MaterialIcons name="local-fire-department" size={20} color="#666" />
            <Text style={styles.infoText}>{recipe.calories} cal</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <MaterialIcons name="check-circle" size={20} color="#4CAF50" />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
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
    height: 200,
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 20,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  badgeText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#007AFF',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#eee',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  ingredientText: {
    marginLeft: 8,
    fontSize: 16,
  },
  instructionItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
  },
}); 