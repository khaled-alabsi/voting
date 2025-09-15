import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, Clock, BarChart3, Settings, ExternalLink, UserX } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Poll, Vote, PollVisitor } from '../types';
import { PollService } from '../services/pollService';
import { CreatorAuthService } from '../services/creatorAuthService';
import { SessionService } from '../services/sessionService';

interface PollAdminPageProps {
  user: FirebaseUser | null;
}

export const PollAdminPage = ({ user }: PollAdminPageProps) => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [visitors, setVisitors] = useState<PollVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to safely convert Firestore timestamp to Date
  const safeToDate = (timestamp: unknown): Date => {
    if (!timestamp) return new Date();
    if (typeof timestamp === 'object' && timestamp !== null && 'toDate' in timestamp && typeof (timestamp as any).toDate === 'function') {
      return (timestamp as any).toDate();
    }
    if (typeof timestamp === 'object' && timestamp !== null && 'seconds' in timestamp && typeof (timestamp as any).seconds === 'number') {
      return new Date((timestamp as any).seconds * 1000);
    }
    if (timestamp instanceof Date) {
      return timestamp;
    }
    return new Date();
  };

  useEffect(() => {
    if (!pollId) {
      setError('Poll ID not found');
      setLoading(false);
      return;
    }

    const unsubscribePoll = PollService.subscribeToPoll(pollId, (pollData) => {
      if (!pollData) {
        setError('Poll not found');
        setLoading(false);
        return;
      }

      // Check if user has admin access
      if (!CreatorAuthService.isCreator(pollId, pollData.creatorId)) {
        setError('Access denied. You are not the creator of this poll.');
        setLoading(false);
        return;
      }

      setPoll(pollData);
      setLoading(false);
    });

    const unsubscribeVotes = PollService.subscribeToVotes(pollId, (votesData) => {
      setVotes(votesData);
    });

    // Subscribe to visitors
    const unsubscribeVisitors = SessionService.subscribeToPollVisitors(pollId, (visitorsData: PollVisitor[]) => {
      setVisitors(visitorsData);
    });

    return () => {
      unsubscribePoll();
      unsubscribeVotes();
      unsubscribeVisitors();
    };
  }, [pollId, user]);

  const toggleResultsVisibility = async () => {
    if (!poll) return;

    try {
      const newVisibility = !poll.settings.showResultsToVoters;
      await PollService.updatePollSettings(poll.id, {
        ...poll.settings,
        showResultsToVoters: newVisibility
      });
    } catch (error) {
      console.error('Failed to update poll settings:', error);
      alert('Failed to update settings');
    }
  };

  const getVoterStats = () => {
    if (!poll || !votes.length) return { total: 0, completed: 0, inProgress: 0, visitors: visitors.length, nonVoters: 0 };

    const uniqueVoters = new Set(votes.map(v => v.userId || v.voterName || 'anonymous'));
    const votersWithAllAnswers = new Set();

    uniqueVoters.forEach(voterId => {
      const voterVotes = votes.filter(v => 
        (v.userId || v.voterName || 'anonymous') === voterId
      );
      if (voterVotes.length === poll.questions.length) {
        votersWithAllAnswers.add(voterId);
      }
    });

    // Count visitors who haven't voted
    const nonVoters = visitors.filter(visitor => !visitor.hasVoted).length;

    return {
      total: uniqueVoters.size,
      completed: votersWithAllAnswers.size,
      inProgress: uniqueVoters.size - votersWithAllAnswers.size,
      visitors: visitors.length,
      nonVoters
    };
  };

  const copyVotingLink = () => {
    if (poll) {
      const votingUrl = `${window.location.origin}/poll/${poll.id}`;
      navigator.clipboard.writeText(votingUrl);
      alert('Voting link copied to clipboard!');
    }
  };

  const copyAdminLink = () => {
    if (poll) {
      const adminUrl = `${window.location.origin}/poll/${poll.id}/admin`;
      navigator.clipboard.writeText(adminUrl);
      alert('Admin link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          {error || 'Poll not found'}
        </h1>
        <p className="text-gray-600 mb-6">
          {error?.includes('Access denied') 
            ? 'You do not have permission to access this admin panel.'
            : 'The poll you\'re looking for doesn\'t exist or has been removed.'
          }
        </p>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  const voterStats = getVoterStats();
  const isExpired = PollService.isPollExpired(poll);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Settings className="w-6 h-6 text-blue-600" />
              <h1 className="text-3xl font-bold text-gray-900">Poll Admin Panel</h1>
            </div>
            <h2 className="text-xl text-gray-700 mb-2">{poll.title}</h2>
            {poll.description && (
              <p className="text-gray-600 mb-4">{poll.description}</p>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {votes.length} total votes
              </div>
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                Created {safeToDate(poll.createdAt).toLocaleDateString()}
              </div>
              {isExpired && (
                <span className="bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs">
                  Expired
                </span>
              )}
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={copyVotingLink}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Copy Voting Link
            </button>
            <button
              onClick={copyAdminLink}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Settings className="w-4 h-4 mr-1" />
              Copy Admin Link
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-5 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Voters</p>
              <p className="text-2xl font-bold text-gray-900">{voterStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-700">{voterStats.completed}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Clock className="w-8 h-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-yellow-700">{voterStats.inProgress}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <UserX className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Visitors</p>
              <p className="text-2xl font-bold text-orange-700">{voterStats.visitors}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex items-center">
            <Eye className="w-8 h-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Results Visible</p>
              <p className="text-lg font-bold text-purple-700">
                {poll.settings.showResultsToVoters ? 'Yes' : 'No'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Poll Controls</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Visibility Controls */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Result Visibility</h4>
            <button
              onClick={toggleResultsVisibility}
              className={`flex items-center px-4 py-2 rounded-md w-full justify-center ${
                poll.settings.showResultsToVoters
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {poll.settings.showResultsToVoters ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Hide Results from Voters
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Show Results to Voters
                </>
              )}
            </button>
          </div>

          {/* Time Controls */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Time Management</h4>
            <div className="space-y-2">
              {poll.settings.expiresAt ? (
                <div className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Expires:</span>
                    <span className={`font-medium ${isExpired ? 'text-red-600' : 'text-gray-900'}`}>
                      {safeToDate(poll.settings.expiresAt).toLocaleDateString()} at{' '}
                      {safeToDate(poll.settings.expiresAt).toLocaleTimeString()}
                    </span>
                  </div>
                  {!isExpired && (
                    <div className="mt-1 text-xs text-gray-500">
                      {Math.ceil((safeToDate(poll.settings.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days remaining
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-sm text-gray-600">No expiration date set</div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-md font-medium text-gray-900 mb-3">Navigation</h4>
          <div className="flex space-x-3">
            <button
              onClick={() => window.open(`/poll/${poll.id}`, '_blank')}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              View as Voter
            </button>
            <button
              onClick={() => navigate(`/poll/${poll.id}/results`)}
              className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              View Results
            </button>
          </div>
        </div>
      </div>

      {/* Active Visitors */}
      {visitors.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <UserX className="w-5 h-5 mr-2 text-orange-600" />
            Active Visitors ({visitors.length})
          </h3>
          <div className="space-y-2">
            {visitors.slice().sort((a, b) => {
              // Sort by: non-voters first, then by join time (newest first)
              if (a.hasVoted !== b.hasVoted) {
                return a.hasVoted ? 1 : -1;
              }
              return b.joinedAt.seconds - a.joinedAt.seconds;
            }).map((visitor) => (
              <div 
                key={visitor.sessionId} 
                className={`flex items-center justify-between p-3 rounded-lg ${
                  visitor.hasVoted ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'
                } border`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    visitor.hasVoted ? 'bg-green-500' : 'bg-orange-500'
                  }`} />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {visitor.voterName || 'Anonymous Visitor'}
                    </p>
                    <p className="text-xs text-gray-500">
                      Joined {safeToDate(visitor.joinedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    visitor.hasVoted 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-orange-100 text-orange-800'
                  }`}>
                    {visitor.hasVoted ? 'Voted' : 'Viewing'}
                  </span>
                  <span className="text-xs text-gray-400">
                    Last seen {safeToDate(visitor.lastSeen).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          {visitors.filter(v => !v.hasVoted).length > 0 && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-800">
                <strong>{visitors.filter(v => !v.hasVoted).length}</strong> visitor(s) haven't voted yet
              </p>
            </div>
          )}
        </div>
      )}

      {/* Results */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Poll Results</h3>
        <div className="space-y-6">
          {poll.questions.map((question, index) => {
            const questionAnswers = poll.answers.filter(a => a.questionId === question.id);
            const questionVotes = votes.filter(v => v.questionId === question.id);
            
            return (
              <div key={question.id} className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-md font-semibold mb-3">
                  {index + 1}. {question.text}
                </h4>
                
                <div className="space-y-2">
                  {questionAnswers.map((answer) => {
                    const answerVotes = questionVotes.filter(v => v.answerId === answer.id).length;
                    const percentage = questionVotes.length > 0 
                      ? (answerVotes / questionVotes.length) * 100 
                      : 0;
                    
                    return (
                      <div key={answer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                        <span className="flex-1">{answer.text}</span>
                        <div className="flex items-center space-x-3">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600 w-16 text-right">
                            {answerVotes} ({percentage.toFixed(1)}%)
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};