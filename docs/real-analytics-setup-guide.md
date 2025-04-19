# Setting Up Real Analytics Data for MealFix Dashboard

This guide will walk you through the process of setting up real analytics data collection in your MealFix mobile app, so the dashboard can display actual user behavior instead of dummy data.

## Overview

Currently, the MealFix dashboard (`mealfix-dashboard`) is set up to display data from Firebase Firestore collections, but falls back to dummy data when these collections don't exist or contain no data. To get real analytics data flowing, we need to:

1. Create the required Firestore collections
2. Modify the mobile app to log events to these collections
3. Ensure the dashboard can query and visualize this data

## Required Firestore Collections

The dashboard expects the following collections in your Firebase Firestore database:

1. `analytics_events` - Stores all user interactions and events
2. `feature_flags` - Stores feature flag configurations
3. `ab_tests` - Stores A/B test configurations and results

### The `analytics_events` Collection Structure

Each document in this collection should represent a single event with the following fields:

```
{
  "event_name": string,       // Name of the event (e.g., "recipe_view", "recipe_save")
  "user_id": string,          // Firebase Auth user ID (optional for anonymous events)
  "timestamp": timestamp,     // When the event occurred
  "session_id": string,       // To group events from the same session
  "platform": string,         // "ios", "android", or "web"
  "app_version": string,      // Version of the app when the event was logged
  "parameters": {             // Event-specific parameters
    // Varies based on event type, examples below:
    "recipe_name": string,    // For recipe-related events
    "dietary_preferences": string[], // For dietary preference events
    "search_query": string,   // For search events
    "ingredients": string[],  // For ingredient-related events
    "error_message": string,  // For error events
    "latency_ms": number      // For performance events
  }
}
```

## Implementing Analytics Tracking in the Mobile App

### Step 1: Update analyticsService.ts

Your app already has the Firebase Analytics set up in `config/firebase.ts`, but we need to also log events to Firestore for the dashboard to query them.

Open `services/analyticsService.ts` and add the following code to implement dual logging:

```typescript
import { firebase, db, auth, logEvent, AnalyticsEvents } from '../config/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { Recipe } from '../types/recipe';

// Collection name
const ANALYTICS_COLLECTION = 'analytics_events';

// Get session ID (generate once per app start)
const SESSION_ID = generateSessionId();

// Get current platform
const PLATFORM = getPlatform();

// Get app version
const APP_VERSION = getAppVersion();

/**
 * Logs an event to both Firebase Analytics and Firestore
 * @param eventName Event name from AnalyticsEvents
 * @param parameters Additional parameters for the event
 */
async function logAnalyticsEvent(eventName: string, parameters: Record<string, any> = {}) {
  try {
    // 1. Log to Firebase Analytics
    logEvent(eventName, parameters);
    
    // 2. Log to Firestore for dashboard
    const userId = auth.currentUser?.uid || 'anonymous';
    
    await addDoc(collection(db, ANALYTICS_COLLECTION), {
      event_name: eventName,
      user_id: userId,
      timestamp: serverTimestamp(),
      session_id: SESSION_ID,
      platform: PLATFORM,
      app_version: APP_VERSION,
      parameters
    });
    
    console.log(`Event ${eventName} logged successfully`);
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
}

// Helper functions
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

function getPlatform(): string {
  // This should be implemented based on the platform detection logic you're using
  // For example, using React Native's Platform module
  return 'ios'; // Placeholder - replace with actual platform detection
}

function getAppVersion(): string {
  // This should return the current app version
  return '1.0.0'; // Placeholder - replace with actual version retrieval
}

// Recipe interaction events
export function trackRecipeView(recipe: Recipe) {
  logAnalyticsEvent(AnalyticsEvents.RECIPE_VIEW, {
    recipe_name: recipe.name,
    difficulty: recipe.difficulty,
    prep_time: recipe.timeEstimate,
    dietary_restrictions: recipe.dietaryInfo
  });
}

export function trackRecipeSave(recipe: Recipe) {
  logAnalyticsEvent(AnalyticsEvents.RECIPE_SAVE, {
    recipe_name: recipe.name,
    difficulty: recipe.difficulty,
    prep_time: recipe.timeEstimate,
    dietary_restrictions: recipe.dietaryInfo
  });
}

// Dietary preference events
export function trackDietaryPreferenceToggle(preference: string, isEnabled: boolean) {
  logAnalyticsEvent(AnalyticsEvents.DIETARY_PREFERENCE_CHANGE, {
    preference,
    is_enabled: isEnabled
  });
}

// Screen time tracking
export function trackScreenTime(screenName: string, timeSpentSeconds: number) {
  logAnalyticsEvent(AnalyticsEvents.SCREEN_VIEW, {
    screen_name: screenName,
    time_spent_seconds: timeSpentSeconds
  });
}

// Ingredient search tracking
export function trackIngredientSearch(ingredients: string[]) {
  logAnalyticsEvent(AnalyticsEvents.INGREDIENT_SEARCH, {
    ingredients,
    count: ingredients.length
  });
}

// User events
export function trackUserLogin(method: string) {
  logAnalyticsEvent(AnalyticsEvents.USER_LOGIN, {
    login_method: method
  });
}

export function trackUserSignup(method: string) {
  logAnalyticsEvent(AnalyticsEvents.USER_SIGNUP, {
    signup_method: method
  });
}

// Performance metrics
export function trackPerformanceMetric(metricName: string, valueMs: number) {
  logAnalyticsEvent(AnalyticsEvents.PERFORMANCE, {
    metric_name: metricName,
    value_ms: valueMs
  });
}

// Export all tracking functions
export {
  logAnalyticsEvent
};
```

### Step 2: Add Analytics Tracking Calls Throughout the App

After implementing the analytics service, you need to add tracking calls at appropriate points in your app. Here are some key places to add tracking:

#### Recipe Screen

```typescript
import { trackRecipeView, trackRecipeSave } from '../services/analyticsService';

// When a recipe is viewed
useEffect(() => {
  trackRecipeView(recipe);
}, [recipe]);

// When a recipe is saved
const handleSaveRecipe = async () => {
  await saveRecipe(recipe);
  trackRecipeSave(recipe);
};
```

#### Search Screen

```typescript
import { trackIngredientSearch } from '../services/analyticsService';

// When user searches for ingredients
const handleSearch = (ingredients: string[]) => {
  trackIngredientSearch(ingredients);
  // ... rest of search logic
};
```

#### Authentication

```typescript
import { trackUserLogin, trackUserSignup } from '../services/analyticsService';

// When user logs in
const handleLogin = async (email: string, password: string) => {
  await signInWithEmailAndPassword(auth, email, password);
  trackUserLogin('email');
};

// When user signs up
const handleSignup = async (email: string, password: string) => {
  await createUserWithEmailAndPassword(auth, email, password);
  trackUserSignup('email');
};
```

#### Performance Tracking

```typescript
import { trackPerformanceMetric } from '../services/analyticsService';

// Track API call performance
const fetchData = async () => {
  const startTime = performance.now();
  try {
    const result = await api.getData();
    const endTime = performance.now();
    trackPerformanceMetric('api_latency', endTime - startTime);
    return result;
  } catch (error) {
    console.error(error);
    throw error;
  }
};
```

### Step 3: Setting Up Feature Flags and A/B Tests

To enable feature flag management and A/B testing from the dashboard:

1. Create initial feature flags in the Firestore collection:

```typescript
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

// Add a feature flag
async function createInitialFeatureFlags() {
  try {
    await addDoc(collection(db, 'feature_flags'), {
      name: 'enable_new_recipe_ui',
      description: 'Enables the new recipe card UI with improved layouts',
      status: 'percentage_rollout',
      rolloutPercentage: 50,
      platforms: ['android', 'ios', 'web'],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Initial feature flags created');
  } catch (error) {
    console.error('Error creating feature flags:', error);
  }
}
```

2. Create A/B test definitions:

```typescript
async function createInitialABTest() {
  try {
    await addDoc(collection(db, 'ab_tests'), {
      name: 'Recipe Card Layout Test',
      description: 'Testing different layouts for recipe cards to increase engagement',
      status: 'active',
      startDate: serverTimestamp(),
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Initial A/B test created');
  } catch (error) {
    console.error('Error creating A/B test:', error);
  }
}
```

## Verifying Your Setup

After implementing these changes, you should:

1. Use the app in development mode and verify events are being logged to Firestore
2. Check the Firebase console to confirm events are appearing in both Analytics and Firestore
3. Run the MealFix dashboard and confirm it's displaying real data instead of fallbacks

### Dashboard Checks

To verify the dashboard is using real data:

1. Start the dashboard: `cd mealfix-dashboard && npm run dev`
2. Open your browser console to see debug messages from the dashboard
3. Look for messages indicating data was fetched from Firestore collections
4. Absence of console messages like "No data found, using fallback data" indicates real data is being used

## Troubleshooting

### No Data Appearing in Dashboard

1. Check Firebase console to ensure events are being stored in the correct collection
2. Verify collection names match exactly what the dashboard expects
3. Ensure document field names match what the dashboard queries for
4. Check for any errors in the browser console when loading the dashboard

### Permission Errors

If you see permission errors when writing to Firestore:

1. Verify your security rules in Firebase console allow writing to these collections
2. Make sure the user has authenticated properly if your rules require authentication

## Next Steps

After setting up basic analytics tracking, consider:

1. Expanding the events you track for more detailed insights
2. Creating more complex A/B tests to optimize user experience
3. Setting up more feature flags to gradually roll out new features
4. Adding custom metrics specific to your app's success criteria

By following this guide, your MealFix dashboard will now display real user data instead of dummy data, giving you accurate insights into how users interact with your application. 