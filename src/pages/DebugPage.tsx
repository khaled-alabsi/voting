import React, { useState, useEffect } from 'react';
import { db, auth, isFirebaseConfigured } from '../lib/firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId: string;
}

const DebugPage: React.FC = () => {
  const [connectionStatus, setConnectionStatus] = useState<string>('Testing...');
  const [firebaseConfig, setFirebaseConfig] = useState<FirebaseConfig | null>(null);
  const [pollTestResult, setPollTestResult] = useState<string>('');

  useEffect(() => {
    testFirebaseConnection();
    showFirebaseConfig();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      if (!isFirebaseConfigured) {
        setConnectionStatus('❌ Firebase not configured - using demo configuration');
        setPollTestResult('❌ Cannot test polls - Firebase not configured');
        return;
      }

      // Test Firestore connection
      const pollsRef = collection(db, 'polls');
      const snapshot = await getDocs(pollsRef);
      
      setConnectionStatus(`✅ Firebase connected! Found ${snapshot.size} polls in database.`);
      
      // Test specific poll access
      const pollId = '8af296f4-10d6-410d-a72b-62fdc2adafa2';
      const pollDoc = await getDoc(doc(db, 'polls', pollId));
      
      if (pollDoc.exists()) {
        setPollTestResult(`✅ Poll ${pollId} found and accessible`);
      } else {
        setPollTestResult(`❌ Poll ${pollId} not found in database`);
      }
    } catch (error) {
      setConnectionStatus(`❌ Firebase connection failed: ${error}`);
      setPollTestResult(`❌ Poll test failed: ${error}`);
    }
  };

  const showFirebaseConfig = () => {
    const config = {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Set' : '❌ Missing',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ? '✅ Set' : '❌ Missing',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Set' : '❌ Missing',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ? '✅ Set' : '❌ Missing',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ? '✅ Set' : '❌ Missing',
      appId: import.meta.env.VITE_FIREBASE_APP_ID ? '✅ Set' : '❌ Missing',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ? '✅ Set' : '❌ Missing',
    };
    setFirebaseConfig(config);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-8">🔧 Debug Page</h1>
          
          <div className="space-y-6">
            {/* Firebase Configuration Status */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Firebase Configuration Status</h2>
              <div className="text-gray-300">
                Status: {isFirebaseConfigured ? (
                  <span className="text-green-400">✅ Properly configured</span>
                ) : (
                  <div>
                    <span className="text-red-400">❌ Using demo configuration</span>
                    <p className="text-sm mt-2 text-yellow-300">
                      GitHub secrets are not configured properly. The app is running with demo Firebase config.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Environment Variables */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
              {firebaseConfig && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  {Object.entries(firebaseConfig).map(([key, value]) => (
                    <div key={key} className="flex justify-between text-gray-300">
                      <span>{key}:</span>
                      <span className={value === '✅ Set' ? 'text-green-400' : 'text-red-400'}>
                        {String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Connection Status */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Firebase Connection</h2>
              <p className="text-gray-300">{connectionStatus}</p>
            </div>

            {/* Poll Test */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Poll Access Test</h2>
              <p className="text-gray-300">{pollTestResult}</p>
            </div>

            {/* Current URL Info */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">URL Information</h2>
              <div className="text-sm text-gray-300 space-y-1">
                <div>Current URL: <span className="text-blue-300">{window.location.href}</span></div>
                <div>Origin: <span className="text-blue-300">{window.location.origin}</span></div>
                <div>Environment: <span className="text-blue-300">{import.meta.env.MODE}</span></div>
              </div>
            </div>

            {/* User Authentication */}
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Authentication Status</h2>
              <div className="text-gray-300">
                User: {auth.currentUser ? (
                  <span className="text-green-400">
                    ✅ Signed in ({auth.currentUser.isAnonymous ? 'Anonymous' : auth.currentUser.email})
                  </span>
                ) : (
                  <span className="text-yellow-400">❌ Not signed in</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;