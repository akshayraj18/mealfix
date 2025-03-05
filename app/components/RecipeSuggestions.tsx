import React from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';

interface RecipeSuggestionsProps {
  ingredients: string;
  isLoading: boolean;
  suggestions: string | null;
  error: string | null;
}

const RecipeSuggestions: React.FC<RecipeSuggestionsProps> = ({ ingredients, isLoading, suggestions, error }) => {
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#FF8C00" />
        <ThemedText style={styles.loadingText}>Generating delicious suggestions...</ThemedText>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </View>
    );
  }

  if (!suggestions) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.suggestions}>{suggestions}</ThemedText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
  },
  loadingText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#666',
  },
  errorText: {
    color: '#FF3B30',
    textAlign: 'center',
  },
  suggestions: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default RecipeSuggestions; 