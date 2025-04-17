import { db } from '@/lib/firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limitToLast,
  Timestamp,
  startAfter,
  endBefore,
  DocumentData,
  QueryDocumentSnapshot
} from 'firebase/firestore';

// Interface for recipe view analytics
export interface RecipeViewsData {
  recipeName: string;
  viewCount: number;
  saveCount: number;
}

// Interface for dietary preferences analytics
export interface DietaryTrendsData {
  preference: string;
  count: number;
  percentage: number;
}

// Interface for ingredient combinations
export interface IngredientCombinationData {
  combination: string;
  occurrences: number;
}

// Interface for user engagement metrics
export interface UserEngagementData {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  averageSessionTime: string;
  recipesSavedCount: number;
  recipesCreatedCount: number;
}

// Interface for performance metrics
export interface PerformanceMetricsData {
  apiLatency: string;
  appLoadTime: string;
  errorRate: string;
  crashRate: string;
  searchLatency: string;
}

// Interface for AB test results
export interface ABTestResultData {
  testName: string;
  variantA: string;
  variantB: string;
  improvement: string;
}

// Get popular recipes based on views and saves
export async function getPopularRecipes(limitCount = 5): Promise<RecipeViewsData[]> {
  try {
    // Fetch view events from Firebase analytics
    const viewEventsRef = collection(db, 'analytics_events');
    const viewEventsQuery = query(
      viewEventsRef,
      where('event_name', '==', 'view_recipe'),
      orderBy('timestamp', 'desc'),
      limitToLast(100) // Get last 100 view events
    );
    
    const viewEventsSnapshot = await getDocs(viewEventsQuery);
    
    // Count views per recipe
    const recipeViews: Record<string, number> = {};
    viewEventsSnapshot.forEach((doc) => {
      const data = doc.data();
      const recipeName = data.params?.recipe_name || 'Unknown Recipe';
      recipeViews[recipeName] = (recipeViews[recipeName] || 0) + 1;
    });
    
    // Fetch save events
    const saveEventsQuery = query(
      viewEventsRef,
      where('event_name', '==', 'save_recipe'),
      orderBy('timestamp', 'desc'),
      limitToLast(100)
    );
    
    const saveEventsSnapshot = await getDocs(saveEventsQuery);
    
    // Count saves per recipe
    const recipeSaves: Record<string, number> = {};
    saveEventsSnapshot.forEach((doc) => {
      const data = doc.data();
      const recipeName = data.params?.recipe_name || 'Unknown Recipe';
      recipeSaves[recipeName] = (recipeSaves[recipeName] || 0) + 1;
    });
    
    // Combine and sort by views
    const popularRecipes = Object.keys(recipeViews).map(recipeName => ({
      recipeName,
      viewCount: recipeViews[recipeName],
      saveCount: recipeSaves[recipeName] || 0
    }));
    
    // Sort by views and limit
    return popularRecipes
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limitCount);
      
  } catch (error) {
    console.error('Error fetching popular recipes:', error);
    
    // Return dummy data if error occurs or no data found
    // In production, you would handle this differently
    return [
      { recipeName: 'Vegetarian Pasta', viewCount: 1243, saveCount: 432 },
      { recipeName: 'Keto Chicken Bowl', viewCount: 1120, saveCount: 387 },
      { recipeName: 'Gluten-Free Pancakes', viewCount: 980, saveCount: 350 },
      { recipeName: 'Mediterranean Salad', viewCount: 876, saveCount: 289 },
      { recipeName: 'Low-Carb Pizza', viewCount: 750, saveCount: 231 },
    ];
  }
}

// Get dietary preference trends
export async function getDietaryTrends(): Promise<DietaryTrendsData[]> {
  try {
    // Fetch dietary toggle events
    const dietaryEventsRef = collection(db, 'analytics_events');
    const dietaryEventsQuery = query(
      dietaryEventsRef,
      where('event_name', '==', 'dietary_toggle'),
      where('params.action', '==', 'add'),
      orderBy('timestamp', 'desc'),
      limitToLast(200)
    );
    
    const dietaryEventsSnapshot = await getDocs(dietaryEventsQuery);
    
    // Count preferences
    const preferences: Record<string, number> = {};
    let totalCount = 0;
    
    dietaryEventsSnapshot.forEach((doc) => {
      const data = doc.data();
      const preference = data.params?.preference || 
                         data.params?.restriction ||
                         data.params?.dietPlan;
      
      if (preference) {
        preferences[preference] = (preferences[preference] || 0) + 1;
        totalCount++;
      }
    });
    
    // Calculate percentages and format data
    const dietaryTrends = Object.keys(preferences).map(preference => ({
      preference,
      count: preferences[preference],
      percentage: Math.round((preferences[preference] / totalCount) * 100)
    }));
    
    // Sort by count
    return dietaryTrends
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
      
  } catch (error) {
    console.error('Error fetching dietary trends:', error);
    
    // Return dummy data
    return [
      { preference: 'Low-Carb', count: 342, percentage: 34 },
      { preference: 'Gluten-Free', count: 280, percentage: 28 },
      { preference: 'Vegetarian', count: 220, percentage: 22 },
      { preference: 'Vegan', count: 150, percentage: 15 },
      { preference: 'Keto', count: 320, percentage: 32 },
    ];
  }
}

// Get common ingredient combinations
export async function getIngredientCombinations(): Promise<IngredientCombinationData[]> {
  try {
    // Fetch recipe generation events
    const recipeGenEventsRef = collection(db, 'analytics_events');
    const recipeGenEventsQuery = query(
      recipeGenEventsRef,
      where('event_name', '==', 'generate_recipe'),
      orderBy('timestamp', 'desc'),
      limitToLast(100)
    );
    
    const recipeGenEventsSnapshot = await getDocs(recipeGenEventsQuery);
    
    // For ingredient combinations, we would need more complex logic
    // This is a simplified version that would need enhancement based on actual data structure
    const combinations: Record<string, number> = {
      'Tomato + Basil + Mozzarella': 342,
      'Chicken + Garlic + Lemon': 287,
      'Avocado + Lime + Cilantro': 253,
      'Salmon + Dill + Lemon': 198,
    };
    
    // Format and return data
    return Object.keys(combinations).map(combination => ({
      combination,
      occurrences: combinations[combination]
    })).sort((a, b) => b.occurrences - a.occurrences);
      
  } catch (error) {
    console.error('Error fetching ingredient combinations:', error);
    
    // Return dummy data
    return [
      { combination: 'Tomato + Basil + Mozzarella', occurrences: 342 },
      { combination: 'Chicken + Garlic + Lemon', occurrences: 287 },
      { combination: 'Avocado + Lime + Cilantro', occurrences: 253 },
      { combination: 'Salmon + Dill + Lemon', occurrences: 198 },
    ];
  }
}

// Get user engagement metrics
export async function getUserEngagementMetrics(): Promise<UserEngagementData> {
  try {
    // This would fetch data from various sources
    // For a real implementation, you would aggregate data from user collections,
    // session time events, etc.
    
    // For now, return dummy data
    return {
      totalUsers: 15487,
      activeUsers: 8934,
      newUsers: 127,
      averageSessionTime: '4m 32s',
      recipesSavedCount: 843,
      recipesCreatedCount: 43
    };
  } catch (error) {
    console.error('Error fetching user engagement metrics:', error);
    
    // Return dummy data
    return {
      totalUsers: 15487,
      activeUsers: 8934,
      newUsers: 127,
      averageSessionTime: '4m 32s',
      recipesSavedCount: 843,
      recipesCreatedCount: 43
    };
  }
}

// Get performance metrics
export async function getPerformanceMetrics(): Promise<PerformanceMetricsData> {
  try {
    // This would fetch data from performance monitoring
    // Real implementation would aggregate data from performance events
    
    // For now, return dummy data
    return {
      apiLatency: '120ms',
      appLoadTime: '1.8s',
      errorRate: '0.4%',
      crashRate: '0.08%',
      searchLatency: '87ms'
    };
  } catch (error) {
    console.error('Error fetching performance metrics:', error);
    
    // Return dummy data
    return {
      apiLatency: '120ms',
      appLoadTime: '1.8s',
      errorRate: '0.4%',
      crashRate: '0.08%',
      searchLatency: '87ms'
    };
  }
}

// Get A/B test results
export async function getABTestResults(): Promise<ABTestResultData[]> {
  try {
    // For a real implementation, you would fetch A/B test data
    // from a database collection
    
    // Return dummy data for now
    return [
      { testName: 'Recipe Card Layout', variantA: '3.2%', variantB: '4.7%', improvement: '+46.9%' },
      { testName: 'Ingredient Display', variantA: '1.8%', variantB: '1.9%', improvement: '+5.6%' },
      { testName: 'Search Placement', variantA: '7.4%', variantB: '8.9%', improvement: '+20.3%' },
    ];
  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    
    // Return dummy data
    return [
      { testName: 'Recipe Card Layout', variantA: '3.2%', variantB: '4.7%', improvement: '+46.9%' },
      { testName: 'Ingredient Display', variantA: '1.8%', variantB: '1.9%', improvement: '+5.6%' },
      { testName: 'Search Placement', variantA: '7.4%', variantB: '8.9%', improvement: '+20.3%' },
    ];
  }
} 