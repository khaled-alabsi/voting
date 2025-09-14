// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDUuAz5TAHQZziVx7mrr3syIIEVNFAvPpQ",
  authDomain: "voting-946b7.firebaseapp.com",
  projectId: "voting-946b7",
  storageBucket: "voting-946b7.firebasestorage.app",
  messagingSenderId: "784863018320",
  appId: "1:784863018320:web:5134ff98839d6cd7620055",
  measurementId: "G-2N0GRW330F"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Initialize Firebase services
export const db = getFirestore(app);
export const auth = getAuth(app);
export { analytics };

export default app;