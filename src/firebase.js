// Firebase configuration
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  // These will need to be set up with actual Firebase project credentials
  apiKey: "demo-api-key",
  authDomain: "voting-app-demo.firebaseapp.com",
  projectId: "voting-app-demo",
  storageBucket: "voting-app-demo.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;