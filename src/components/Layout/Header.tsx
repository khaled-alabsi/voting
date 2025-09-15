import { Link } from 'react-router-dom';
import { User, LogOut, Plus, BarChart3, Menu, X, History } from 'lucide-react';
import { useState } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignInAnonymously: () => void;
  onSignOut: () => void;
  onShowPollHistory?: () => void;
}

export const Header = ({ user, onSignIn, onSignInAnonymously, onSignOut, onShowPollHistory }: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-blue-600 bg-clip-text text-transparent">
              🗳️ VotingApp
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-gray-900 transition-colors duration-200">
              Home
            </Link>
            <Link to="/firebase-test" className="text-gray-600 hover:text-gray-800 transition-colors duration-200 text-sm">
              🔥 Test DB
            </Link>
            {user && (
              <>
                <Link 
                  to="/create" 
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Poll
                </Link>
                <button
                  onClick={onShowPollHistory}
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                >
                  <History className="w-4 h-4 mr-1" />
                  Poll History
                </button>
                {!user.isAnonymous && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          {/* Desktop Auth Section */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-gray-700">
                  <User className="w-4 h-4 mr-1" />
                  {user.isAnonymous ? 'Anonymous' : user.displayName || user.email}
                </div>
                <button
                  onClick={onSignOut}
                  className="flex items-center text-gray-700 hover:text-gray-900 transition-colors duration-200 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  {user.isAnonymous ? 'Exit Anonymous' : 'Sign Out'}
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignInAnonymously}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                >
                  Continue Anonymously
                </button>
                <button
                  onClick={onSignIn}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
                >
                  Sign In
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 py-4">
            <div className="flex flex-col space-y-4">
              <Link 
                to="/" 
                className="text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                to="/firebase-test" 
                className="text-gray-600 hover:text-gray-800 px-4 py-2 text-sm transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                🔥 Test DB
              </Link>
              {user && (
                <>
                  <Link 
                    to="/create" 
                    className="flex items-center text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Poll
                  </Link>
                  <button
                    onClick={() => {
                      onShowPollHistory?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors duration-200 text-left w-full"
                  >
                    <History className="w-4 h-4 mr-2" />
                    Poll History
                  </button>
                  {!user.isAnonymous && (
                    <Link 
                      to="/dashboard" 
                      className="flex items-center text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <BarChart3 className="w-4 h-4 mr-2" />
                      Dashboard
                    </Link>
                  )}
                </>
              )}
              
              {/* Mobile Auth Section */}
              <div className="border-t border-gray-200 pt-4 px-4">
                {user ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-gray-700">
                      <User className="w-4 h-4 mr-2" />
                      {user.isAnonymous ? 'Anonymous' : user.displayName || user.email}
                    </div>
                    <button
                      onClick={() => {
                        onSignOut();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center w-full text-gray-700 hover:text-gray-900 bg-gray-100 px-3 py-2 rounded-lg hover:bg-gray-200 transition-all duration-200"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      {user.isAnonymous ? 'Exit Anonymous' : 'Sign Out'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={() => {
                        onSignInAnonymously();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200"
                    >
                      Continue Anonymously
                    </button>
                    <button
                      onClick={() => {
                        onSignIn();
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-2 px-4 rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200"
                    >
                      Sign In
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};