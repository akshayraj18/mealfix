/**
 * This script initializes Firestore collections needed for the MealFix dashboard
 * It creates sample data for:
 * - feature_flags
 * - ab_tests
 * - analytics_events (sample events)
 * 
 * Run with: node scripts/init-firestore-collections.js
 */

const { initializeApp } = require('firebase/app');
const { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs,
  query,
  serverTimestamp
} = require('firebase/firestore');

// Firebase configuration - matches the one in your config
const firebaseConfig = {
  apiKey: "AIzaSyAFugF2_o5rHBcq7JE0KcvSnR8HLJ6LmCc",
  authDomain: "mealfix-66eaf.firebaseapp.com",
  projectId: "mealfix-66eaf",
  storageBucket: "mealfix-66eaf.firebasestorage.app",
  messagingSenderId: "367908404312",
  appId: "1:367908404312:web:0779f843abf99ec2789e2d",
  measurementId: "G-LQ0D297W57"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection names
const ANALYTICS_COLLECTION = 'analytics_events';
const FEATURE_FLAGS_COLLECTION = 'feature_flags';
const AB_TESTS_COLLECTION = 'ab_tests';

// Feature flag status enum
const FeatureFlagStatus = {
  ENABLED: 'enabled',
  DISABLED: 'disabled',
  PERCENTAGE_ROLLOUT: 'percentage_rollout'
};

// A/B test status enum
const ABTestStatus = {
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed'
};

// Sample feature flags
const featureFlags = [
  {
    name: 'enable_new_recipe_ui',
    description: 'Enables the new recipe card UI with improved layouts',
    status: FeatureFlagStatus.PERCENTAGE_ROLLOUT,
    rolloutPercentage: 50,
    platforms: ['android', 'ios', 'web'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'dietary_preferences_quick_access',
    description: 'Shows dietary preferences button in main navigation',
    status: FeatureFlagStatus.ENABLED,
    platforms: ['android', 'ios'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  },
  {
    name: 'advanced_nutritional_info',
    description: 'Shows expanded nutritional information in recipe details',
    status: FeatureFlagStatus.DISABLED,
    platforms: ['android', 'ios', 'web'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample A/B tests
const abTests = [
  {
    name: 'Recipe Card Layout Test',
    description: 'Testing different layouts for recipe cards to increase engagement',
    status: ABTestStatus.ACTIVE,
    startDate: new Date(),
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
  },
  {
    name: 'Ingredient Search UI',
    description: 'Testing grid vs. list view for ingredient selection',
    status: ABTestStatus.ACTIVE,
    startDate: new Date(),
    controlGroup: {
      name: 'List View',
      description: 'Vertical scrollable list of ingredients',
      percentage: 50
    },
    variantGroup: {
      name: 'Grid View',
      description: 'Grid layout with ingredient cards',
      percentage: 50
    },
    metrics: ['search_time', 'ingredient_count', 'recipe_generation_rate'],
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }
];

// Sample analytics events
const generateSampleEvents = () => {
  const events = [];
  const eventTypes = [
    'recipe_view',
    'recipe_save',
    'recipe_generate',
    'ingredient_search',
    'dietary_preference_change',
    'user_login',
    'user_signup'
  ];
  
  const recipes = [
    'Vegetarian Pasta',
    'Keto Chicken Bowl',
    'Gluten-Free Pancakes',
    'Vegan Buddha Bowl',
    'Low-Carb Pizza'
  ];
  
  const dietaryPreferences = [
    'Vegetarian',
    'Vegan',
    'Gluten-Free',
    'Dairy-Free',
    'Keto',
    'Low-Carb',
    'Paleo'
  ];
  
  const ingredients = [
    'Chicken',
    'Beef',
    'Rice',
    'Pasta',
    'Tomatoes',
    'Onions',
    'Garlic',
    'Spinach',
    'Avocado',
    'Eggs',
    'Cheese',
    'Milk',
    'Olive Oil'
  ];
  
  // Generate random past dates (within last 30 days)
  const getRandomDate = () => {
    const now = new Date();
    const pastDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    return pastDate;
  };
  
  // Create random user IDs
  const userIds = [];
  for (let i = 0; i < 20; i++) {
    userIds.push(`user_${Math.random().toString(36).substring(2, 10)}`);
  }
  
  // Generate 500 random events
  for (let i = 0; i < 500; i++) {
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const timestamp = getRandomDate();
    const sessionId = `session_${Math.random().toString(36).substring(2, 10)}`;
    const platform = Math.random() > 0.5 ? 'ios' : 'android';
    const appVersion = '1.0.0';
    
    let parameters = {};
    
    // Add event-specific parameters
    switch (eventType) {
      case 'recipe_view':
      case 'recipe_save':
        const recipe = recipes[Math.floor(Math.random() * recipes.length)];
        parameters = {
          recipe_name: recipe,
          difficulty: ['Easy', 'Medium', 'Hard'][Math.floor(Math.random() * 3)],
          prep_time: `${Math.floor(Math.random() * 60) + 10} min`,
          dietary_restrictions: dietaryPreferences.filter(() => Math.random() > 0.7)
        };
        break;
        
      case 'ingredient_search':
        const searchIngredients = [];
        const count = Math.floor(Math.random() * 5) + 1;
        for (let j = 0; j < count; j++) {
          searchIngredients.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
        }
        parameters = {
          ingredients: searchIngredients,
          count: searchIngredients.length
        };
        break;
        
      case 'dietary_preference_change':
        parameters = {
          preference: dietaryPreferences[Math.floor(Math.random() * dietaryPreferences.length)],
          is_enabled: Math.random() > 0.5
        };
        break;
        
      case 'user_login':
      case 'user_signup':
        parameters = {
          login_method: ['email', 'google', 'apple'][Math.floor(Math.random() * 3)]
        };
        break;
        
      case 'recipe_generate':
        const genIngredients = [];
        const genCount = Math.floor(Math.random() * 5) + 2;
        for (let j = 0; j < genCount; j++) {
          genIngredients.push(ingredients[Math.floor(Math.random() * ingredients.length)]);
        }
        parameters = {
          ingredient_count: genCount,
          dietary_restrictions: dietaryPreferences.filter(() => Math.random() > 0.7),
          success: Math.random() > 0.1
        };
        break;
    }
    
    events.push({
      event_name: eventType,
      user_id: userId,
      timestamp: timestamp,
      session_id: sessionId,
      platform: platform,
      app_version: appVersion,
      parameters: parameters
    });
  }
  
  return events;
};

// Initialize collections
async function initializeCollections() {
  console.log('Starting Firestore collection initialization...');
  
  try {
    // Check if collections already have data
    const featureFlagsQuery = query(collection(db, FEATURE_FLAGS_COLLECTION));
    const featureFlagsSnapshot = await getDocs(featureFlagsQuery);
    
    const abTestsQuery = query(collection(db, AB_TESTS_COLLECTION));
    const abTestsSnapshot = await getDocs(abTestsQuery);
    
    const analyticsQuery = query(collection(db, ANALYTICS_COLLECTION));
    const analyticsSnapshot = await getDocs(analyticsQuery);
    
    // Feature flags
    if (featureFlagsSnapshot.empty) {
      console.log('Creating feature flags...');
      for (const flag of featureFlags) {
        await addDoc(collection(db, FEATURE_FLAGS_COLLECTION), flag);
      }
      console.log(`Created ${featureFlags.length} feature flags`);
    } else {
      console.log(`Feature flags collection already has ${featureFlagsSnapshot.size} documents. Skipping.`);
    }
    
    // A/B tests
    if (abTestsSnapshot.empty) {
      console.log('Creating A/B tests...');
      for (const test of abTests) {
        await addDoc(collection(db, AB_TESTS_COLLECTION), test);
      }
      console.log(`Created ${abTests.length} A/B tests`);
    } else {
      console.log(`A/B tests collection already has ${abTestsSnapshot.size} documents. Skipping.`);
    }
    
    // Analytics events
    if (analyticsSnapshot.empty) {
      console.log('Creating sample analytics events...');
      const events = generateSampleEvents();
      let count = 0;
      
      for (const event of events) {
        await addDoc(collection(db, ANALYTICS_COLLECTION), event);
        count++;
        
        // Log progress every 50 events
        if (count % 50 === 0) {
          console.log(`Created ${count}/${events.length} events...`);
        }
      }
      
      console.log(`Created ${events.length} sample analytics events`);
    } else {
      console.log(`Analytics collection already has ${analyticsSnapshot.size} documents. Skipping.`);
    }
    
    console.log('Initialization complete!');
    console.log('You can now run the dashboard and see real data.');
    
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// Run the initialization
initializeCollections(); 