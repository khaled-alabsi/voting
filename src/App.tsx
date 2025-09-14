import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from './services/authService';
import { Header } from './components/Layout/Header';
import { HomePage } from './pages/HomePage';
import { CreatePollPage } from './pages/CreatePollPage';
import { PollPage } from './pages/PollPage';
import { DashboardPage } from './pages/DashboardPage';
import { FirebaseTestPage } from './pages/FirebaseTestPage';
import { FirebaseConfigPage } from './pages/FirebaseConfigPage';
import { AuthModal } from './components/Auth/AuthModal';
import { Notification } from './components/UI/Notification';
import { useNotification } from './hooks/useNotification';

function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { notification, showNotification, hideNotification } = useNotification();

  useEffect(() => {
    const unsubscribe = AuthService.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignInAnonymously = async () => {
    try {
      await AuthService.signInAnonymously();
      showNotification('success', 'Signed in anonymously');
    } catch (error) {
      showNotification('error', 'Failed to sign in anonymously');
      console.error('Anonymous sign in error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AuthService.signOut();
      showNotification('success', 'Signed out successfully');
    } catch (error) {
      showNotification('error', 'Failed to sign out');
      console.error('Sign out error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-white border-t-transparent mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">Loading VotingApp...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <Header
          user={user}
          onSignIn={() => setShowAuthModal(true)}
          onSignInAnonymously={handleSignInAnonymously}
          onSignOut={handleSignOut}
        />
        
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route 
              path="/create" 
              element={user ? <CreatePollPage user={user} /> : <Navigate to="/" />} 
            />
            <Route path="/poll/:pollId" element={<PollPage user={user} />} />
            <Route 
              path="/dashboard" 
              element={user && !user.isAnonymous ? <DashboardPage user={user} /> : <Navigate to="/" />} 
            />
            <Route path="/firebase-test" element={<FirebaseTestPage />} />
            <Route path="/firebase-config" element={<FirebaseConfigPage />} />
          </Routes>
        </main>

        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onSuccess={() => {
              setShowAuthModal(false);
              showNotification('success', 'Signed in successfully');
            }}
          />
        )}

        <Notification
          notification={notification}
          onClose={hideNotification}
        />
      </div>
    </Router>
  );
}

export default App;
