import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Modal, ScrollView, TextInput, Platform } from 'react-native';
import { ThemedText } from './ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { logAnalyticsEvent } from '@/services/analyticsService';

export interface RecipeFilters {
  timeRange: {
    min: number | null;
    max: number | null;
  };
  difficulty: string[];
  nutrition: {
    calories: {
      min: number | null;
      max: number | null;
    };
    protein: {
      min: number | null;
      max: number | null;
    };
  };
}

interface RecipeFiltersProps {
  filters: RecipeFilters;
  onUpdateFilters: (filters: RecipeFilters) => void;
  onApplyFilters: () => void;
  activeFilterCount: number;
}

const difficultyOptions = ['Beginner', 'Intermediate', 'Advanced'];

export default function RecipeFiltersComponent({
  filters,
  onUpdateFilters,
  onApplyFilters,
  activeFilterCount,
}: RecipeFiltersProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [tempFilters, setTempFilters] = useState<RecipeFilters>({ ...filters });

  const applyFilters = () => {
    onUpdateFilters(tempFilters);
    onApplyFilters();
    setModalVisible(false);
    logAnalyticsEvent('filters_applied', { filters: JSON.stringify(tempFilters) });
  };

  const resetFilters = () => {
    const emptyFilters: RecipeFilters = {
      timeRange: { min: null, max: null },
      difficulty: [],
      nutrition: {
        calories: { min: null, max: null },
        protein: { min: null, max: null },
      },
    };
    setTempFilters(emptyFilters);
    onUpdateFilters(emptyFilters);
    onApplyFilters();
    setModalVisible(false);
    logAnalyticsEvent('filters_reset', { filters: JSON.stringify(emptyFilters) });
  };

  const toggleDifficulty = (difficulty: string) => {
    if (tempFilters.difficulty.includes(difficulty)) {
      setTempFilters({
        ...tempFilters,
        difficulty: tempFilters.difficulty.filter(d => d !== difficulty),
      });
    } else {
      setTempFilters({
        ...tempFilters,
        difficulty: [...tempFilters.difficulty, difficulty],
      });
    }
  };

  const updateTimeRange = (field: 'min' | 'max', value: string) => {
    const numValue = value === '' ? null : Number(value);
    setTempFilters({
      ...tempFilters,
      timeRange: {
        ...tempFilters.timeRange,
        [field]: numValue,
      },
    });
  };

  const updateNutritionValue = (
    nutrient: 'calories' | 'protein',
    field: 'min' | 'max',
    value: string
  ) => {
    const numValue = value === '' ? null : Number(value);
    setTempFilters({
      ...tempFilters,
      nutrition: {
        ...tempFilters.nutrition,
        [nutrient]: {
          ...tempFilters.nutrition[nutrient],
          [field]: numValue,
        },
      },
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.filterButton}
        onPress={() => {
          setTempFilters({ ...filters });
          setModalVisible(true);
        }}
      >
        <LinearGradient
          colors={activeFilterCount > 0 ? ['#FF6B6B', '#FF8B8B'] : ['#f0f0f0', '#e0e0e0']}
          style={styles.filterButtonGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <MaterialIcons
            name="filter-list"
            size={20}
            color={activeFilterCount > 0 ? '#fff' : '#666'}
          />
          <ThemedText
            style={[
              styles.filterButtonText,
              { color: activeFilterCount > 0 ? '#fff' : '#666' },
            ]}
          >
            {activeFilterCount > 0
              ? `Filters (${activeFilterCount})`
              : 'Filters'}
          </ThemedText>
        </LinearGradient>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <ThemedText style={styles.modalTitle}>Recipe Filters</ThemedText>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Cooking Time Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.sectionTitle}>
                  <MaterialIcons name="timer" size={20} color="#FF6B6B" /> Cooking Time (minutes)
                </ThemedText>
                <View style={styles.rangeInputContainer}>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Min</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.timeRange.min?.toString() || ''}
                      onChangeText={(value) => updateTimeRange('min', value)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <ThemedText style={styles.rangeSeparator}>to</ThemedText>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Max</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.timeRange.max?.toString() || ''}
                      onChangeText={(value) => updateTimeRange('max', value)}
                      keyboardType="numeric"
                      placeholder="120+"
                    />
                  </View>
                </View>
              </View>

              {/* Difficulty Filter */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.sectionTitle}>
                  <MaterialIcons name="school" size={20} color="#FF6B6B" /> Difficulty Level
                </ThemedText>
                <View style={styles.difficultyOptions}>
                  {difficultyOptions.map((difficulty) => (
                    <TouchableOpacity
                      key={difficulty}
                      style={[
                        styles.difficultyOption,
                        tempFilters.difficulty.includes(difficulty) &&
                          styles.difficultyOptionSelected,
                      ]}
                      onPress={() => toggleDifficulty(difficulty)}
                    >
                      {tempFilters.difficulty.includes(difficulty) && (
                        <MaterialIcons name="check" size={16} color="#fff" style={styles.checkIcon} />
                      )}
                      <ThemedText
                        style={[
                          styles.difficultyOptionText,
                          tempFilters.difficulty.includes(difficulty) &&
                            styles.difficultyOptionTextSelected,
                        ]}
                      >
                        {difficulty}
                      </ThemedText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Nutrition Filters */}
              <View style={styles.filterSection}>
                <ThemedText style={styles.sectionTitle}>
                  <MaterialIcons name="local-fire-department" size={20} color="#FF6B6B" /> Calories
                </ThemedText>
                <View style={styles.rangeInputContainer}>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Min</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.nutrition.calories.min?.toString() || ''}
                      onChangeText={(value) => updateNutritionValue('calories', 'min', value)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <ThemedText style={styles.rangeSeparator}>to</ThemedText>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Max</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.nutrition.calories.max?.toString() || ''}
                      onChangeText={(value) => updateNutritionValue('calories', 'max', value)}
                      keyboardType="numeric"
                      placeholder="1000+"
                    />
                  </View>
                </View>
              </View>

              <View style={styles.filterSection}>
                <ThemedText style={styles.sectionTitle}>
                  <MaterialIcons name="fitness-center" size={20} color="#FF6B6B" /> Protein (g)
                </ThemedText>
                <View style={styles.rangeInputContainer}>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Min</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.nutrition.protein.min?.toString() || ''}
                      onChangeText={(value) => updateNutritionValue('protein', 'min', value)}
                      keyboardType="numeric"
                      placeholder="0"
                    />
                  </View>
                  <ThemedText style={styles.rangeSeparator}>to</ThemedText>
                  <View style={styles.rangeInput}>
                    <ThemedText style={styles.rangeLabel}>Max</ThemedText>
                    <TextInput
                      style={styles.rangeTextInput}
                      value={tempFilters.nutrition.protein.max?.toString() || ''}
                      onChangeText={(value) => updateNutritionValue('protein', 'max', value)}
                      keyboardType="numeric"
                      placeholder="100+"
                    />
                  </View>
                </View>
              </View>
            </ScrollView>

            <View style={styles.modalFooter}>
              <TouchableOpacity style={styles.resetButton} onPress={resetFilters}>
                <ThemedText style={styles.resetButtonText}>Reset</ThemedText>
              </TouchableOpacity>
              <TouchableOpacity style={styles.applyButton} onPress={applyFilters}>
                <LinearGradient
                  colors={['#FF6B6B', '#FF8B8B']}
                  style={styles.applyButtonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                >
                  <ThemedText style={styles.applyButtonText}>Apply Filters</ThemedText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
  },
  filterButton: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  filterButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  filterButtonText: {
    marginLeft: 5,
    fontWeight: '500',
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    padding: 16,
  },
  modalFooter: {
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  filterSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1A1A1A',
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  rangeInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rangeInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
  },
  rangeLabel: {
    fontSize: 16,
    color: '#1A1A1A',
    marginBottom: 4,
  },
  rangeTextInput: {
    paddingVertical: 4,
    fontSize: 16,
  },
  rangeSeparator: {
    fontSize: 16,
    color: '#1A1A1A',
    marginHorizontal: 8,
    alignSelf: 'center',
  },
  difficultyOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  difficultyOption: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    alignItems: 'center',
  },
  difficultyOptionSelected: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  difficultyOptionText: {
    color: '#1A1A1A',
    fontSize: 16,
  },
  difficultyOptionTextSelected: {
    color: '#fff',
  },
  checkIcon: {
    marginRight: 4,
  },
  resetButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
  },
  resetButtonText: {
    textAlign: 'center',
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '500',
  },
  applyButton: {
    flex: 1,
    marginLeft: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  applyButtonGradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
}); 