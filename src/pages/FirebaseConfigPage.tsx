import { useState } from 'react';
import { Settings, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

interface ConfigCheck {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  details?: string;
}

export const FirebaseConfigPage = () => {
  const [checks, setChecks] = useState<ConfigCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runConfigChecks = async () => {
    setIsRunning(true);
    setChecks([]);

    const newChecks: ConfigCheck[] = [];

    // Check 1: Environment variables
    const envVars = [
      'VITE_FIREBASE_API_KEY',
      'VITE_FIREBASE_AUTH_DOMAIN',
      'VITE_FIREBASE_PROJECT_ID',
      'VITE_FIREBASE_STORAGE_BUCKET',
      'VITE_FIREBASE_MESSAGING_SENDER_ID',
      'VITE_FIREBASE_APP_ID'
    ];

    let allEnvVarsPresent = true;
    const missingVars: string[] = [];

    for (const envVar of envVars) {
      const value = import.meta.env[envVar];
      if (!value) {
        allEnvVarsPresent = false;
        missingVars.push(envVar);
      }
    }

    if (allEnvVarsPresent) {
      newChecks.push({
        name: 'Environment Variables',
        status: 'success',
        message: 'All Firebase environment variables are present',
        details: `Found ${envVars.length} required variables`
      });
    } else {
      newChecks.push({
        name: 'Environment Variables',
        status: 'error',
        message: `Missing ${missingVars.length} environment variables`,
        details: `Missing: ${missingVars.join(', ')}`
      });
    }

    setChecks([...newChecks]);

    // Check 2: Firebase initialization
    try {
      await import('../lib/firebase');
      newChecks.push({
        name: 'Firebase Initialization',
        status: 'success',
        message: 'Firebase app initialized successfully',
        details: 'Firebase SDK loaded and app configured'
      });
    } catch (error) {
      newChecks.push({
        name: 'Firebase Initialization',
        status: 'error',
        message: 'Failed to initialize Firebase',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setChecks([...newChecks]);

    // Check 3: Project ID validation
    const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;
    if (projectId) {
      if (projectId.match(/^[a-z0-9-]+$/)) {
        newChecks.push({
          name: 'Project ID Format',
          status: 'success',
          message: 'Project ID format is valid',
          details: `Project: ${projectId}`
        });
      } else {
        newChecks.push({
          name: 'Project ID Format',
          status: 'warning',
          message: 'Project ID format might be invalid',
          details: 'Project IDs should only contain lowercase letters, numbers, and hyphens'
        });
      }
    }

    setChecks([...newChecks]);

    // Check 4: Firestore connection (basic)
    try {
      const { getFirestore } = await import('firebase/firestore');
      await import('../lib/firebase');
      
      // Just try to get the firestore instance - this doesn't make network calls
      getFirestore();
      
      newChecks.push({
        name: 'Firestore Instance',
        status: 'success',
        message: 'Firestore instance created successfully',
        details: 'Ready to make database calls'
      });
    } catch (error) {
      newChecks.push({
        name: 'Firestore Instance',
        status: 'error',
        message: 'Failed to create Firestore instance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setChecks([...newChecks]);

    // Check 5: Auth instance
    try {
      const { getAuth } = await import('firebase/auth');
      getAuth();
      
      newChecks.push({
        name: 'Auth Instance',
        status: 'success',
        message: 'Firebase Auth instance created',
        details: 'Authentication service is ready'
      });
    } catch (error) {
      newChecks.push({
        name: 'Auth Instance',
        status: 'error',
        message: 'Failed to create Auth instance',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }

    setChecks([...newChecks]);

    setIsRunning(false);
  };

  const getStatusIcon = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    }
  };

  const getStatusColor = (status: ConfigCheck['status']) => {
    switch (status) {
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      case 'warning':
        return 'border-yellow-200 bg-yellow-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Firebase Configuration Check</h1>
          <p className="text-gray-600 mb-8">
            Verify your Firebase configuration before running full tests.
          </p>

          <button
            onClick={runConfigChecks}
            disabled={isRunning}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center mb-8"
          >
            <Settings className="w-5 h-5 mr-2" />
            {isRunning ? 'Checking Configuration...' : 'Check Firebase Configuration'}
          </button>

          {checks.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Configuration Results</h2>
              
              {checks.map((check, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3 mt-0.5">
                      {getStatusIcon(check.status)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-800">{check.name}</h3>
                      <p className="text-gray-700 mt-1">{check.message}</p>
                      {check.details && (
                        <p className="text-gray-600 text-sm mt-2">{check.details}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {checks.length > 0 && (
            <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-blue-800 font-semibold mb-2">Next Steps:</h3>
              <div className="text-blue-700 space-y-2">
                {checks.every(check => check.status === 'success') ? (
                  <>
                    <p>✅ All configuration checks passed!</p>
                    <p>🔥 You can now run the full Firebase test to test authentication and database operations.</p>
                    <p>🌐 Go to <strong>/firebase-test</strong> to run the complete test suite.</p>
                  </>
                ) : (
                  <>
                    <p>⚠️ Some configuration issues were found.</p>
                    <p>🔧 Please fix the issues above before running the full Firebase test.</p>
                    <p>📝 Check your .env file and Firebase Console settings.</p>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
            <h3 className="text-gray-800 font-semibold mb-2">Firebase Console Setup Required:</h3>
            <ul className="text-gray-700 space-y-1 text-sm">
              <li>• Go to <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Firebase Console</a></li>
              <li>• Enable Authentication → Sign-in method → Anonymous</li>
              <li>• Create Firestore Database</li>
              <li>• Update Firestore Security Rules for development</li>
              <li>• Verify all services are enabled in your project</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};