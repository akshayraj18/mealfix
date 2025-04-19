#!/bin/bash

# Creates Firestore indexes for analytics data
# This script requires Firebase CLI to be installed
# Run: npm install -g firebase-tools
# Then login: firebase login

echo "Creating Firestore indexes for analytics events..."

# Make sure Firebase CLI is installed
# npm install -g firebase-tools

# Login to Firebase (if not already logged in)
# firebase login

# Create indexes for camelCase field names
echo "Creating index for 'eventName' and 'timestamp' (camelCase)..."
firebase firestore:indexes \
  --project mealfix-66eaf \
  'indexes: [{
    "collectionGroup": "analytics_events",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "eventName", "order": "ASCENDING" },
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  }]'

echo "Creating index for 'userId' (camelCase)..."
firebase firestore:indexes \
  --project mealfix-66eaf \
  'indexes: [{
    "collectionGroup": "analytics_events",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "userId", "order": "ASCENDING" }
    ]
  }]'

echo "Creating index for 'timestamp' field alone (for general queries)..."
firebase firestore:indexes \
  --project mealfix-66eaf \
  'indexes: [{
    "collectionGroup": "analytics_events",
    "queryScope": "COLLECTION",
    "fields": [
      { "fieldPath": "timestamp", "order": "DESCENDING" }
    ]
  }]'

echo "All index creation commands submitted. Check the Firebase Console to verify indexes are building."
echo "Note: Index creation can take several minutes to complete."
echo "Visit: https://console.firebase.google.com/project/mealfix-66eaf/firestore/indexes" 