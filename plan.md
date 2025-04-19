# MealFix Analytics Implementation Plan

## Project Overview
MealFix is a mobile application for recipe generation based on ingredients users have on hand, with support for dietary preferences and restrictions. The app includes an analytics dashboard to track user engagement and recipe popularity.

## Current Status
- Basic app functionality is complete and working
- Firebase Analytics is partially implemented with direct event tracking
- A dual-tracking analytics system has been implemented (Firebase Analytics + Firestore)
- Dashboard setup is complete but showing dummy data
- Most UI components now have analytics tracking

## Immediate Issue: Tab Navigation Tracking
The app recently encountered a linter error with the tab navigation tracking implementation. We attempted to use the `listeners` property on the `Tabs` component in `app/(app)/_layout.tsx`, but this approach caused linter errors. Here's what we did to fix it:

1. Removed the `listeners` property from the Tabs component
2. Need to implement an alternative solution for tracking tab navigation

**Original problematic code:**
```typescript
// In app/(app)/_layout.tsx
const createTabPressHandler = (tabName: string) => {
  return {
    tabPress: () => {
      logAnalyticsEvent('tab_press', { tab_name: tabName });
    },
  };
};

// Using listeners on Tab component
<Tabs.Screen
  name="home"
  listeners={createTabPressHandler('home')}
  // ... other props
/>
```

**Alternative approach needed:**
We need to implement tab tracking using one of these approaches:
1. Using React Navigation's `NavigationContainer` events
2. Custom tab components with tracking
3. Screen-level tracking in each tab's main component

## Goals
1. Ensure all user interactions throughout the app are tracked properly
2. Make all analytics data available to the dashboard by storing events in Firestore
3. Complete any missing integrations in the app's components
4. Validate that real data flows correctly from app to dashboard

## File Structure Overview
- `/app/(app)`: Main app screens (home, recipe, saved-recipes, preferences)
- `/components`: UI components (DietaryPreferences, RecipeView, RecipeFilters, etc.)
- `/services`: Service modules including analyticsService.ts
- `/hooks`: Custom hooks including useAnalytics.ts
- `/config`: Configuration files including firebase.ts
- `/mealfix-dashboard`: Dashboard application that displays analytics data

## Implementation Details

### Analytics Service (`services/analyticsService.ts`)
The analytics service handles dual logging to both Firebase Analytics and Firestore:
- `logAnalyticsEvent`: Core function that logs to both systems
- Various tracking functions for specific events (recipe views, saves, searches, etc.)
- Dashboard data query functions with fallback dummy data

### Key Changes Made
1. Updated components to use the analytics service:
   - Recipe views/saves/sharing tracking
   - Screen time tracking
   - User interactions
   - Dietary preference toggles
   - Filter usage

2. Improved the useAnalytics hook with:
   - App state tracking
   - Screen time measurement
   - User interaction logging

## Pending Tasks

### 1. Implement Navigation Tracking
The app needs proper navigation tracking between screens:

```typescript
// Need to implement in each screen's navigation function
const navigate = (screen, params) => {
  logAnalyticsEvent('screen_navigation', {
    from_screen: currentScreen,
    to_screen: screen,
    params: JSON.stringify(params)
  });
  // Navigate to screen
};
```

### 2. Complete User Authentication Tracking
Ensure user sign-ups, logins, and logouts are properly tracked:

```typescript
// In authentication flows:
trackUserLogin(method); // When user logs in
trackUserSignup(method); // When user signs up
```

### 3. Add Error Tracking
Implement consistent error tracking across all API calls and critical functions:

```typescript
try {
  // Operation
} catch (error) {
  trackError('error_type', error.message, {
    component: 'ComponentName',
    operation: 'operationName',
    // Additional context
  });
}
```

### 4. Performance Tracking
Add performance monitoring for key operations:

```typescript
const startTime = performance.now();
// Operation
const endTime = performance.now();
trackPerformanceMetric('operation_name', endTime - startTime);
```

### 5. Implement Event Batching
Consider implementing event batching to reduce Firebase calls:

```typescript
// Collect events in memory
// Periodically flush events to Firebase/Firestore
```

### 6. Create Firestore Collections
Ensure the following collections exist in Firestore:
- `analytics_events`: For all logged events
- `feature_flags`: For feature flag management
- `ab_tests`: For A/B test configurations

### 7. Dashboard Integration Tests
Verify dashboard queries work with real data:
1. Generate sample events
2. Check dashboard renders real data
3. Verify real-time updates

### 8. Add User Properties
Track user-specific properties to segment analytics:

```typescript
// Track user properties when they change preferences
logAnalyticsEvent('user_properties_update', {
  dietary_preferences: preferences.restrictions,
  allergies: preferences.allergies,
  diet_plans: preferences.preferences
});
```

## Feature Flag and A/B Testing Implementation
We have started implementing a Feature Flag and A/B Testing service that will allow for gradual rollout of new features and experimental testing. Key components include:

1. **Feature Flag Service**: Implemented in `services/featureFlagService.ts`
   - Supports different flag states: ENABLED, DISABLED, PERCENTAGE_ROLLOUT
   - Includes caching mechanism to reduce Firestore reads
   - Provides platform-specific feature toggling

2. **A/B Testing Framework**:
   - Deterministic variant assignment using user ID hashing
   - Support for control and variant groups
   - Conversion tracking for test metrics
   - Results viewable in dashboard

3. **Firebase Structure**:
   - `feature_flags` collection with documents for each feature flag
   - `ab_tests` collection with documents for each test configuration

4. **Next Steps**:
   - Complete dashboard interface for managing feature flags
   - Implement UI components to leverage feature flags
   - Add more comprehensive metrics tracking for A/B test conversions
   - Create documentation for adding new tests

## Testing Analytics

### Manual Testing Process
1. Clear analytics data
2. Perform a specific user flow (e.g., search recipes -> view recipe -> save recipe)
3. Check Firebase Analytics logs
4. Check Firestore collections for the events
5. Verify dashboard shows the correct data

### Test Cases
- Recipe generation
- Recipe viewing
- Recipe saving/unsaving
- Dietary preference changes
- Search functionality
- Filter application
- Navigation between screens
- App background/foreground handling

## Dashboard Verification
1. Run the dashboard: `cd mealfix-dashboard && npm run dev`
2. Access dashboard at http://localhost:3000
3. Check browser console for Firebase connection logs
4. Verify data is pulled from Firestore rather than using dummy data

## Next Steps After Implementation
1. Analyze initial user data
2. Set up A/B tests for UI improvements
3. Configure feature flags for gradual rollout
4. Create automated analytics reports

## Resources and Documentation
- Firebase Analytics: https://firebase.google.com/docs/analytics
- Firebase Firestore: https://firebase.google.com/docs/firestore
- Expo Application Services: https://docs.expo.dev/eas/
- React Native Performance: https://docs.expo.dev/versions/latest/sdk/performance/ 