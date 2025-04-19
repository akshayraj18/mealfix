# Firebase Setup Guide for MealFix Analytics & Feature Flags

This guide will walk you through setting up all necessary Firebase configurations for analytics tracking, feature flags, and A/B testing in your MealFix application.

## 1. Firebase Console Setup

### Initial Project Setup
1. Go to the [Firebase Console](https://console.firebase.google.com)
2. Select your project "mealfix-66eaf"
3. Make sure you have Blaze plan (pay-as-you-go) enabled for full Firestore access

### Firestore Database Configuration
1. In the Firebase Console, go to **Firestore Database** in the left navigation
2. If not already enabled, click **Create Database**
   - Choose production mode or test mode (you can change security rules later)
   - Select a location closest to your users (e.g., `us-central1`)

### Security Rules Configuration
1. Go to **Firestore Database** > **Rules** tab
2. Set up the following security rules to secure your collections:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Base rule - deny access by default
    match /{document=**} {
      allow read, write: if false;
    }
    
    // Allow authenticated users to read and write their own saved recipes
    match /savedRecipes/{recipeId} {
      allow read, write: if request.auth != null && request.auth.uid == resource.data.userId;
      allow create: if request.auth != null && request.auth.uid == request.resource.data.userId;
    }
    
    // Analytics events - only allow authenticated users to create, admin to read all
    match /analytics_events/{eventId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && isAdmin();
    }
    
    // Feature flags - allow all authenticated users to read, only admin to write
    match /feature_flags/{flagId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
    
    // A/B tests - allow all authenticated users to read, only admin to write
    match /ab_tests/{testId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && isAdmin();
    }
    
    // Helper function to check if user is an admin
    function isAdmin() {
      return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

### Create Necessary Collections

1. **Analytics Events Collection**:
   - Go to **Firestore Database** > **Data** tab
   - Click **Start Collection**
   - Collection ID: `analytics_events`
   - This collection will be populated by your code, no need to add documents manually

2. **Feature Flags Collection**:
   - Create a collection named `feature_flags`
   - Add your first feature flag:
     - Document ID: (auto-generated)
     - Fields:
       - `name`: "new_recipe_screen" (string)
       - `description`: "Enables the new recipe detail screen design" (string)
       - `status`: "enabled" (string) - options: "enabled", "disabled", "percentage_rollout"
       - `rolloutPercentage`: 50 (number) - only used if status is "percentage_rollout"
       - `platforms`: ["ios", "android", "web"] (array of strings)
       - `createdAt`: (timestamp - use the server timestamp)
       - `updatedAt`: (timestamp - use the server timestamp)

3. **A/B Tests Collection**:
   - Create a collection named `ab_tests`
   - Add your first A/B test:
     - Document ID: (auto-generated)
     - Fields:
       - `name`: "recipe_detail_layout" (string)
       - `description`: "Testing different layouts for recipe details" (string)
       - `status`: "active" (string) - options: "active", "paused", "completed"
       - `startDate`: (timestamp - current date)
       - `endDate`: (timestamp - future date, optional)
       - `controlGroup`: (map)
         - `name`: "control" (string)
         - `description`: "Standard layout" (string)
       - `variantGroup`: (map)
         - `name`: "variant" (string)
         - `description`: "Improved layout with better ingredient grouping" (string)
       - `metrics`: ["screen_time", "recipe_saves"] (array of strings)
       - `createdAt`: (timestamp - use the server timestamp)
       - `updatedAt`: (timestamp - use the server timestamp)

## 2. Firebase Analytics Setup

### Enable Google Analytics
1. Go to **Project Settings** > **Integrations** tab
2. Find Google Analytics and click **Connect**
3. Select an existing analytics account or create a new one
4. Confirm analytics property linking

### Configure Analytics Events
1. Go to **Analytics** in the left navigation
2. Go to **Events** to see tracked events
3. Custom events will appear after your app starts sending them
4. You can create **Conversion Events** for important user actions
   - Go to **Conversions** in the Analytics section
   - Click **Create Event**
   - Select events like "recipe_save" to mark as conversions

## 3. Create Firestore Indexes for Queries

For optimal performance, create the following Firestore indexes:

1. Go to **Firestore Database** > **Indexes** tab
2. Click **Add Index**

**Index for Saved Recipes Queries**:
- Collection: `savedRecipes`
- Fields to index:
  - `userId` (Ascending)
  - `savedAt` (Descending)
- Query scope: Collection

**Index for Analytics View Events**:
- Collection: `analytics_events`
- Fields to index:
  - `eventName` (Ascending)
  - `timestamp` (Descending)
- Query scope: Collection

**Index for A/B Test Query**:
- Collection: `ab_tests`
- Fields to index:
  - `name` (Ascending)
  - `status` (Ascending)
- Query scope: Collection

## 4. Firebase Authentication Setup

Ensure Firebase Authentication is configured correctly:

1. Go to **Authentication** in the left navigation
2. Go to **Sign-in method** tab
3. Enable the authentication methods you use (Email/Password, Google, etc.)
4. Make sure your app's domain is added to the authorized domains list

## 5. Testing Your Setup

After completing the setup, you should test:

1. **Feature Flag Testing**:
   - Run your app and check the logs for feature flag checks
   - Try changing a feature flag in Firebase console and see if your app responds after clearing the cache

2. **A/B Test Assignment**:
   - Login with different accounts to see if users get assigned to different test variants
   - Check logs to ensure variant assignment is working

3. **Analytics Events**:
   - Perform actions in your app that trigger analytics events
   - Check Firebase Analytics dashboard (it may take up to 24 hours for events to appear)
   - Check the Firestore `analytics_events` collection for immediate verification

## 6. Monitoring & Maintenance

### Regular Tasks

1. **Monitor Analytics Usage**:
   - Firebase free tier includes 10GB/month and 1M/month write operations
   - Go to **Usage and Billing** to track your consumption

2. **Update Feature Flags**:
   - Gradually roll out new features using percentage rollouts
   - Move from "percentage_rollout" to "enabled" after successful testing

3. **Evaluate A/B Tests**:
   - Review metrics for active A/B tests
   - Mark tests as "completed" once you've gathered enough data
   - Implement the winning variant permanently

## Troubleshooting

### Common Issues

1. **Events Not Appearing in Analytics**:
   - Analytics events can take up to 24 hours to appear in the dashboard
   - Verify events are being logged by checking the `analytics_events` collection in Firestore

2. **Feature Flags Not Working**:
   - Check if the flag document exists in Firestore with correct fields
   - Verify the platform array includes your current platform
   - Clear cached feature flags in your app

3. **Security Rules Blocking Operations**:
   - Check Firebase console logs for security rules violations
   - Temporarily relax rules for testing, then reimplement proper security

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Data Modeling Guide](https://firebase.google.com/docs/firestore/manage-data/structure-data)
- [Firebase Analytics Guide](https://firebase.google.com/docs/analytics) 