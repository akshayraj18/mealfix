import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

interface NutritionInfoProps {
  nutritionInfo: {
    calories: number;
    protein: number;
    fat: number;
    carbs: number;
    fiber: number;
    sugar: number;
    sodium: number;
    servings: number;
  };
}

const NutritionInfo: React.FC<NutritionInfoProps> = ({ nutritionInfo }) => {
  const {
    calories,
    protein,
    fat,
    carbs,
    fiber,
    sugar,
    sodium,
    servings
  } = nutritionInfo;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <MaterialIcons name="pie-chart" size={24} color="#FF6B6B" />
        <ThemedText style={styles.headerText}>Nutrition Facts</ThemedText>
        <ThemedText style={styles.servingText}>Per Serving ({servings} servings)</ThemedText>
      </View>
      
      <View style={styles.divider} />
      
      <View style={styles.macroContainer}>
        <LinearGradient
          colors={['#FF6B6B', '#FF8B8B']}
          style={styles.calorieBox}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <ThemedText style={styles.calorieValue}>{calories}</ThemedText>
          <ThemedText style={styles.calorieLabel}>Calories</ThemedText>
        </LinearGradient>
        
        <View style={styles.macrosGrid}>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroValue}>{carbs}g</ThemedText>
            <ThemedText style={styles.macroLabel}>Carbs</ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroValue}>{protein}g</ThemedText>
            <ThemedText style={styles.macroLabel}>Protein</ThemedText>
          </View>
          <View style={styles.macroItem}>
            <ThemedText style={styles.macroValue}>{fat}g</ThemedText>
            <ThemedText style={styles.macroLabel}>Fat</ThemedText>
          </View>
        </View>
      </View>
      
      <View style={styles.detailsContainer}>
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Fiber</ThemedText>
          <ThemedText style={styles.detailValue}>{fiber}g</ThemedText>
        </View>
        <View style={styles.detailDivider} />
        
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Sugar</ThemedText>
          <ThemedText style={styles.detailValue}>{sugar}g</ThemedText>
        </View>
        <View style={styles.detailDivider} />
        
        <View style={styles.detailItem}>
          <ThemedText style={styles.detailLabel}>Sodium</ThemedText>
          <ThemedText style={styles.detailValue}>{sodium}mg</ThemedText>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 8,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
    color: '#1A1A1A',
  },
  servingText: {
    marginLeft: 'auto',
    fontSize: 14,
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  macroContainer: {
    padding: 16,
    flexDirection: 'row',
  },
  calorieBox: {
    width: 100,
    height: 100,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  calorieValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  calorieLabel: {
    fontSize: 14,
    color: 'white',
    marginTop: 4,
  },
  macrosGrid: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginLeft: 16,
  },
  macroItem: {
    width: '50%',
    height: 50,
    justifyContent: 'center',
    paddingLeft: 8,
  },
  macroValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A1A1A',
  },
  macroLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailsContainer: {
    backgroundColor: '#F7F9FC',
    padding: 16,
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1A1A1A',
  },
  detailDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
  },
});

export default NutritionInfo; 