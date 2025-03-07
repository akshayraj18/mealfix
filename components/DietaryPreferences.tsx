import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { DietaryRestriction, DietaryPreferences } from '../types/dietary';

interface DietaryPreferencesProps {
  preferences: DietaryPreferences;
  onUpdate: (preferences: DietaryPreferences) => void;
}

const commonRestrictions: DietaryRestriction[] = [
  'vegetarian',
  'vegan',
  'gluten-free',
  'dairy-free',
  'nut-free',
  'shellfish-free',
  'soy-free',
  'egg-free',
  'fish-free',
  'halal',
  'kosher',
  'low-carb',
  'keto',
  'paleo',
  'mediterranean',
  'low-fat',
  'low-sodium',
  'diabetic-friendly',
];

export default function DietaryPreferencesComponent({
  preferences,
  onUpdate,
}: DietaryPreferencesProps) {
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietPlan, setNewDietPlan] = useState('');

  const toggleRestriction = (restriction: DietaryRestriction) => {
    const updatedRestrictions = preferences.restrictions.includes(restriction)
      ? preferences.restrictions.filter(r => r !== restriction)
      : [...preferences.restrictions, restriction];
    
    onUpdate({
      ...preferences,
      restrictions: updatedRestrictions,
    });
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      onUpdate({
        ...preferences,
        allergies: [...preferences.allergies, newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (allergy: string) => {
    onUpdate({
      ...preferences,
      allergies: preferences.allergies.filter(a => a !== allergy),
    });
  };

  const updateDietPlan = () => {
    if (newDietPlan.trim()) {
      onUpdate({
        ...preferences,
        dietPlan: newDietPlan.trim(),
      });
      setNewDietPlan('');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.sectionTitle}>Dietary Restrictions</Text>
      <View style={styles.restrictionsContainer}>
        {commonRestrictions.map((restriction) => (
          <TouchableOpacity
            key={restriction}
            style={[
              styles.restrictionChip,
              preferences.restrictions.includes(restriction) && styles.selectedChip,
            ]}
            onPress={() => toggleRestriction(restriction)}
          >
            <Text
              style={[
                styles.restrictionText,
                preferences.restrictions.includes(restriction) && styles.selectedText,
              ]}
            >
              {restriction.replace('-', ' ')}
            </Text>
            {preferences.restrictions.includes(restriction) && (
              <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>Allergies</Text>
      <View style={styles.allergiesContainer}>
        {preferences.allergies.map((allergy) => (
          <View key={allergy} style={styles.allergyChip}>
            <Text style={styles.allergyText}>{allergy}</Text>
            <TouchableOpacity
              onPress={() => removeAllergy(allergy)}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ))}
        <View style={styles.addAllergyContainer}>
          <TextInput
            style={styles.input}
            value={newAllergy}
            onChangeText={setNewAllergy}
            placeholder="Add allergy"
            onSubmitEditing={addAllergy}
          />
          <TouchableOpacity onPress={addAllergy} style={styles.addButton}>
            <MaterialIcons name="add" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Diet Plan</Text>
      <View style={styles.dietPlanContainer}>
        {preferences.dietPlan ? (
          <View style={styles.dietPlanChip}>
            <Text style={styles.dietPlanText}>{preferences.dietPlan}</Text>
            <TouchableOpacity
              onPress={() => onUpdate({ ...preferences, dietPlan: undefined })}
              style={styles.removeButton}
            >
              <MaterialIcons name="close" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.addDietPlanContainer}>
            <TextInput
              style={styles.input}
              value={newDietPlan}
              onChangeText={setNewDietPlan}
              placeholder="Enter diet plan"
              onSubmitEditing={updateDietPlan}
            />
            <TouchableOpacity onPress={updateDietPlan} style={styles.addButton}>
              <MaterialIcons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 12,
    color: '#333',
  },
  restrictionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  restrictionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  selectedChip: {
    backgroundColor: '#007AFF',
  },
  restrictionText: {
    fontSize: 14,
    color: '#666',
  },
  selectedText: {
    color: '#fff',
  },
  checkIcon: {
    marginLeft: 4,
  },
  allergiesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  allergyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
    marginBottom: 8,
  },
  allergyText: {
    fontSize: 14,
    color: '#666',
  },
  removeButton: {
    marginLeft: 4,
  },
  addAllergyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  input: {
    flex: 1,
    height: 36,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 16,
    paddingHorizontal: 12,
    marginRight: 8,
    fontSize: 14,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dietPlanContainer: {
    marginBottom: 16,
  },
  dietPlanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
  },
  dietPlanText: {
    fontSize: 14,
    color: '#666',
  },
  addDietPlanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
}); 