import React from 'react';

const SimpleDebugPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-3xl font-bold text-white mb-8">🔧 Simple Debug Page</h1>
          
          <div className="space-y-6">
            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
              <div className="text-gray-300 space-y-2">
                <div>Page loaded successfully ✅</div>
                <div>Current URL: {window.location.href}</div>
                <div>Environment: {import.meta.env.MODE}</div>
                <div>Base URL: {import.meta.env.BASE_URL}</div>
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Environment Variables</h2>
              <div className="text-gray-300 space-y-1 text-sm">
                {Object.entries(import.meta.env).map(([key, value]) => (
                  <div key={key} className="flex justify-between">
                    <span>{key}:</span>
                    <span className="text-blue-300 max-w-md truncate">
                      {key.includes('FIREBASE') ? (value ? '✅ Set' : '❌ Missing') : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-black/20 rounded-xl p-6">
              <h2 className="text-xl font-semibold text-white mb-4">Navigation Test</h2>
              <div className="space-y-2">
                <a href="/" className="text-blue-400 hover:text-blue-300 block">← Back to Home</a>
                <a href="/firebase-test" className="text-blue-400 hover:text-blue-300 block">→ Firebase Test Page</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDebugPage;