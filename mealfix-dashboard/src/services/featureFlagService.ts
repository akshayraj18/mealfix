import { db, logEvent, DashboardEvents } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export enum FeatureFlagStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  PERCENTAGE_ROLLOUT = 'percentage_rollout'
}

export enum ABTestStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface FeatureFlag {
  id?: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  rolloutPercentage?: number; // Used when status is PERCENTAGE_ROLLOUT
  platforms: string[]; // 'android', 'ios', 'web'
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ABTest {
  id?: string;
  name: string;
  description: string;
  status: ABTestStatus;
  startDate: Date;
  endDate?: Date;
  controlGroup: {
    name: string;
    description: string;
    percentage: number;
  };
  variantGroup: {
    name: string;
    description: string;
    percentage: number;
  };
  metrics: string[]; // Metrics to track for this test
  createdAt?: Date;
  updatedAt?: Date;
}

const FEATURE_FLAGS_COLLECTION = 'feature_flags';
const AB_TESTS_COLLECTION = 'ab_tests';

// Feature Flag CRUD operations
export async function getFeatureFlags(): Promise<FeatureFlag[]> {
  try {
    const featureFlagsRef = collection(db, FEATURE_FLAGS_COLLECTION);
    const featureFlagsQuery = query(featureFlagsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(featureFlagsQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status as FeatureFlagStatus,
        rolloutPercentage: data.rolloutPercentage,
        platforms: data.platforms,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
  } catch (error) {
    console.error('Error fetching feature flags:', error);
    // Return dummy data for now
    return [
      {
        id: 'flag1',
        name: 'Enable New Recipe UI',
        description: 'Enables the new recipe card UI with improved layouts',
        status: FeatureFlagStatus.PERCENTAGE_ROLLOUT,
        rolloutPercentage: 50,
        platforms: ['android', 'ios', 'web'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'flag2',
        name: 'Dietary Preferences Quick Access',
        description: 'Shows dietary preferences button in main navigation',
        status: FeatureFlagStatus.ENABLED,
        platforms: ['android', 'ios'],
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'flag3',
        name: 'Advanced Nutritional Info',
        description: 'Shows expanded nutritional information in recipe details',
        status: FeatureFlagStatus.DISABLED,
        platforms: ['android', 'ios', 'web'],
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];
  }
}

export async function getFeatureFlag(id: string): Promise<FeatureFlag | null> {
  try {
    const featureFlagRef = doc(db, FEATURE_FLAGS_COLLECTION, id);
    const docSnap = await getDoc(featureFlagRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        status: data.status as FeatureFlagStatus,
        rolloutPercentage: data.rolloutPercentage,
        platforms: data.platforms,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching feature flag:', error);
    return null;
  }
}

export async function createFeatureFlag(featureFlag: FeatureFlag): Promise<string> {
  try {
    const featureFlagData = {
      ...featureFlag,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, FEATURE_FLAGS_COLLECTION), featureFlagData);
    
    // Log event
    await logEvent(DashboardEvents.CREATE_FEATURE_FLAG, {
      flagName: featureFlag.name,
      status: featureFlag.status
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating feature flag:', error);
    throw new Error('Failed to create feature flag');
  }
}

export async function updateFeatureFlag(id: string, featureFlag: Partial<FeatureFlag>): Promise<void> {
  try {
    const featureFlagRef = doc(db, FEATURE_FLAGS_COLLECTION, id);
    
    const updateData = {
      ...featureFlag,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(featureFlagRef, updateData);
    
    // Log event
    await logEvent(DashboardEvents.UPDATE_FEATURE_FLAG, {
      flagId: id,
      flagName: featureFlag.name,
      newStatus: featureFlag.status
    });
  } catch (error) {
    console.error('Error updating feature flag:', error);
    throw new Error('Failed to update feature flag');
  }
}

export async function deleteFeatureFlag(id: string): Promise<void> {
  try {
    const featureFlagRef = doc(db, FEATURE_FLAGS_COLLECTION, id);
    await deleteDoc(featureFlagRef);
  } catch (error) {
    console.error('Error deleting feature flag:', error);
    throw new Error('Failed to delete feature flag');
  }
}

// A/B Test CRUD operations
export async function getABTests(): Promise<ABTest[]> {
  try {
    const abTestsRef = collection(db, AB_TESTS_COLLECTION);
    const abTestsQuery = query(abTestsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(abTestsQuery);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name,
        description: data.description,
        status: data.status as ABTestStatus,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        controlGroup: data.controlGroup,
        variantGroup: data.variantGroup,
        metrics: data.metrics,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    });
  } catch (error) {
    console.error('Error fetching A/B tests:', error);
    // Return dummy data for now
    return [
      {
        id: 'test1',
        name: 'Recipe Card Layout Test',
        description: 'Testing different layouts for recipe cards to increase engagement',
        status: ABTestStatus.ACTIVE,
        startDate: new Date('2023-10-01'),
        controlGroup: {
          name: 'Current Layout',
          description: 'Current card layout with image on top',
          percentage: 50
        },
        variantGroup: {
          name: 'New Layout',
          description: 'New card layout with image on the side',
          percentage: 50
        },
        metrics: ['click_rate', 'save_rate', 'time_on_page'],
        createdAt: new Date('2023-10-01'),
        updatedAt: new Date('2023-10-01')
      },
      {
        id: 'test2',
        name: 'Ingredient Display Test',
        description: 'Testing different ways to display ingredients',
        status: ABTestStatus.ACTIVE,
        startDate: new Date('2023-10-15'),
        controlGroup: {
          name: 'List View',
          description: 'Simple list view of ingredients',
          percentage: 50
        },
        variantGroup: {
          name: 'Card View',
          description: 'Card view with images for ingredients',
          percentage: 50
        },
        metrics: ['recipe_completion_rate', 'ingredient_selection_time'],
        createdAt: new Date('2023-10-15'),
        updatedAt: new Date('2023-10-15')
      },
      {
        id: 'test3',
        name: 'Search Placement Test',
        description: 'Testing different placements for the search box',
        status: ABTestStatus.COMPLETED,
        startDate: new Date('2023-09-01'),
        endDate: new Date('2023-09-30'),
        controlGroup: {
          name: 'Top Placement',
          description: 'Search box at the top of the screen',
          percentage: 50
        },
        variantGroup: {
          name: 'Floating Button',
          description: 'Floating search button that expands on tap',
          percentage: 50
        },
        metrics: ['search_usage_rate', 'search_conversion_rate'],
        createdAt: new Date('2023-09-01'),
        updatedAt: new Date('2023-09-30')
      }
    ];
  }
}

export async function getABTest(id: string): Promise<ABTest | null> {
  try {
    const abTestRef = doc(db, AB_TESTS_COLLECTION, id);
    const docSnap = await getDoc(abTestRef);
    
    if (docSnap.exists()) {
      const data = docSnap.data();
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description,
        status: data.status as ABTestStatus,
        startDate: data.startDate?.toDate(),
        endDate: data.endDate?.toDate(),
        controlGroup: data.controlGroup,
        variantGroup: data.variantGroup,
        metrics: data.metrics,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate()
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching A/B test:', error);
    return null;
  }
}

export async function createABTest(abTest: ABTest): Promise<string> {
  try {
    const abTestData = {
      ...abTest,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    const docRef = await addDoc(collection(db, AB_TESTS_COLLECTION), abTestData);
    
    // Log event
    await logEvent(DashboardEvents.CREATE_AB_TEST, {
      testName: abTest.name,
      status: abTest.status
    });
    
    return docRef.id;
  } catch (error) {
    console.error('Error creating A/B test:', error);
    throw new Error('Failed to create A/B test');
  }
}

export async function updateABTest(id: string, abTest: Partial<ABTest>): Promise<void> {
  try {
    const abTestRef = doc(db, AB_TESTS_COLLECTION, id);
    
    const updateData = {
      ...abTest,
      updatedAt: serverTimestamp()
    };
    
    await updateDoc(abTestRef, updateData);
    
    // Log event
    await logEvent(DashboardEvents.UPDATE_AB_TEST, {
      testId: id,
      testName: abTest.name,
      newStatus: abTest.status
    });
  } catch (error) {
    console.error('Error updating A/B test:', error);
    throw new Error('Failed to update A/B test');
  }
}

export async function deleteABTest(id: string): Promise<void> {
  try {
    const abTestRef = doc(db, AB_TESTS_COLLECTION, id);
    await deleteDoc(abTestRef);
  } catch (error) {
    console.error('Error deleting A/B test:', error);
    throw new Error('Failed to delete A/B test');
  }
}

// Get results for an A/B test
export async function getABTestResults(testId: string): Promise<any> {
  try {
    // In a real implementation, you would query analytics data
    // to get metrics for each variant of the test
    
    // For now, return dummy data
    return {
      controlGroup: {
        impressions: 4325,
        conversions: 138,
        conversionRate: '3.2%'
      },
      variantGroup: {
        impressions: 4287,
        conversions: 201,
        conversionRate: '4.7%'
      },
      improvement: '+46.9%',
      confidence: '98.2%',
      status: 'Significant improvement detected'
    };
  } catch (error) {
    console.error('Error fetching A/B test results:', error);
    throw new Error('Failed to fetch A/B test results');
  }
} 