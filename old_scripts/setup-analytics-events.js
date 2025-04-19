// Setup script for initializing analytics events data in Firestore
const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Config
const ANALYTICS_EVENTS_COLLECTION = 'analytics_events';
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

// Helper function to generate random date within a range
function randomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper function to generate a random integer within a range
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// Helper function to pick a random item from an array
function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

// Sample data
const recipeNames = [
  'Vegetarian Pasta', 'Keto Chicken Bowl', 'Gluten-Free Pancakes', 'Vegan Buddha Bowl',
  'Low-Carb Pizza', 'Mediterranean Salad', 'Thai Curry', 'Mexican Tacos',
  'Japanese Sushi Bowl', 'Indian Butter Chicken', 'Italian Risotto', 'French Ratatouille',
  'Greek Moussaka', 'Spanish Paella', 'American Burger', 'Chinese Stir Fry'
];

const ingredients = [
  'chicken', 'beef', 'pork', 'tofu', 'eggs', 'milk', 'cheese', 'butter',
  'flour', 'rice', 'pasta', 'potatoes', 'tomatoes', 'onions', 'garlic', 'bell peppers',
  'carrots', 'broccoli', 'spinach', 'kale', 'lettuce', 'avocado', 'mushrooms', 'zucchini',
  'olive oil', 'salt', 'pepper', 'basil', 'oregano', 'thyme', 'cumin', 'coriander',
  'ginger', 'turmeric', 'cinnamon', 'nutmeg', 'vanilla', 'sugar', 'honey', 'maple syrup'
];

const dietaryPreferences = [
  'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Nut-Free',
  'Low-Carb', 'Keto', 'Paleo', 'Mediterranean', 'Pescatarian'
];

const platforms = ['ios', 'android', 'web'];
const devices = ['iPhone 13', 'iPhone 12', 'iPhone SE', 'Samsung Galaxy S22', 'Samsung Galaxy A52',
                 'Google Pixel 6', 'OnePlus 10', 'iPad Pro', 'iPad Air', 'Chrome', 'Safari', 'Firefox'];

const userIds = Array(50).fill().map((_, i) => `user_${i + 1}`);

// Generate a timestamp between 90 days ago and now
function generateTimestamp() {
  const now = new Date();
  const ninetyDaysAgo = new Date(now);
  ninetyDaysAgo.setDate(now.getDate() - 90);
  
  return randomDate(ninetyDaysAgo, now);
}

// Generate event data
function generateEvents(count) {
  const events = [];
  
  // Recipe view events (40% of events)
  const recipeViewCount = Math.floor(count * 0.4);
  for (let i = 0; i < recipeViewCount; i++) {
    const recipeName = randomItem(recipeNames);
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'recipe_view',
      user_id: randomItem(userIds),
      recipe_name: recipeName,
      screen_time: randomInt(5, 300), // 5 seconds to 5 minutes
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Recipe save events (20% of events)
  const recipeSaveCount = Math.floor(count * 0.2);
  for (let i = 0; i < recipeSaveCount; i++) {
    const recipeName = randomItem(recipeNames);
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'recipe_save',
      user_id: randomItem(userIds),
      recipe_name: recipeName,
      difficulty: randomItem(['Easy', 'Medium', 'Hard']),
      prep_time: randomInt(10, 60),
      dietary_restrictions: randomItem(dietaryPreferences),
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Ingredient search events (15% of events)
  const ingredientSearchCount = Math.floor(count * 0.15);
  for (let i = 0; i < ingredientSearchCount; i++) {
    const searchItems = Array(randomInt(1, 5)).fill().map(() => randomItem(ingredients));
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'ingredient_search',
      user_id: randomItem(userIds),
      search_items: searchItems,
      search_time: randomInt(1, 30),
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Dietary preference toggle events (10% of events)
  const dietaryPreferenceCount = Math.floor(count * 0.1);
  for (let i = 0; i < dietaryPreferenceCount; i++) {
    const preference = randomItem(dietaryPreferences);
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'dietary_preference_toggle',
      user_id: randomItem(userIds),
      preference: preference,
      enabled: Math.random() > 0.3, // 70% chance of being enabled
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Login events (5% of events)
  const loginCount = Math.floor(count * 0.05);
  for (let i = 0; i < loginCount; i++) {
    const userId = randomItem(userIds);
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'user_login',
      user_id: userId,
      method: randomItem(['email', 'google', 'apple', 'facebook']),
      success: Math.random() > 0.05, // 95% success rate
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Signup events (2% of events)
  const signupCount = Math.floor(count * 0.02);
  for (let i = 0; i < signupCount; i++) {
    const userId = randomItem(userIds);
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'user_signup',
      user_id: userId,
      method: randomItem(['email', 'google', 'apple', 'facebook']),
      dietary_preferences: Array(randomInt(0, 3)).fill().map(() => randomItem(dietaryPreferences)),
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Error events (3% of events)
  const errorCount = Math.floor(count * 0.03);
  for (let i = 0; i < errorCount; i++) {
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'error',
      user_id: randomItem(userIds),
      error_type: randomItem(['network', 'authentication', 'data_processing', 'recipe_generation']),
      error_message: `Error ${randomInt(100, 999)}: Sample error message`,
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }
  
  // Screen time events (5% of events)
  const screenTimeCount = Math.floor(count * 0.05);
  for (let i = 0; i < screenTimeCount; i++) {
    const timestamp = generateTimestamp();
    events.push({
      event_name: 'screen_time',
      user_id: randomItem(userIds),
      screen_name: randomItem(['home', 'recipe_detail', 'search', 'saved_recipes', 'profile', 'settings']),
      time_spent: randomInt(5, 600), // 5 seconds to 10 minutes
      platform: randomItem(platforms),
      device: randomItem(devices),
      timestamp: admin.firestore.Timestamp.fromDate(timestamp),
      date: timestamp.toISOString().split('T')[0]
    });
  }

  return events;
}

// Upload events to Firestore in batches
async function uploadEvents(events, forceReplace = false) {
  const eventsRef = db.collection(ANALYTICS_EVENTS_COLLECTION);
  const eventsSnapshot = await eventsRef.limit(1).get();
  
  if (!eventsSnapshot.empty && !forceReplace) {
    console.log(`Collection '${ANALYTICS_EVENTS_COLLECTION}' already exists. Use --force to replace it.`);
    return;
  }
  
  if (!eventsSnapshot.empty && forceReplace) {
    console.log(`Replacing existing '${ANALYTICS_EVENTS_COLLECTION}' collection...`);
    // Delete all documents in the collection (this can be slow for large collections)
    const existingEvents = await eventsRef.get();
    
    // Delete in batches
    const deletePromises = [];
    let deleteBatch = db.batch();
    let deleteCount = 0;
    
    existingEvents.forEach(doc => {
      deleteBatch.delete(doc.ref);
      deleteCount++;
      
      if (deleteCount >= BATCH_SIZE) {
        deletePromises.push(deleteBatch.commit());
        deleteBatch = db.batch();
        deleteCount = 0;
      }
    });
    
    if (deleteCount > 0) {
      deletePromises.push(deleteBatch.commit());
    }
    
    await Promise.all(deletePromises);
  }
  
  console.log(`Uploading ${events.length} analytics events...`);
  
  // Upload in batches
  const batches = [];
  let currentBatch = db.batch();
  let count = 0;
  
  for (const event of events) {
    const docRef = eventsRef.doc();
    currentBatch.set(docRef, event);
    count++;
    
    if (count >= BATCH_SIZE) {
      batches.push(currentBatch.commit());
      currentBatch = db.batch();
      count = 0;
    }
  }
  
  if (count > 0) {
    batches.push(currentBatch.commit());
  }
  
  await Promise.all(batches);
  console.log(`✅ Successfully uploaded ${events.length} analytics events!`);
}

// Main function
async function setupAnalytics() {
  const args = process.argv.slice(2);
  const forceReplace = args.includes('--force');
  const eventCount = args.find(arg => arg.startsWith('--count='));
  const count = eventCount ? parseInt(eventCount.split('=')[1]) : 1000;
  
  console.log('📊 MealFix Analytics Events Setup');
  console.log('=================================');
  console.log(`Generating ${count} sample analytics events...`);
  
  try {
    const events = generateEvents(count);
    await uploadEvents(events, forceReplace);
    console.log('\n✅ Setup complete! Your analytics events are ready for the dashboard.');
    console.log(`The data spans the last 90 days with events distributed among ${userIds.length} users.`);
  } catch (error) {
    console.error('❌ Error setting up analytics data:', error);
    process.exit(1);
  }
}

// Run the main function
setupAnalytics(); 