// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Analytics imports
let analyticsInstance: any = null;

// Import Firebase analytics based on platform
if (Platform.OS === 'web') {
  // For web, we'll initialize analytics later to avoid import errors in SSR
  console.log('Web platform detected, analytics will be initialized at runtime');
} else {
  // For native platforms, import directly
  try {
    // We use require instead of import to avoid SSR issues
    const analytics = require('@react-native-firebase/analytics').default;
    analyticsInstance = analytics();
    console.log('Firebase Analytics initialized for native');
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics for native:', error);
  }
}

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAFugF2_o5rHBcq7JE0KcvSnR8HLJ6LmCc",
  authDomain: "mealfix-66eaf.firebaseapp.com",
  projectId: "mealfix-66eaf",
  storageBucket: "mealfix-66eaf.firebasestorage.app",
  messagingSenderId: "367908404312",
  appId: "1:367908404312:web:0779f843abf99ec2789e2d",
  measurementId: "G-LQ0D297W57"
};

// Analytics event names
export const RecipeEvents = {
  VIEW_RECIPE: 'view_recipe',
  GENERATE_RECIPE: 'generate_recipe',
  SAVE_RECIPE: 'save_recipe',
  SEARCH_INGREDIENTS: 'search_ingredients',
  PRICE_ESTIMATE: 'price_estimate',
  LLM_RESPONSE: 'llm_response',
  USER_LOGIN: 'user_login',
  USER_SIGNUP: 'user_signup',
  RECIPE_ERROR: 'recipe_error',
  FAVORITE_RECIPE: 'favorite_recipe',
  DIETARY_TOGGLE: 'dietary_toggle',
  SCREEN_TIME: 'screen_time'
} as const;

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
const auth = getAuth(app);

// Initialize Firestore
const db = getFirestore(app);

// Initialize web analytics if on web platform
if (Platform.OS === 'web') {
  try {
    // In web environments, initialize analytics if running in browser
    if (typeof window !== 'undefined') {
      // Use a simple require to avoid dynamic imports
      const firebaseAnalytics = require('firebase/analytics');
      analyticsInstance = firebaseAnalytics.getAnalytics(app);
      console.log('Firebase Analytics initialized for web');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Analytics for web:', error);
  }
}

// Analytics helper function with graceful degradation
export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    if (!analyticsInstance) {
      console.log(`Analytics not initialized yet. Event ${eventName} will not be logged.`);
      return;
    }

    if (Platform.OS === 'web') {
      // For web, use the firebase/analytics logEvent
      const firebaseAnalytics = require('firebase/analytics');
      firebaseAnalytics.logEvent(analyticsInstance, eventName, params);
    } else {
      // For native, use the react-native-firebase analytics
      await analyticsInstance.logEvent(eventName, params);
    }
    
    console.log(`Analytics event logged: ${eventName}`, params);
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

if (Platform.OS === 'web') {
  console.log('Analytics collection enabled for web');
} else if (analyticsInstance) {
  analyticsInstance.setAnalyticsCollectionEnabled(true);
  analyticsInstance.setDebugModeEnabled(__DEV__); // Only enable debug in development
  console.log('Analytics collection and debug mode configured for native');
}

export { auth, db };
export default app;