import React, { Component } from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/20">
              <h1 className="text-3xl font-bold text-white mb-8">🚨 Something Went Wrong</h1>
              
              <div className="space-y-6">
                <div className="bg-red-500/20 rounded-xl p-6 border border-red-500/30">
                  <h2 className="text-xl font-semibold text-red-200 mb-4">Error Details</h2>
                  <div className="text-red-100 space-y-2">
                    <div><strong>Error:</strong> {this.state.error?.message}</div>
                    <div><strong>URL:</strong> {window.location.href}</div>
                    <div><strong>Time:</strong> {new Date().toISOString()}</div>
                  </div>
                </div>

                {this.state.errorInfo && (
                  <div className="bg-black/20 rounded-xl p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Stack Trace</h2>
                    <pre className="text-gray-300 text-sm overflow-auto max-h-64">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                )}

                <div className="bg-black/20 rounded-xl p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">What You Can Do</h2>
                  <div className="text-gray-300 space-y-2">
                    <div>1. Try refreshing the page</div>
                    <div>2. Clear your browser cache</div>
                    <div>3. Try accessing the poll from the main page</div>
                    <div>4. Contact support if the issue persists</div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <button 
                    onClick={() => window.location.reload()}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Refresh Page
                  </button>
                  <a 
                    href="/"
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Go Home
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;