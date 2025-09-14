#!/usr/bin/env node

/**
 * Firebase Connection Test Script
 * Run this script to test Firebase connection and create dummy data
 * 
 * Usage: npm run test-firebase
 */

// Import required modules for Node.js environment
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '../.env');
console.log('📁 Loading .env from:', envPath);
const result = config({ path: envPath });
if (result.error) {
  console.log('⚠️  No .env file found, trying default location');
  config(); // Try default location
}

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getAuth, connectAuthEmulator } from 'firebase/auth';

// Configure Firebase
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Initialize Firebase
console.log('🔥 Initializing Firebase...');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Test Firebase connection
async function testFirebaseConnection() {
  try {
    console.log('🔍 Testing Firebase connection...');
    console.log('📋 Config check:');
    console.log(`   - Project ID: ${firebaseConfig.projectId}`);
    console.log(`   - Auth Domain: ${firebaseConfig.authDomain}`);
    
    // Test authentication
    console.log('\n🔐 Testing Authentication...');
    
    // Sign in anonymously
    const { signInAnonymously, signOut } = await import('firebase/auth');
    const userCredential = await signInAnonymously(auth);
    const user = userCredential.user;
    
    console.log('✅ Authentication successful!');
    console.log(`👤 User ID: ${user.uid}`);
    console.log(`🔒 Is Anonymous: ${user.isAnonymous}`);
    
    // Test Firestore
    console.log('\n💾 Testing Firestore...');
    
    const { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } = await import('firebase/firestore');
    
    // Create a test document
    const testData = {
      message: 'Hello from Firebase test!',
      timestamp: Timestamp.now(),
      testId: Math.random().toString(36).substring(7)
    };
    
    console.log('📝 Creating test document...');
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Test document created with ID:', docRef.id);
    
    // Read test documents
    console.log('📖 Reading test documents...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log(`✅ Found ${querySnapshot.size} test documents`);
    
    querySnapshot.forEach((doc) => {
      console.log(`   - Document ${doc.id}:`, doc.data());
    });
    
    // Clean up test documents
    console.log('🧹 Cleaning up test documents...');
    const deletePromises = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'test', document.id)));
    });
    await Promise.all(deletePromises);
    console.log('✅ Test documents cleaned up');
    
    // Sign out
    await signOut(auth);
    console.log('👋 Signed out successfully');
    
    console.log('\n🎉 All Firebase tests passed!');
    console.log('🔥 Firebase is ready for use!');
    
  } catch (error) {
    console.error('❌ Firebase test failed:', error);
    
    if (error instanceof Error) {
      console.error('📝 Error message:', error.message);
      
      // Provide helpful suggestions based on error type
      if (error.message.includes('API key')) {
        console.error('💡 Suggestion: Check your VITE_FIREBASE_API_KEY in .env file');
      } else if (error.message.includes('project')) {
        console.error('💡 Suggestion: Check your VITE_FIREBASE_PROJECT_ID in .env file');
      } else if (error.message.includes('permission')) {
        console.error('💡 Suggestion: Check your Firestore security rules');
      } else if (error.message.includes('network')) {
        console.error('💡 Suggestion: Check your internet connection');
      }
    }
    
    process.exit(1);
  }
}

// Show environment info
console.log('🌍 Environment Info:');
console.log(`   - Node.js version: ${process.version}`);
console.log(`   - Platform: ${process.platform}`);
console.log(`   - Working directory: ${process.cwd()}`);
console.log(`   - Script location: ${__dirname}`);

// Check if all required environment variables are set
const requiredEnvVars = [
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_STORAGE_BUCKET',
  'VITE_FIREBASE_MESSAGING_SENDER_ID',
  'VITE_FIREBASE_APP_ID'
];

console.log('\n🔧 Environment Variables Check:');
let allEnvVarsSet = true;
for (const envVar of requiredEnvVars) {
  const value = process.env[envVar];
  if (value) {
    console.log(`   ✅ ${envVar}: ${value.substring(0, 20)}...`);
  } else {
    console.log(`   ❌ ${envVar}: NOT SET`);
    allEnvVarsSet = false;
  }
}

if (!allEnvVarsSet) {
  console.error('\n❌ Some required environment variables are missing!');
  console.error('Please check your .env file and ensure all Firebase config variables are set.');
  process.exit(1);
}

// Run the test
console.log('\n' + '='.repeat(50));
testFirebaseConnection();