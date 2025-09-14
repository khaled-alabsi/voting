import { useState } from 'react';
import { FirebaseTestService } from '../scripts/testFirebase';
import { Play, Trash2, AlertCircle, CheckCircle } from 'lucide-react';

export const FirebaseTestPage = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Override console.log to capture logs
  const originalConsoleLog = console.log;
  const originalConsoleError = console.error;

  const captureConsole = (callback: () => Promise<void>) => {
    const logCapture: string[] = [];
    
    console.log = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logCapture.push(`[LOG] ${message}`);
      originalConsoleLog(...args);
    };
    
    console.error = (...args: unknown[]) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ');
      logCapture.push(`[ERROR] ${message}`);
      originalConsoleError(...args);
    };

    return callback().finally(() => {
      console.log = originalConsoleLog;
      console.error = originalConsoleError;
      setLogs(logCapture);
    });
  };

  const runFirebaseTest = async () => {
    setIsRunning(true);
    setError(null);
    setLogs([]);

    try {
      await captureConsole(async () => {
        await FirebaseTestService.testConnection();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsRunning(false);
    }
  };

  const clearTestData = async () => {
    setIsClearing(true);
    setError(null);

    try {
      await captureConsole(async () => {
        await FirebaseTestService.clearTestData();
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Firebase Connection Test</h1>
          <p className="text-gray-600 mb-8">
            Test the Firebase connection and populate the database with dummy data for development.
          </p>

          <div className="flex gap-4 mb-8">
            <button
              onClick={runFirebaseTest}
              disabled={isRunning || isClearing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              <Play className="w-5 h-5 mr-2" />
              {isRunning ? 'Running Tests...' : 'Run Firebase Test'}
            </button>

            <button
              onClick={clearTestData}
              disabled={isRunning || isClearing}
              className="bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg shadow-lg hover:from-red-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              {isClearing ? 'Clearing...' : 'Clear Test Data'}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="text-red-800 font-semibold">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            </div>
          )}

          {logs.length > 0 && (
            <div className="bg-gray-900 rounded-lg p-6 overflow-hidden">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-5 h-5 text-green-400 mr-2" />
                <h3 className="text-white font-semibold">Console Output</h3>
              </div>
              <div className="bg-black rounded p-4 max-h-96 overflow-y-auto">
                <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono">
                  {logs.join('\n')}
                </pre>
              </div>
            </div>
          )}

          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-blue-800 font-semibold mb-2">What this test does:</h3>
            <ul className="text-blue-700 space-y-1">
              <li>• Tests Firebase authentication (anonymous sign-in)</li>
              <li>• Creates 3 dummy polls with various configurations</li>
              <li>• Tests poll creation and retrieval</li>
              <li>• Submits a test vote and calculates statistics</li>
              <li>• Lists all polls created by the test user</li>
              <li>• Verifies all Firebase operations are working correctly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};