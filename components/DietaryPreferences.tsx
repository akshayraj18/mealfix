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
import { DietaryRestriction, DietaryPreferences, DietaryAllergies, DietaryPlan } from '../types/dietary';
import { logEvent, RecipeEvents } from '@/config/firebase';

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
  'kosher',
  'halal',
  'soy-free'
];

const commonAllergies: DietaryAllergies[] = [
  'peanuts',
  'tree nuts',
  'milk',
  'eggs',
  'shellfish',
  'soy',
  'wheat',
  'fish'
];

const commonPreferences: DietaryPlan[] = [
  'keto',
  'paleo',
  'low-carb',
  'high-protein',
  'mediterranean',
  'intermittent fasting',
  'low-sodium',
  'plant-based'
];

export default function DietaryPreferencesComponent({
  preferences,
  onUpdate,
}: DietaryPreferencesProps) {
  const [newRestriction, setNewRestriction] = useState('');
  const [newAllergy, setNewAllergy] = useState('');
  const [newDietPlan, setNewDietPlan] = useState('');

  // Helper function to capitalize first letter
  const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

  // RESTRICTIONS
  const toggleRestriction = (restriction: DietaryRestriction) => {
    const isAdding = !preferences.restrictions.includes(restriction);
    
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      restriction,
      action: isAdding ? 'add' : 'remove',
      category: 'restriction'
    });

    const updatedRestrictions = isAdding
      ? [...preferences.restrictions, restriction]
      : preferences.restrictions.filter(r => r !== restriction);
    
    onUpdate({ ...preferences, restrictions: updatedRestrictions });
  };

  const addCustomRestriction = () => {
    const restriction = newRestriction.trim().toLowerCase();
    if (restriction && !preferences.restrictions.includes(restriction as DietaryRestriction)) {
      logEvent(RecipeEvents.DIETARY_TOGGLE, {
        restriction,
        action: 'add',
        category: 'restriction'
      });

      onUpdate({
        ...preferences,
        restrictions: [...preferences.restrictions, restriction as DietaryRestriction],
      });
      setNewRestriction('');
    }
  };

  const removeCustomRestriction = (restriction: string) => {
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      restriction,
      action: 'remove',
      category: 'restriction'
    });

    onUpdate({
      ...preferences,
      restrictions: preferences.restrictions.filter(r => r !== restriction),
    });
  };

  // ALLERGIES (updated with duplicate prevention)
  const toggleAllergy = (allergy: DietaryAllergies) => {
    const isAdding = !preferences.allergies.includes(allergy);
  
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      allergy,
      action: isAdding ? 'add' : 'remove',
      category: 'allergy'
    });
  
    const updatedAllergies = isAdding
      ? [...preferences.allergies, allergy]
      : preferences.allergies.filter(a => a !== allergy);
  
    onUpdate({ ...preferences, allergies: updatedAllergies });
  };

  const addCustomAllergy = () => {
    const allergy = newAllergy.trim().toLowerCase();
    if (allergy && !preferences.allergies.includes(allergy as DietaryAllergies)) {
      logEvent(RecipeEvents.DIETARY_TOGGLE, {
        allergy,
        action: 'add',
        category: 'allergy'
      });

      onUpdate({
        ...preferences,
        allergies: [...preferences.allergies, allergy as DietaryAllergies],
      });
      setNewAllergy('');
    }
  };

  const removeCustomAllergy = (allergy: string) => {
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      allergy,
      action: 'remove',
      category: 'allergy'
    });

    onUpdate({
      ...preferences,
      allergies: preferences.allergies.filter(a => a !== allergy),
    });
  };

  // DIET PLANS
  const toggleDietPlan = (dietPlan: DietaryPlan) => {
    const isAdding = !(preferences.preferences || []).includes(dietPlan);
  
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      dietPlan,
      action: isAdding ? 'add' : 'remove',
      category: 'diet_plan'
    });
  
    const updatedDietPlan = isAdding
      ? [...(preferences.preferences || []), dietPlan]
      : preferences.preferences?.filter(dp => dp !== dietPlan) || [];
  
    onUpdate({ ...preferences, preferences: updatedDietPlan });
  };

  const addCustomDietPlan = () => {
    const dietPlan = newDietPlan.trim().toLowerCase();
    if (dietPlan && !(preferences.preferences || []).includes(dietPlan as DietaryPlan)) {
      logEvent(RecipeEvents.DIETARY_TOGGLE, {
        dietPlan,
        action: 'add',
        category: 'diet_plan'
      });

      onUpdate({
        ...preferences,
        preferences: [...(preferences.preferences || []), dietPlan as DietaryPlan],
      });
      setNewDietPlan('');
    }
  };

  const removeCustomDietPlan = (dietPlan: string) => {
    logEvent(RecipeEvents.DIETARY_TOGGLE, {
      dietPlan,
      action: 'remove',
      category: 'diet_plan'
    });

    onUpdate({
      ...preferences,
      preferences: preferences.preferences?.filter(dp => dp !== dietPlan) || [],
    });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Dietary Restrictions */}
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
              {restriction.charAt(0).toUpperCase() + restriction.slice(1).replace('-', ' ')}
            </Text>
            {preferences.restrictions.includes(restriction) && (
              <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Custom restrictions */}
        {preferences.restrictions
          .filter(r => !commonRestrictions.includes(r as DietaryRestriction))
          .map((restriction) => (
            <TouchableOpacity
              key={restriction}
              style={[styles.restrictionChip, styles.selectedChip]}
              onPress={() => removeCustomRestriction(restriction)}
            >
              <Text style={[styles.restrictionText, styles.selectedText]}>
                {capitalize(restriction.replace('-', ' '))}
              </Text>
              <MaterialIcons name="close" size={16} color="#fff" style={styles.checkIcon} />
            </TouchableOpacity>
          ))}
      </View>

      {/* Add Custom Restriction */}
      <View style={styles.addAllergyContainer}>
        <TextInput
          style={styles.input}
          value={newRestriction}
          onChangeText={setNewRestriction}
          placeholder="Add custom restriction"
          onSubmitEditing={addCustomRestriction}
        />
        <TouchableOpacity onPress={addCustomRestriction} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
  
      {/* Allergies */}
      <Text style={styles.sectionTitle}>Allergies</Text>
      <View style={styles.allergiesContainer}>
        {/* Common allergies */}
        {commonAllergies.map((allergy) => (
          <TouchableOpacity
            key={allergy}
            style={[
              styles.allergyChip,
              preferences.allergies.includes(allergy) && styles.selectedChip,
            ]}
            onPress={() => toggleAllergy(allergy)}
          >
            <Text
              style={[
                styles.restrictionText,
                preferences.allergies.includes(allergy) && styles.selectedText,
              ]}
            >
              {capitalize(allergy)}
            </Text>
            {preferences.allergies.includes(allergy) && (
              <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Custom allergies */}
        {preferences.allergies
          .filter(a => !commonAllergies.includes(a as DietaryAllergies))
          .map((allergy) => (
            <TouchableOpacity
              key={allergy}
              style={[styles.allergyChip, styles.selectedChip]}
              onPress={() => removeCustomAllergy(allergy)}
            >
              <Text style={[styles.restrictionText, styles.selectedText]}>
                {capitalize(allergy)}
              </Text>
              <MaterialIcons name="close" size={16} color="#fff" style={styles.checkIcon} />
            </TouchableOpacity>
          ))}
      </View>

      {/* Add Allergy */}
      <View style={styles.addAllergyContainer}>
        <TextInput
          style={styles.input}
          value={newAllergy}
          onChangeText={setNewAllergy}
          placeholder="Add custom allergy"
          onSubmitEditing={addCustomAllergy}
        />
        <TouchableOpacity onPress={addCustomAllergy} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
  
      {/* Diet Plan */}
      <Text style={styles.sectionTitle}>Diet Plan</Text>
      <View style={styles.dietPlanContainer}>
        {/* Common diet plans */}
        {commonPreferences.map((plan) => (
          <TouchableOpacity
            key={plan}
            style={[
              styles.dietPlanChip,
              (preferences.preferences || []).includes(plan) && styles.selectedChip,
            ]}
            onPress={() => toggleDietPlan(plan)}
          >
            <Text
              style={[
                styles.restrictionText,
                (preferences.preferences || []).includes(plan) && styles.selectedText,
              ]}
            >
              {capitalize(plan)}
            </Text>
            {(preferences.preferences || []).includes(plan) && (
              <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
            )}
          </TouchableOpacity>
        ))}
        
        {/* Custom diet plans */}
        {(preferences.preferences || [])
          .filter(p => !commonPreferences.includes(p as DietaryPlan))
          .map((plan) => (
            <TouchableOpacity
              key={plan}
              style={[styles.dietPlanChip, styles.selectedChip]}
              onPress={() => removeCustomDietPlan(plan)}
            >
              <Text style={[styles.restrictionText, styles.selectedText]}>
                {capitalize(plan)}
              </Text>
              <MaterialIcons name="close" size={16} color="#fff" style={styles.checkIcon} />
            </TouchableOpacity>
          ))}
      </View>
  
      {/* Add Diet Plan */}
      <View style={styles.addDietPlanContainer}>
        <TextInput
          style={styles.input}
          value={newDietPlan}
          onChangeText={setNewDietPlan}
          placeholder="Add custom diet plan"
          onSubmitEditing={addCustomDietPlan}
        />
        <TouchableOpacity onPress={addCustomDietPlan} style={styles.addButton}>
          <MaterialIcons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
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
    fontSize: 14,
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
    flexDirection: 'row',
    flexWrap: "wrap",
    gap: 8,
  },
  dietPlanChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    marginBottom: 8
  },
  addDietPlanContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

