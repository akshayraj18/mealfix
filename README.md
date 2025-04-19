# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Replace `your_openai_api_key_here` with your actual OpenAI API key
   - You can get an API key from [OpenAI's website](https://platform.openai.com/api-keys)

3. Start the app

   ```bash
    npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Environment Variables

The following environment variables are required:

- `EXPO_PUBLIC_OPENAI_API_KEY`: Your OpenAI API key for recipe generation

## Features

- User authentication
- Ingredient-based recipe suggestions
- AI-powered recipe generation
- Modern, user-friendly interface

# MealFix

MealFix is a mobile application for recipe generation based on ingredients you have, with dietary preferences and restrictions support. The app includes an analytics dashboard to track user engagement and recipe popularity.

## Features

- **Recipe Generation**: Get recipe suggestions based on ingredients you have
- **Dietary Preferences**: Filter recipes based on dietary restrictions and preferences
- **Save Recipes**: Save your favorite recipes for later
- **Analytics Dashboard**: Track app usage, popular recipes, and user engagement

## Project Structure

- `/app`: The main mobile application (React Native / Expo)
- `/components`: Reusable UI components 
- `/services`: Service modules for data handling and API interactions
- `/config`: Configuration files including Firebase setup
- `/types`: TypeScript type definitions
- `/mealfix-dashboard`: Web-based admin dashboard for analytics
- `/docs`: Documentation including setup guides
- `/scripts`: Utility scripts for development and data management

## Analytics System

The app includes a comprehensive analytics system that tracks various user interactions:

- Recipe views and saves
- Ingredient searches
- Dietary preference selections
- User engagement metrics
- Performance data

This data is stored in Firebase Firestore and visualized in the MealFix Dashboard.

## Getting Started

1. Install dependencies:
   ```
   npm install
   ```

2. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Add your Firebase configuration values

3. Run the mobile app:
   ```
   npm start
   ```

4. Run the dashboard:
   ```
   cd mealfix-dashboard
   npm run dev
   ```

## Dashboard Access

The dashboard is available at http://localhost:3000 after starting with `npm run dev`.

## Setting Up Real Analytics Data

By default, the dashboard displays dummy data. To set up real analytics data:

1. Read the comprehensive guide: [Real Analytics Setup Guide](./docs/real-analytics-setup-guide.md)

2. Initialize Firestore collections with sample data (optional):
   ```bash
   node scripts/init-firestore-collections.js
   ```

3. Implement the analytics tracking in your app using the `services/analyticsService.ts` file as described in the guide

## Documentation

- [Real Analytics Setup Guide](./docs/real-analytics-setup-guide.md): Detailed instructions for setting up real analytics data
- [Dashboard Guide](./docs/dashboard-guide.md): Information about using the MealFix dashboard

# MealFix Analytics Dashboard Setup

This repository contains the MealFix recipe app and its analytics dashboard. The dashboard displays real-time analytics, user behavior insights, and helps manage feature flags and A/B tests.

## Dashboard Overview

The MealFix dashboard provides:

- **Popular Recipe Insights**: Track which recipes users view and save most frequently
- **Dietary Trends**: Monitor the popularity of different dietary preferences
- **User Engagement Metrics**: Analyze active users, session duration, and retention rates
- **Performance Monitoring**: Check app performance across different devices and versions
- **Feature Flag Management**: Control the rollout of new features
- **A/B Test Management**: Set up and analyze the results of A/B tests

## Setting Up the Dashboard

### Prerequisites

- Node.js (v14+)
- Firebase project with Firestore enabled
- Firebase service account key

### Installation

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a Firebase service account key:
   - Go to your Firebase project console
   - Navigate to Project Settings > Service Accounts
   - Click "Generate new private key"
   - Save the JSON file as `config/serviceAccountKey.json`

### Running the Dashboard

Start the dashboard development server:

```
cd mealfix-dashboard
npm run dev
```

The dashboard will be available at http://localhost:3000

## Populating Data for the Dashboard

Before you can see meaningful data in the dashboard, you need to populate the necessary collections in Firestore. This repository includes scripts to set up:

1. **Analytics Events**: User interactions with recipes, dietary preferences, etc.
2. **Feature Flags**: Configuration for enabling/disabling features
3. **A/B Tests**: Test definitions for comparing different app variations

### Setting Up Analytics Events

Run the analytics events setup script:

```
node scripts/setup-analytics-events.js
```

Options:
- `--force`: Replace existing analytics events data
- `--count=1000`: Specify the number of events to generate (default: 1000)

Example:
```
node scripts/setup-analytics-events.js --force --count=2000
```

### Setting Up Feature Flags and A/B Tests

Run the feature flags setup script:

```
node scripts/setup-feature-flags.js
```

Options:
- `--force`: Replace existing feature flags and A/B tests

Example:
```
node scripts/setup-feature-flags.js --force
```

## Implementing Real Analytics Tracking in Your App

The mobile app uses the `analyticsService.ts` module to track user events. This service:

1. Logs events to Firebase Analytics for aggregate reporting
2. Stores detailed event data in Firestore for custom dashboard analytics

Key functions to use in your app:

- `trackRecipeView(recipe)`: Call when a user views a recipe
- `trackRecipeSave(recipe)`: Call when a user saves a recipe
- `trackDietaryPreferenceToggle(preference, enabled)`: Call when a user toggles dietary preferences
- `trackIngredientSearch(ingredients, searchTime)`: Track ingredient searches
- `trackScreenTime(screenName, timeSpent)`: Log time spent on different screens
- `trackUserLogin(method, success)`: Track user logins
- `trackUserSignup(method, dietaryPreferences)`: Track user signups
- `trackError(errorType, errorMessage)`: Log application errors
- `trackPerformanceMetric(metricName, value)`: Track performance metrics

## Using Feature Flags in Your App

Feature flags allow you to control feature availability and conduct A/B tests. Use the `featureFlagService.ts` module:

- `isFeatureEnabled(flagName)`: Check if a feature is enabled
- `getABTestVariant(testName)`: Get the A/B test variant for the current user
- `trackABTestConversion(testName, metricName, value)`: Track a conversion event for an A/B test

## Support

For questions about the dashboard or script setup, contact the development team.

Happy cooking with MealFix! 🍳
