// Setup script for initializing feature flags and A/B tests in Firestore
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Config
const FEATURE_FLAGS_COLLECTION = 'feature_flags';
const AB_TESTS_COLLECTION = 'ab_tests';
const SERVICE_ACCOUNT_PATH = path.join(__dirname, '../config/serviceAccountKey.json');
const BATCH_SIZE = 500;

// Check if service account exists
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error('Error: Service account key file not found at:', SERVICE_ACCOUNT_PATH);
  console.error('Please place your Firebase service account key file at the path above.');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(SERVICE_ACCOUNT_PATH);
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

// Sample feature flags
const featureFlags = [
  {
    id: 'recipe_recommendations',
    name: 'Recipe Recommendations',
    description: 'Show personalized recipe recommendations on the home screen',
    status: 'ENABLED',
    rolloutPercentage: 100,
    platforms: ['ios', 'android', 'web'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'dark_mode',
    name: 'Dark Mode',
    description: 'Enable dark mode theme option',
    status: 'ENABLED',
    rolloutPercentage: 100,
    platforms: ['ios', 'android', 'web'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'social_sharing',
    name: 'Social Sharing',
    description: 'Allow users to share recipes on social media',
    status: 'PERCENTAGE_ROLLOUT',
    rolloutPercentage: 50,
    platforms: ['ios', 'android'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'advanced_filters',
    name: 'Advanced Filters',
    description: 'Enable advanced filtering options for recipe search',
    status: 'DISABLED',
    rolloutPercentage: 0,
    platforms: ['ios', 'android', 'web'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'video_tutorials',
    name: 'Video Tutorials',
    description: 'Show video tutorials for recipes',
    status: 'PERCENTAGE_ROLLOUT',
    rolloutPercentage: 25,
    platforms: ['ios', 'android'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Sample A/B tests
const abTests = [
  {
    id: 'home_layout_test',
    name: 'Home Layout Test',
    description: 'Testing different layouts for the home screen',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
    controlGroup: {
      id: 'control',
      name: 'Standard Grid Layout',
      description: 'The current grid layout with 2 columns'
    },
    variantGroup: {
      id: 'variant_a',
      name: 'Card Layout',
      description: 'A new card-based layout with larger images'
    },
    metrics: ['screen_time', 'recipe_views', 'user_engagement'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'onboarding_flow_test',
    name: 'Onboarding Flow Test',
    description: 'Testing a simplified onboarding flow against the current flow',
    status: 'ACTIVE',
    startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), // 14 days ago
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    controlGroup: {
      id: 'control',
      name: 'Standard Onboarding',
      description: 'The current 5-step onboarding flow'
    },
    variantGroup: {
      id: 'variant_a',
      name: 'Simplified Onboarding',
      description: 'A new 3-step simplified onboarding flow'
    },
    metrics: ['completion_rate', 'time_to_complete', 'user_retention'],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'recipe_detail_test',
    name: 'Recipe Detail Layout Test',
    description: 'Testing two different layouts for the recipe detail screen',
    status: 'PAUSED',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    controlGroup: {
      id: 'control',
      name: 'Current Layout',
      description: 'The current recipe detail layout with image at the top'
    },
    variantGroup: {
      id: 'variant_a',
      name: 'Step-by-Step Layout',
      description: 'A new layout that presents the recipe in a step-by-step guided format'
    },
    metrics: ['time_spent', 'completion_rate', 'save_rate'],
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

// Setup feature flags
async function setupFeatureFlags(forceReplace = false) {
  const featureFlagsRef = db.collection(FEATURE_FLAGS_COLLECTION);
  const featureFlagsSnapshot = await featureFlagsRef.limit(1).get();
  
  if (!featureFlagsSnapshot.empty && !forceReplace) {
    console.log(`Collection '${FEATURE_FLAGS_COLLECTION}' already exists. Use --force to replace it.`);
    return;
  }
  
  if (!featureFlagsSnapshot.empty && forceReplace) {
    console.log(`Replacing existing '${FEATURE_FLAGS_COLLECTION}' collection...`);
    // Delete all documents in the collection
    const batch = db.batch();
    const allFeatureFlags = await featureFlagsRef.get();
    allFeatureFlags.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
  
  console.log(`Setting up ${featureFlags.length} feature flags...`);
  const batch = db.batch();
  
  featureFlags.forEach(flag => {
    const docRef = featureFlagsRef.doc(flag.id);
    batch.set(docRef, flag);
  });
  
  await batch.commit();
  console.log(`✅ Successfully set up ${featureFlags.length} feature flags!`);
}

// Setup A/B tests
async function setupABTests(forceReplace = false) {
  const abTestsRef = db.collection(AB_TESTS_COLLECTION);
  const abTestsSnapshot = await abTestsRef.limit(1).get();
  
  if (!abTestsSnapshot.empty && !forceReplace) {
    console.log(`Collection '${AB_TESTS_COLLECTION}' already exists. Use --force to replace it.`);
    return;
  }
  
  if (!abTestsSnapshot.empty && forceReplace) {
    console.log(`Replacing existing '${AB_TESTS_COLLECTION}' collection...`);
    // Delete all documents in the collection
    const batch = db.batch();
    const allABTests = await abTestsRef.get();
    allABTests.forEach(doc => {
      batch.delete(doc.ref);
    });
    await batch.commit();
  }
  
  console.log(`Setting up ${abTests.length} A/B tests...`);
  const batch = db.batch();
  
  abTests.forEach(test => {
    const docRef = abTestsRef.doc(test.id);
    batch.set(docRef, test);
  });
  
  await batch.commit();
  console.log(`✅ Successfully set up ${abTests.length} A/B tests!`);
}

// Main function
async function setupAll() {
  const args = process.argv.slice(2);
  const forceReplace = args.includes('--force');
  
  console.log('📊 MealFix Feature Flags & A/B Tests Setup');
  console.log('==========================================');
  
  try {
    await setupFeatureFlags(forceReplace);
    await setupABTests(forceReplace);
    console.log('\n✅ Setup complete! Your feature flags and A/B tests are ready.');
  } catch (error) {
    console.error('❌ Error setting up data:', error);
    process.exit(1);
  }
}

// Run the main function
setupAll(); 