import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { router } from 'expo-router';
import DietaryPreferencesComponent from '../../components/DietaryPreferences';
import { DietaryPreferences } from '../../types/dietary';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logEvent, RecipeEvents } from '@/config/firebase';

const DIETARY_PREFERENCES_KEY = '@dietary_preferences';

export default function PreferencesScreen() {
  const [preferences, setPreferences] = useState<DietaryPreferences>({
    restrictions: [],
    allergies: [],
  });
  const [screenStartTime] = useState(Date.now());

  useEffect(() => {
    loadPreferences();
    return () => {
      // Log screen time when component unmounts
      const timeSpent = Math.round((Date.now() - screenStartTime) / 1000); // Convert to seconds
      logEvent(RecipeEvents.SCREEN_TIME, {
        screen: 'preferences',
        timeSpentSeconds: timeSpent
      });
    };
  }, [screenStartTime]);

  const loadPreferences = async () => {
    try {
      const savedPreferences = await AsyncStorage.getItem(DIETARY_PREFERENCES_KEY);
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      Alert.alert('Error', 'Failed to load dietary preferences');
    }
  };

  const handleUpdatePreferences = async (newPreferences: DietaryPreferences) => {
    try {
      await AsyncStorage.setItem(DIETARY_PREFERENCES_KEY, JSON.stringify(newPreferences));
      setPreferences(newPreferences);
      Alert.alert('Success', 'Dietary preferences updated successfully');
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save dietary preferences');
    }
  };

  return (
    <View style={styles.container}>
      <DietaryPreferencesComponent
        preferences={preferences}
        onUpdate={handleUpdatePreferences}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
}); 