// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

// Initialize Firebase
let app;
if (getApps().length === 0) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth
const auth = getAuth(app);

export { auth };
export default app;