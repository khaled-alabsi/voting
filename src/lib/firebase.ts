import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Default config to prevent crashes when env vars are missing
const defaultConfig = {
  apiKey: "demo-key",
  authDomain: "demo.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:demo",
  measurementId: "G-DEMO"
};

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || defaultConfig.appId,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId
};

// Check if we're using demo config
const isUsingDemoConfig = firebaseConfig.apiKey === defaultConfig.apiKey;
if (isUsingDemoConfig) {
  console.warn('🚨 Using demo Firebase configuration! App functionality will be limited.');
  console.warn('Environment:', import.meta.env.MODE);
  console.warn('Available env vars:', Object.keys(import.meta.env).filter(key => key.startsWith('VITE_')));
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

// Initialize analytics only if measurementId is available and we're not in SSR
export const analytics = typeof window !== 'undefined' && firebaseConfig.measurementId && !isUsingDemoConfig
  ? getAnalytics(app) 
  : null;

// Export flag to check if Firebase is properly configured
export const isFirebaseConfigured = !isUsingDemoConfig;

export default app;