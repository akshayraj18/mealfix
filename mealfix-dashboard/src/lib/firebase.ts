import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

console.log('Initializing Firebase connection for dashboard...');

// Your web app's Firebase configuration - using the same project as the mobile app
const firebaseConfig = {
  apiKey: "AIzaSyAFugF2_o5rHBcq7JE0KcvSnR8HLJ6LmCc",
  authDomain: "mealfix-66eaf.firebaseapp.com",
  projectId: "mealfix-66eaf",
  storageBucket: "mealfix-66eaf.firebasestorage.app",
  messagingSenderId: "367908404312",
  appId: "1:367908404312:web:0779f843abf99ec2789e2d",
  measurementId: "G-LQ0D297W57"
};

console.log('Firebase config:', { 
  projectId: firebaseConfig.projectId,
  authDomain: firebaseConfig.authDomain
});

// Initialize Firebase
let app: FirebaseApp;
let analytics: Analytics | null = null;

if (typeof window !== 'undefined') {
  console.log('Initializing Firebase for client-side...');
  if (getApps().length === 0) {
    console.log('No existing Firebase apps, initializing new one');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Using existing Firebase app');
    app = getApp();
  }
  
  // Initialize Analytics
  isSupported().then(supported => {
    if (supported) {
      console.log('Analytics is supported, initializing...');
      analytics = getAnalytics(app);
    } else {
      console.log('Analytics is not supported in this environment');
    }
  });
} else {
  // Server-side initialization (without analytics)
  console.log('Initializing Firebase for server-side rendering...');
  if (getApps().length === 0) {
    console.log('No existing Firebase apps, initializing new one (server)');
    app = initializeApp(firebaseConfig);
  } else {
    console.log('Using existing Firebase app (server)');
    app = getApp();
  }
}

// Initialize Auth
const auth: Auth = getAuth(app);
console.log('Firebase Auth initialized');

// Initialize Firestore
const db: Firestore = getFirestore(app);
console.log('Firebase Firestore initialized');

// Analytics event names - same as mobile app
export const DashboardEvents = {
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_ANALYTICS: 'view_analytics',
  FILTER_DATA: 'filter_data',
  CREATE_FEATURE_FLAG: 'create_feature_flag',
  UPDATE_FEATURE_FLAG: 'update_feature_flag',
  CREATE_AB_TEST: 'create_ab_test',
  UPDATE_AB_TEST: 'update_ab_test',
  ADMIN_LOGIN: 'admin_login'
};

// Analytics helper function
export const logEvent = async (eventName: string, params?: Record<string, any>) => {
  try {
    if (analytics && typeof window !== 'undefined') {
      console.log('Logging analytics event:', eventName, params);
      const { logEvent } = await import('firebase/analytics');
      logEvent(analytics, eventName, params);
      console.log(`Dashboard analytics event logged: ${eventName}`);
    } else {
      console.log(`Cannot log event ${eventName}: analytics not initialized`);
    }
  } catch (error) {
    console.error('Failed to log analytics event:', error);
  }
};

console.log('Firebase setup complete');

export { auth, db };
export default app; 