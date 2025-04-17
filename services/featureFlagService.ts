import { db, auth } from '@/config/firebase';
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { Platform } from 'react-native';

// Collections
const FEATURE_FLAGS_COLLECTION = 'feature_flags';
const AB_TESTS_COLLECTION = 'ab_tests';

// Feature flag statuses
export enum FeatureFlagStatus {
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  PERCENTAGE_ROLLOUT = 'percentage_rollout'
}

// AB test statuses
export enum ABTestStatus {
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed'
}

export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  status: FeatureFlagStatus;
  rolloutPercentage?: number;
  platforms: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ABTest {
  id: string;
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
  metrics: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Cache for feature flags to minimize Firestore reads
interface FeatureFlagCache {
  [key: string]: {
    flag: FeatureFlag;
    timestamp: number;
  };
}

// Cache time-to-live (5 minutes)
const CACHE_TTL = 5 * 60 * 1000;
const featureFlagCache: FeatureFlagCache = {};

/**
 * Check if a feature flag is enabled
 */
export async function isFeatureEnabled(flagName: string): Promise<boolean> {
  try {
    // Check cache first
    const cachedFlag = featureFlagCache[flagName];
    const now = Date.now();
    
    if (cachedFlag && (now - cachedFlag.timestamp < CACHE_TTL)) {
      return evaluateFeatureFlag(cachedFlag.flag);
    }
    
    // Query Firestore if not in cache or cache is expired
    const flagsQuery = query(
      collection(db, FEATURE_FLAGS_COLLECTION),
      where('name', '==', flagName)
    );
    
    const querySnapshot = await getDocs(flagsQuery);
    
    if (querySnapshot.empty) {
      console.log(`Feature flag ${flagName} not found`);
      return false;
    }
    
    const flagDoc = querySnapshot.docs[0];
    const flag = {
      id: flagDoc.id,
      ...flagDoc.data()
    } as FeatureFlag;
    
    // Update cache
    featureFlagCache[flagName] = {
      flag,
      timestamp: now
    };
    
    return evaluateFeatureFlag(flag);
  } catch (error) {
    console.error(`Error checking feature flag ${flagName}:`, error);
    return false;
  }
}

/**
 * Evaluate if a feature flag is enabled for the current user
 */
function evaluateFeatureFlag(flag: FeatureFlag): boolean {
  // Check platform compatibility
  const currentPlatform = getPlatform();
  if (!flag.platforms.includes(currentPlatform) && !flag.platforms.includes('all')) {
    return false;
  }
  
  // Check flag status
  switch (flag.status) {
    case FeatureFlagStatus.ENABLED:
      return true;
    
    case FeatureFlagStatus.DISABLED:
      return false;
    
    case FeatureFlagStatus.PERCENTAGE_ROLLOUT:
      return isUserInPercentageRollout(flag.rolloutPercentage || 0);
    
    default:
      return false;
  }
}

/**
 * Get which A/B test variant the current user is assigned to
 */
export async function getABTestVariant(testName: string): Promise<string | null> {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.log('User not authenticated, returning control variant');
      return 'control';
    }
    
    const testsQuery = query(
      collection(db, AB_TESTS_COLLECTION),
      where('name', '==', testName),
      where('status', '==', ABTestStatus.ACTIVE)
    );
    
    const querySnapshot = await getDocs(testsQuery);
    
    if (querySnapshot.empty) {
      console.log(`A/B test ${testName} not found or not active`);
      return null;
    }
    
    const testDoc = querySnapshot.docs[0];
    const test = {
      id: testDoc.id,
      ...testDoc.data()
    } as ABTest;
    
    return determineABTestVariant(test);
  } catch (error) {
    console.error(`Error getting A/B test variant for ${testName}:`, error);
    return null;
  }
}

/**
 * Track a conversion event for an A/B test
 */
export async function trackABTestConversion(testName: string, metricName: string, value: any): Promise<void> {
  // This would log the conversion to analytics
  // Implementation depends on your analytics setup
  console.log(`Tracking A/B test conversion: ${testName}, metric: ${metricName}, value: ${value}`);
}

/**
 * Determine which variant of an A/B test the current user is in
 */
function determineABTestVariant(test: ABTest): string {
  const user = auth.currentUser;
  if (!user) {
    return 'control';
  }
  
  // Use a hash of the user ID and test ID to consistently assign users to variants
  const hash = simpleHash(`${user.uid}-${test.id}`);
  
  // Assign 50/50 split (could be configurable in the future)
  return hash % 2 === 0 ? 'control' : 'variant';
}

/**
 * Get the current platform (web, ios, android)
 */
function getPlatform(): string {
  return Platform.OS; // 'ios', 'android', 'web', etc.
}

/**
 * Check if current user should be included in a percentage rollout
 */
function isUserInPercentageRollout(percentage: number): boolean {
  const user = auth.currentUser;
  if (!user) {
    return false;
  }
  
  // Use a hash of the user ID to consistently determine inclusion
  const hash = simpleHash(user.uid);
  const normalizedHash = hash % 100; // Get a number between 0-99
  
  return normalizedHash < percentage;
}

/**
 * Simple string hash function
 */
function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Ensure the hash is positive
  return Math.abs(hash);
} 