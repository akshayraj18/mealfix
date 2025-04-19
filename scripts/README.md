# MealFix Setup Scripts

This directory contains scripts for setting up and managing analytics data, feature flags, and A/B tests for the MealFix app and dashboard.

## Prerequisites

Before running these scripts, you need to:

1. Create a Firebase project and enable Firestore
2. Generate a service account key for your Firebase project
3. Place the service account key file at `config/serviceAccountKey.json`

## Available Scripts

### Setup Feature Flags and A/B Tests

Initializes the feature flags and A/B tests in Firestore:

```bash
node scripts/setup-feature-flags.js
```

This will create:
- Three sample feature flags in the `feature_flags` collection
- Two sample A/B tests in the `ab_tests` collection

### Setup Analytics Events

Populates the Firestore database with sample analytics events for testing the dashboard:

```bash
node scripts/setup-analytics-events.js
```

To add more events to an existing collection:

```bash
node scripts/setup-analytics-events.js --force
```

This will create approximately:
- 100 recipe view events
- 50 recipe save events
- 30 dietary preference events
- 80 ingredient search events
- 40 user events (login/signup)
- 20 performance metrics

## Connecting to the Dashboard

1. Run the dashboard app:
   ```bash
   cd mealfix-dashboard
   npm run dev
   ```
   
2. Navigate to the dashboard at http://localhost:3000

3. The dashboard will automatically query the Firestore collections set up by these scripts

## Implementing Real Analytics Tracking

To implement real analytics tracking in your app, use the `analyticsService.ts` located in the `services` directory. This service provides functions for tracking:

- Recipe views
- Recipe saves
- Dietary preference toggles
- Ingredient searches
- User logins and signups
- Performance metrics

The analytics service logs events both to Firebase Analytics and to Firestore (for dashboard visualization). 