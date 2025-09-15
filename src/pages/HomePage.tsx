import { Link } from 'react-router-dom';
import { Plus, Users, BarChart3, Clock } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HomePageProps {
  user?: FirebaseUser | null;
  onSignInRequired?: () => void;
  onSignInAnonymously?: () => void;
}

export const HomePage = ({ user, onSignInRequired, onSignInAnonymously }: HomePageProps) => {
  const handleCreatePollClick = async (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      if (onSignInAnonymously) {
        // Sign in anonymously first, then the user will be redirected via the route protection
        try {
          await onSignInAnonymously();
        } catch (error) {
          console.error('Failed to sign in anonymously:', error);
          // Fallback to showing sign in modal
          onSignInRequired?.();
        }
      } else {
        onSignInRequired?.();
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <section className="text-center py-20">
        <div className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl rounded-xl p-8 max-w-4xl mx-auto">
          <h1 className="text-6xl font-bold text-gray-800 mb-6">
            Create & Share{' '}
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Voting Polls
            </span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Build beautiful, customizable voting polls with real-time analytics. 
            Share with anyone, track engagement, and get instant insights.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/create"
              onClick={handleCreatePollClick}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 text-lg inline-flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Your First Poll
            </Link>
            <button className="bg-white text-gray-700 font-semibold py-4 px-8 rounded-lg shadow-md border border-gray-200 hover:bg-gray-50 hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-lg inline-flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Demo Poll
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Everything you need for effective voting
          </h2>
          <p className="text-xl text-white/80 max-w-2xl mx-auto">
            Powerful features designed to make voting simple, secure, and insightful
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Users className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Anonymous & Authenticated</h3>
            <p className="text-gray-600">Allow anonymous voting or require authentication for verified results.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Clock className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Time-Based Analytics</h3>
            <p className="text-gray-600">Track how long voters take to decide and voting patterns over time.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Real-time Results</h3>
            <p className="text-gray-600">See votes come in real-time with beautiful charts and statistics.</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 text-center transform hover:scale-105 transition-all duration-200">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2 text-gray-800">Customizable</h3>
            <p className="text-gray-600">Allow voters to add new questions and answer options on the fly.</p>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-16 bg-gray-50 -mx-4 px-4 rounded-lg">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          How it works
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              1
            </div>
            <h3 className="text-lg font-semibold mb-2">Create Your Poll</h3>
            <p className="text-gray-600">Set up questions, answers, and customize voting settings in minutes.</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              2
            </div>
            <h3 className="text-lg font-semibold mb-2">Share the Link</h3>
            <p className="text-gray-600">Get a unique shareable link to distribute to your audience.</p>
          </div>

          <div className="text-center">
            <div className="bg-blue-600 text-white w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 text-xl font-bold">
              3
            </div>
            <h3 className="text-lg font-semibold mb-2">Analyze Results</h3>
            <p className="text-gray-600">Watch real-time voting and export detailed analytics.</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center py-16">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Ready to get started?
        </h2>
        <p className="text-gray-600 mb-8">
          Create your first poll in less than 2 minutes.
        </p>
        <Link
          to="/create"
          className="inline-flex items-center px-8 py-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-lg"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create Free Poll
        </Link>
      </section>
    </div>
  );
};