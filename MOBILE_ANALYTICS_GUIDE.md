# MealFix Mobile App Analytics Implementation Guide

This guide explains how to implement and use the analytics tracking system in your MealFix mobile app, leveraging Firebase Analytics and Firestore for real-time dashboards.

## Analytics Architecture

The MealFix analytics system uses a dual-tracking approach:

1. **Firebase Analytics** - For standard analytics dashboards and funnel analysis
2. **Firestore Event Collection** - For custom real-time dashboards

## Key Events to Track

Here are the most important events your app should track:

### User Events
- `user_login` - When a user logs in
- `user_signup` - When a user creates an account
- `screen_view` - User viewing a specific screen, with time spent

### Recipe Events
- `view_recipe` - User views a recipe detail
- `save_recipe` - User saves a recipe
- `generate_recipe` - User generates recipe suggestions
- `search_ingredients` - User searches with specific ingredients

### Interaction Events
- `dietary_toggle` - User changes dietary preferences
- `performance_metric` - App performance data

## Implementation Steps

### 1. Tracking User Login/Signup

Add tracking to your authentication flow:

```javascript
import { trackUserLogin, trackUserSignup } from '@/services/analyticsService';

// In your login function
async function handleLogin() {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    trackUserLogin('email');
  } catch (error) {
    console.error('Login error:', error);
  }
}

// In your signup function
async function handleSignup() {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    trackUserSignup('email');
  } catch (error) {
    console.error('Signup error:', error);
  }
}
```

### 2. Tracking Screen Views

To track how long users spend on each screen, use this pattern:

```javascript
import { useEffect } from 'react';
import { trackScreenView } from '@/services/analyticsService';

function YourScreen() {
  useEffect(() => {
    let screenStartTime = Date.now();
    
    return () => {
      // This will run when the component unmounts
      const timeSpentMs = Date.now() - screenStartTime;
      trackScreenView('your_screen_name', timeSpentMs);
    };
  }, []);
  
  // Component code...
}
```

### 3. Tracking Recipe Views and Saves

Our recipe detail screen already implements this:

```javascript
// When loading a recipe
trackRecipeView(recipe);

// When saving a recipe
handleSaveToggle = async () => {
  // ...
  if (!isSaved) {
    await saveRecipe(recipe);
    trackRecipeSave(recipe);
  }
  // ...
}
```

### 4. Tracking Recipe Generation

Add tracking to your recipe generation flow:

```javascript
import { RecipeEvents, logEvent } from '@/config/firebase';

async function generateRecipes() {
  const startTime = Date.now();
  
  // Log start of generation
  logEvent(RecipeEvents.GENERATE_RECIPE, {
    ingredient_count: ingredients.length,
    dietary_restrictions: dietaryPreferences.restrictions.length
  });
  
  try {
    // Recipe generation code...
    const recipes = await callLanguageModel();
    
    // Log successful generation
    const duration = Date.now() - startTime;
    logEvent('recipe_generation_success', {
      duration_ms: duration,
      recipe_count: recipes.length
    });
    
    return recipes;
  } catch (error) {
    // Log generation error
    logEvent(RecipeEvents.RECIPE_ERROR, {
      error_type: 'generation_failed',
      error_message: error.message
    });
    throw error;
  }
}
```

### 5. Tracking Performance Metrics

Periodically track app performance:

```javascript
import { trackPerformanceMetric } from '@/services/analyticsService';

// Track API call latency
async function fetchData() {
  const startTime = Date.now();
  try {
    const response = await fetch('/api/data');
    const data = await response.json();
    
    // Log API latency
    const duration = Date.now() - startTime;
    trackPerformanceMetric('api_latency', duration);
    
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

// Track app startup time
function measureAppStartup() {
  // Call this when app is fully rendered and interactive
  const startupTime = Date.now() - APP_LAUNCH_TIMESTAMP;
  trackPerformanceMetric('app_load_time', startupTime);
}
```

## Testing Your Analytics Implementation

### 1. Debug Mode

Enable Firebase Analytics debug mode in development:

```javascript
// in your App.js or equivalent entry file
if (__DEV__) {
  console.log('Firebase Analytics debug mode enabled');
  firebase.analytics().setAnalyticsCollectionEnabled(true);
}
```

### 2. Check Firestore Directly

After performing actions, check if events are being logged to Firestore:

1. Go to Firebase Console > Firestore Database
2. Navigate to the `analytics_events` collection
3. Verify your events are being recorded with proper parameters

### 3. Testing Different User Scenarios

Test analytics with different user types:
- New user sign up flow
- Returning user login flow
- Guest user browsing flow
- Recipe browsing and saving flow
- Feature interactions (dietary preferences, etc.)

## Using Feature Flags in Your App

The app uses feature flags to control feature availability:

```javascript
import { isFeatureEnabled } from '@/services/featureFlagService';

async function checkFeatureAvailability() {
  // Check if a new feature is enabled
  const isNewFeatureEnabled = await isFeatureEnabled('new_feature_name');
  
  if (isNewFeatureEnabled) {
    // Show or enable the new feature
  } else {
    // Show the standard experience
  }
}
```

## A/B Testing Implementation

The app supports A/B testing for UI and feature experiments:

```javascript
import { getABTestVariant, trackABTestConversion } from '@/services/featureFlagService';

async function setupScreenForABTest() {
  // Check which variant the user is assigned to
  const variant = await getABTestVariant('test_name');
  
  if (variant === 'control') {
    // Show control group experience
  } else if (variant === 'variant') {
    // Show experiment variant
  }
}

// Later, track a conversion event
function handleUserAction() {
  // When user performs the action you're measuring
  trackABTestConversion('test_name', 'button_click', 1);
}
```

## Best Practices

1. **Don't Over-track**: Only track meaningful events that provide actionable insights

2. **Consistent Naming**: Follow a consistent naming convention for events and parameters

3. **Handle Errors Gracefully**: Analytics should never crash your app or interrupt user experience

4. **User Privacy**: Ensure you're complying with privacy regulations and your privacy policy

5. **Test on Multiple Devices**: Verify analytics work across different device types and OS versions

6. **Use Standardized Parameters**: Use Firebase's recommended parameter names when possible

7. **Document Custom Events**: Keep documentation of your custom events and what they mean

## Troubleshooting

### Events Not Being Logged

1. Check internet connectivity
2. Verify Firebase configuration is correct
3. Ensure user is properly authenticated if required
4. Look for errors in console logs

### Data Not Showing in Firebase Dashboard

1. Firebase Analytics can take up to 24 hours to process events
2. Use Firestore collection to verify events are being sent
3. Check that the event names match what you expect in the dashboard

### Performance Issues

If analytics is causing performance issues:

1. Batch events when possible instead of sending individually
2. Reduce the frequency of performance metric tracking
3. Ensure you're not logging excessive data in event parameters 