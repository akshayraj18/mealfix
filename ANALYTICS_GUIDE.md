# MealFix Analytics Guide

This document provides a detailed overview of the analytics system implemented in MealFix. The system is designed to track user interactions, store data in Firebase Firestore, and visualize key metrics in the dashboard.

## Analytics Architecture

The MealFix analytics system consists of three main components:

1. **Data Collection**: Event tracking in the mobile app
2. **Data Storage**: Firebase Firestore database
3. **Data Visualization**: Web-based dashboard

### Data Collection

The mobile app tracks user interactions using the `analyticsService.ts` module. This service provides methods to log various events:

- **Recipe views**: When a user views a recipe
- **Recipe saves**: When a user saves a recipe
- **Ingredient searches**: When a user searches for ingredients
- **Dietary preferences**: When a user toggles dietary preferences
- **Performance metrics**: App loading time, API response time, etc.
- **User sessions**: User login, signup, and session duration

Each event is logged with relevant metadata such as:
- Timestamp
- User ID (if authenticated)
- Device information
- Event-specific parameters

### Data Storage

All analytics events are stored in Firebase Firestore in the following collections:

- **analytics_events**: Main collection for all event data
- **saved_recipes**: Collection for saved recipes (referenced for analytics)
- **users**: User data collection (referenced for user metrics)

#### Collection Schema: analytics_events

```
{
  "eventName": string,      // Name of the event (e.g., "recipe_view", "recipe_save")
  "userId": string | null,  // Firebase Auth user ID or null for anonymous users
  "timestamp": Timestamp,   // Firebase server timestamp
  "platform": string,       // Device platform (iOS, Android, web)
  "appVersion": string,     // Version of the app
  
  // Event-specific properties (examples):
  "recipe_name": string,    // For recipe-related events
  "difficulty": string,     // For recipe-related events
  "search_query": string,   // For search events
  "preference": string,     // For dietary preference events
  "is_enabled": boolean,    // For toggle events
  "time_spent_ms": number,  // For time tracking events
  "metric_name": string,    // For performance metrics
  "value_ms": number        // For performance metrics
}
```

### Data Visualization

The MealFix Dashboard visualizes the analytics data in various charts and metrics:

- **User engagement**: Total users, active users, new users, session time
- **Recipe popularity**: Most viewed and saved recipes
- **Dietary trends**: Popular dietary preferences
- **Ingredient combinations**: Common ingredient search combinations
- **Performance metrics**: API latency, app load time, error rates

## Tracked Events

The following events are tracked in the MealFix app:

### Recipe Events

- **view_recipe**: Triggered when a user views a recipe
  - Properties: recipe_name, difficulty, time_estimate, dietary_restrictions

- **save_recipe**: Triggered when a user saves a recipe
  - Properties: recipe_name, difficulty, time_estimate, dietary_restrictions

- **generate_recipe**: Triggered when a user generates recipe suggestions
  - Properties: ingredientCount, dietaryRestrictions, allergies, dietPlan

### User Interaction Events

- **dietary_toggle**: Triggered when a user toggles a dietary preference
  - Properties: preference, is_enabled

- **screen_view**: Triggered when a user views a screen
  - Properties: screen_name, time_spent_ms

- **search_ingredients**: Triggered when a user searches for ingredients
  - Properties: search_query, result_count

### User Account Events

- **user_login**: Triggered when a user logs in
  - Properties: method

- **user_signup**: Triggered when a user signs up
  - Properties: method

### Performance Events

- **performance_metric**: Triggered to log performance data
  - Properties: metric_name, value_ms

- **llm_response**: Triggered when receiving a response from the language model
  - Properties: success, responseLength, model

- **recipe_error**: Triggered when an error occurs in recipe generation
  - Properties: error, stage

## Analytics Service API

The `analyticsService.ts` module provides the following methods for tracking events:

```typescript
// Track recipe view
trackRecipeView(recipe: Recipe): void

// Track recipe save
trackRecipeSave(recipe: Recipe): void

// Track dietary preference toggle
trackDietaryPreferenceToggle(preference: string, isEnabled: boolean): void

// Track screen view time
trackScreenView(screenName: string, timeSpentMs: number): void

// Track ingredient search
trackIngredientSearch(searchQuery: string, resultCount: number): void

// Track user login
trackUserLogin(method: string): void

// Track user signup
trackUserSignup(method: string): void

// Track performance metric
trackPerformanceMetric(metricName: string, valueMs: number): void
```

## Dashboard Queries

The analytics dashboard utilizes several query functions to retrieve and aggregate data:

```typescript
// Get popular recipes for dashboard
getPopularRecipes(limitCount?: number): Promise<RecipeViewsData[]>

// Get dietary trends for dashboard
getDietaryTrends(): Promise<DietaryTrendsData[]>

// Get ingredient combinations for dashboard
getIngredientCombinations(): Promise<IngredientCombinationData[]>

// Get user engagement metrics for dashboard
getUserEngagementMetrics(): Promise<UserEngagementData>

// Get performance metrics for dashboard
getPerformanceMetrics(): Promise<PerformanceMetricsData>

// Get A/B test results for dashboard
getABTestResults(): Promise<ABTestResultData[]>
```

## Implementation Guide

To add tracking to a new feature in the MealFix app:

1. Define event constants in `config/firebase.ts`:
   ```typescript
   export const RecipeEvents = {
     // Add your new event
     NEW_FEATURE_EVENT: 'new_feature_event'
   };
   ```

2. Add tracking method in `services/analyticsService.ts`:
   ```typescript
   export function trackNewFeatureEvent(featureName: string, extraData: any): void {
     trackEvent(RecipeEvents.NEW_FEATURE_EVENT, {
       feature_name: featureName,
       ...extraData
     });
   }
   ```

3. Call the tracking method in your component:
   ```typescript
   import { trackNewFeatureEvent } from '@/services/analyticsService';
   
   // Inside your component
   trackNewFeatureEvent('feature_name', { extra: 'data' });
   ```

4. Add dashboard visualization in `mealfix-dashboard/src/app/page.tsx` to display your new metrics.

## Firestore Indexes

For optimal query performance, create the following indexes in Firebase:

1. analytics_events
   - Fields: eventName (Ascending), timestamp (Descending)

2. analytics_events
   - Fields: userId (Ascending), eventName (Ascending), timestamp (Descending)

3. saved_recipes
   - Fields: userId (Ascending), savedAt (Descending)

## Privacy Considerations

The analytics system is designed with privacy in mind:
- User identifiers are only collected for authenticated users
- No personally identifiable information is stored with analytics events
- Data retention policies should be implemented based on organizational requirements
- Users should be informed about data collection in the app's privacy policy

## Troubleshooting

If analytics data isn't appearing in the dashboard:

1. Check Firebase console for any errors or quota limitations
2. Verify that events are being logged in the app (check console logs)
3. Examine Firebase rules to ensure the dashboard has proper read permissions
4. Check that composite indexes are correctly set up in Firebase
5. Verify the dashboard is connecting to the correct Firebase project 