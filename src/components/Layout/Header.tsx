import { Link } from 'react-router-dom';
import { User, LogOut, Plus, BarChart3 } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';

interface HeaderProps {
  user: FirebaseUser | null;
  onSignIn: () => void;
  onSignInAnonymously: () => void;
  onSignOut: () => void;
}

export const Header = ({ user, onSignIn, onSignInAnonymously, onSignOut }: HeaderProps) => {
  return (
    <header className="bg-white/90 backdrop-blur-md border border-white/20 shadow-xl sticky top-0 z-50 border-b border-white/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              🗳️ VotingApp
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-white/80 hover:text-white transition-colors duration-200">
              Home
            </Link>
            <Link to="/firebase-test" className="text-white/80 hover:text-white transition-colors duration-200 text-sm">
              🔥 Test DB
            </Link>
            {user && (
              <>
                <Link 
                  to="/create" 
                  className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Create Poll
                </Link>
                {!user.isAnonymous && (
                  <Link 
                    to="/dashboard" 
                    className="flex items-center text-white/80 hover:text-white transition-colors duration-200"
                  >
                    <BarChart3 className="w-4 h-4 mr-1" />
                    Dashboard
                  </Link>
                )}
              </>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center text-sm text-white/80">
                  <User className="w-4 h-4 mr-1" />
                  {user.isAnonymous ? 'Anonymous' : user.displayName || user.email}
                </div>
                <button
                  onClick={onSignOut}
                  className="flex items-center text-white/80 hover:text-white transition-colors duration-200 bg-white/10 px-3 py-2 rounded-lg hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4 mr-1" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onSignInAnonymously}
                  className="px-4 py-2 text-white/80 hover:text-white border border-white/30 rounded-lg hover:bg-white/10 transition-all duration-200"
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
        </div>
      </div>
    </header>
  );
};