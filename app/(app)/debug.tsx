import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { generateTestEvents, logAnalyticsEvent, trackRecipeView, trackRecipeSave, trackDietaryPreferenceToggle, ANALYTICS_EVENTS_COLLECTION } from '@/services/analyticsService';
import { db } from '@/config/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { Recipe } from '@/types/recipe';

// Add this function to check Firebase events
const checkFirebaseEvents = async () => {
  try {
    // Create a query to get the most recent events
    const eventsRef = collection(db, ANALYTICS_EVENTS_COLLECTION);
    const eventsQuery = query(
      eventsRef,
      orderBy('timestamp', 'desc'),
      limit(10)
    );
    
    // Get the documents
    const snapshot = await getDocs(eventsQuery);
    
    if (snapshot.empty) {
      Alert.alert(
        'No Events Found', 
        'No analytics events found in Firebase. Try generating some events first.'
      );
      return;
    }
    
    // Format the events for display
    const events = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        event_name: data.event_name,
        timestamp: data.client_timestamp || 'Unknown time',
        user_id: data.user_id,
        recipe_name: data.recipe_name || (data.parameters && data.parameters.recipe_name) || 'n/a'
      };
    });
    
    // Show a summary in an alert
    const eventSummary = events
      .map(e => `${e.event_name}: ${e.recipe_name}`)
      .join('\n');
    
    Alert.alert(
      `Found ${events.length} Events`,
      `Most recent events in Firebase:\n\n${eventSummary}`,
      [
        { 
          text: 'OK',
          onPress: () => console.log('Events check complete')
        }
      ],
      { cancelable: true }
    );
  } catch (error) {
    console.error('Error checking Firebase events:', error);
    Alert.alert('Error', 'Failed to check Firebase events. See console for details.');
  }
};

export default function DebugScreen() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [eventCount, setEventCount] = useState(0);
  const [lastEventTime, setLastEventTime] = useState<string | null>(null);
  
  // Update the UI with the timestamp of the last event
  useEffect(() => {
    if (eventCount > 0) {
      setLastEventTime(new Date().toLocaleTimeString());
    }
  }, [eventCount]);
  
  // Track screen view
  useAnalytics({
    screenName: 'debug',
  });
  
  const handleGenerateEvents = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const success = await generateTestEvents();
      setResult(
        success 
          ? 'Successfully generated all test events! You should now see real data in the dashboard.'
          : 'Error generating test events. Check console logs for details.'
      );
      // Update event count
      setEventCount(prev => prev + 20); // Approximate count from generateTestEvents
    } catch (error) {
      console.error('Error:', error);
      setResult(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };
  
  const generateRecipeViewEvent = async () => {
    try {
      // Sample recipe
      const recipe: Recipe = {
        name: 'Test Recipe',
        difficulty: 'Easy',
        timeEstimate: 30,
        extraIngredientsCost: 5.99,
        currentIngredients: ['Ingredient 1', 'Ingredient 2'],
        extraIngredients: [
          { item: 'Extra 1', amount: '1 cup', cost: 1.99 },
          { item: 'Extra 2', amount: '2 tbsp', cost: 0.99 }
        ],
        instructions: ['Step 1', 'Step 2'],
        nutritionInfo: {
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
          fiber: 5,
          sugar: 8,
          sodium: 200,
          servings: 2
        },
        dietaryInfo: {
          restrictions: ['Vegetarian'],
          allergens: []
        }
      };
      
      trackRecipeView(recipe);
      setEventCount(prev => prev + 1);
      Alert.alert('Event Generated', 'Recipe view event logged to Firebase');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipe view event');
    }
  };
  
  const generateRecipeSaveEvent = async () => {
    try {
      // Sample recipe
      const recipe: Recipe = {
        name: 'Test Recipe',
        difficulty: 'Easy',
        timeEstimate: 30,
        extraIngredientsCost: 5.99,
        currentIngredients: ['Ingredient 1', 'Ingredient 2'],
        extraIngredients: [
          { item: 'Extra 1', amount: '1 cup', cost: 1.99 },
          { item: 'Extra 2', amount: '2 tbsp', cost: 0.99 }
        ],
        instructions: ['Step 1', 'Step 2'],
        nutritionInfo: {
          calories: 300,
          protein: 20,
          carbs: 30,
          fat: 10,
          fiber: 5,
          sugar: 8,
          sodium: 200,
          servings: 2
        },
        dietaryInfo: {
          restrictions: ['Vegetarian'],
          allergens: []
        }
      };
      
      trackRecipeSave(recipe, true);
      setEventCount(prev => prev + 1);
      Alert.alert('Event Generated', 'Recipe save event logged to Firebase');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate recipe save event');
    }
  };
  
  const generateDietaryToggleEvent = async () => {
    try {
      const preferences = ['Vegetarian', 'Gluten-Free', 'Keto', 'Vegan', 'Low-Carb'];
      const randomPreference = preferences[Math.floor(Math.random() * preferences.length)];
      
      trackDietaryPreferenceToggle(randomPreference, 'restriction', true);
      setEventCount(prev => prev + 1);
      Alert.alert('Event Generated', `Dietary preference toggle (${randomPreference}) logged to Firebase`);
    } catch (error) {
      Alert.alert('Error', 'Failed to generate dietary preference event');
    }
  };
  
  const generateCustomEvent = async () => {
    try {
      await logAnalyticsEvent('custom_debug_event', {
        timestamp: new Date().toISOString(),
        random_value: Math.random(),
        test_parameter: 'test_value'
      });
      setEventCount(prev => prev + 1);
      Alert.alert('Event Generated', 'Custom debug event logged to Firebase');
    } catch (error) {
      Alert.alert('Error', 'Failed to generate custom event');
    }
  };
  
  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <ThemedText style={styles.title}>Analytics Debug Tool</ThemedText>
        
        <ThemedText style={styles.description}>
          This screen allows you to generate test analytics events that will be sent to Firebase.
          These events will appear in your dashboard.
        </ThemedText>
        
        <View style={styles.statsCard}>
          <ThemedText style={styles.statsTitle}>Events Generated This Session</ThemedText>
          <ThemedText style={styles.statsValue}>{eventCount}</ThemedText>
          {lastEventTime && (
            <ThemedText style={styles.statsSubtitle}>Last event at {lastEventTime}</ThemedText>
          )}
        </View>
        
        <TouchableOpacity 
          style={styles.button} 
          onPress={handleGenerateEvents}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <ThemedText style={styles.buttonText}>Generate All Test Events</ThemedText>
          )}
        </TouchableOpacity>
        
        <ThemedText style={styles.sectionTitle}>Individual Event Types</ThemedText>
        
        <View style={styles.buttonGroup}>
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={generateRecipeViewEvent}
          >
            <ThemedText style={styles.smallButtonText}>Recipe View</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={generateRecipeSaveEvent}
          >
            <ThemedText style={styles.smallButtonText}>Recipe Save</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={generateDietaryToggleEvent}
          >
            <ThemedText style={styles.smallButtonText}>Dietary Toggle</ThemedText>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.smallButton} 
            onPress={generateCustomEvent}
          >
            <ThemedText style={styles.smallButtonText}>Custom Event</ThemedText>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.checkButton} 
          onPress={checkFirebaseEvents}
        >
          <ThemedText style={styles.checkButtonText}>Check Firebase Events</ThemedText>
        </TouchableOpacity>
        
        {result && (
          <View style={styles.resultContainer}>
            <ThemedText style={styles.resultText}>{result}</ThemedText>
          </View>
        )}
        
        <ThemedText style={styles.note}>
          Note: This tool is for development and testing purposes only.
          It will create sample analytics events in your Firebase database.
        </ThemedText>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 24,
  },
  statsCard: {
    backgroundColor: '#4F46E5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 24,
    alignItems: 'center',
  },
  statsTitle: {
    color: 'white',
    fontSize: 14,
    opacity: 0.9,
  },
  statsValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginTop: 8,
  },
  button: {
    backgroundColor: '#4F46E5',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  smallButton: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
    width: '48%',
  },
  smallButtonText: {
    color: '#4F46E5',
    fontSize: 14,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
  note: {
    fontSize: 14,
    fontStyle: 'italic',
    opacity: 0.7,
    marginTop: 20,
  },
  statsSubtitle: {
    color: 'white',
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  checkButton: {
    backgroundColor: '#22C55E',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  checkButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
}); 