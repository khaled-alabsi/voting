import { useState, useEffect, useCallback } from 'react';
import { X, Clock, User, Crown, Eye, ExternalLink, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SessionService } from '../../services/sessionService';
import type { PollHistory } from '../../types';
import type { Timestamp } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import { AuthService } from '../../services/authService';

interface PollHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PollHistoryModal = ({ isOpen, onClose }: PollHistoryModalProps) => {
  const [pollHistory, setPollHistory] = useState<PollHistory | null>(null);
  const [createdPolls, setCreatedPolls] = useState<Array<{pollId: string, title: string, createdAt: Timestamp, status: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'participated' | 'created'>('participated');
  const navigate = useNavigate();
  const currentUser = AuthService.getCurrentUser();

  const loadPollHistory = useCallback(async () => {
    setLoading(true);
    try {
      // Load participated polls
      const history = await SessionService.getUserPollHistory();
      setPollHistory(history);

      // Load created polls (for admin functionality)
      if (currentUser && !currentUser.isAnonymous) {
        const created = await SessionService.getCreatedPolls();
        setCreatedPolls(created);
      }
    } catch (error) {
      console.error('Failed to load poll history:', error);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => {
    if (isOpen) {
      loadPollHistory();
    }
  }, [isOpen, loadPollHistory]);

  const handlePollClick = (pollId: string, role: string) => {
    if (role === 'creator') {
      navigate(`/poll/${pollId}/admin`);
    } else {
      navigate(`/poll/${pollId}`);
    }
    onClose();
  };

  const handleViewResults = (pollId: string) => {
    navigate(`/poll/${pollId}/results`);
    onClose();
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'creator':
        return <Crown className="w-4 h-4 text-yellow-600" />;
      case 'voter':
        return <User className="w-4 h-4 text-blue-600" />;
      case 'viewer':
        return <Eye className="w-4 h-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const getRoleBadge = (role: string) => {
    const styles = {
      creator: 'bg-yellow-50 text-yellow-800 border-yellow-200',
      voter: 'bg-blue-50 text-blue-800 border-blue-200',
      viewer: 'bg-gray-50 text-gray-800 border-gray-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[role as keyof typeof styles] || styles.viewer}`}>
        {getRoleIcon(role)}
        <span className="ml-1 capitalize">{role}</span>
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-50 text-green-800 border-green-200',
      completed: 'bg-blue-50 text-blue-800 border-blue-200',
      expired: 'bg-red-50 text-red-800 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles] || styles.expired}`}>
        {status === 'active' && '🟢'}
        {status === 'completed' && '🔵'}
        {status === 'expired' && '🔴'}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Your Poll History</h2>
              <p className="text-gray-600 mt-1">View and manage polls you've participated in or created</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Tab Navigation */}
          {currentUser && !currentUser.isAnonymous && (
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('participated')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'participated'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <User className="w-4 h-4 inline mr-2" />
                Participated ({pollHistory?.polls.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('created')}
                className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                  activeTab === 'created'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Crown className="w-4 h-4 inline mr-2" />
                Created ({createdPolls.length})
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[70vh]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-gray-600">Loading your poll history...</span>
            </div>
          ) : activeTab === 'participated' ? (
            // Participated Polls Tab
            !pollHistory || pollHistory.polls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls found</h3>
                <p className="text-gray-600 mb-6">You haven't participated in any polls yet.</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Poll
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {pollHistory.polls.map((poll, index) => (
                  <div
                    key={`${poll.pollId}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{poll.title}</h3>
                          {getRoleBadge(poll.role)}
                          {getStatusBadge(poll.status)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Clock className="w-4 h-4 mr-1" />
                          Last accessed: {poll.lastAccessed.toDate().toLocaleDateString()} at {poll.lastAccessed.toDate().toLocaleTimeString()}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePollClick(poll.pollId, poll.role)}
                            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            {poll.role === 'creator' ? 'Open Admin Panel' : 'View Poll'}
                          </button>
                          
                          {poll.role === 'creator' && (
                            <button
                              onClick={() => handleViewResults(poll.pollId)}
                              className="inline-flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Results
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : (
            // Created Polls Tab
            createdPolls.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👑</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No polls created</h3>
                <p className="text-gray-600 mb-6">You haven't created any polls yet.</p>
                <button
                  onClick={onClose}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Your First Poll
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {createdPolls.map((poll, index) => (
                  <div
                    key={`${poll.pollId}-${index}`}
                    className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="font-semibold text-gray-900 text-lg">{poll.title}</h3>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border bg-yellow-50 text-yellow-800 border-yellow-200">
                            <Crown className="w-3 h-3 mr-1" />
                            Creator
                          </span>
                          {getStatusBadge(poll.status)}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mb-3">
                          <Clock className="w-4 h-4 mr-1" />
                          Created: {poll.createdAt.toDate().toLocaleDateString()} at {poll.createdAt.toDate().toLocaleTimeString()}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePollClick(poll.pollId, 'creator')}
                            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                          >
                            <Settings className="w-4 h-4 mr-1" />
                            Admin Panel
                          </button>
                          
                          <button
                            onClick={() => handleViewResults(poll.pollId)}
                            className="inline-flex items-center px-3 py-2 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            View Results
                          </button>

                          <button
                            onClick={() => {
                              navigate(`/poll/${poll.pollId}`);
                              onClose();
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          >
                            <ExternalLink className="w-4 h-4 mr-1" />
                            View as Voter
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Footer */}
        {((activeTab === 'participated' && pollHistory && pollHistory.polls.length > 0) || 
          (activeTab === 'created' && createdPolls.length > 0)) && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                {activeTab === 'participated' ? (
                  <>
                    {pollHistory?.polls.length} poll{pollHistory?.polls.length !== 1 ? 's' : ''} found
                    • Session: {pollHistory?.sessionToken.substring(0, 8)}...
                  </>
                ) : (
                  <>
                    {createdPolls.length} poll{createdPolls.length !== 1 ? 's' : ''} created
                    • Admin access available
                  </>
                )}
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};