import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Users, Clock, BarChart3, Settings, ExternalLink } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Poll, Vote } from '../types';
import { PollService } from '../services/pollService';
import { CreatorAuthService } from '../services/creatorAuthService';

interface PollAdminPageProps {
  user: FirebaseUser | null;
}

export const PollAdminPage = ({ user }: PollAdminPageProps) => {
  const { pollId } = useParams<{ pollId: string }>();
  const navigate = useNavigate();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
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

    return () => {
      unsubscribePoll();
      unsubscribeVotes();
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
    if (!poll || !votes.length) return { total: 0, completed: 0, inProgress: 0 };

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

    return {
      total: uniqueVoters.size,
      completed: votersWithAllAnswers.size,
      inProgress: uniqueVoters.size - votersWithAllAnswers.size
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
      <div className="grid md:grid-cols-4 gap-4">
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
        <div className="flex space-x-4">
          <button
            onClick={toggleResultsVisibility}
            className={`flex items-center px-4 py-2 rounded-md ${
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
          
          <button
            onClick={() => navigate(`/poll/${poll.id}`)}
            className="flex items-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View as Voter
          </button>
        </div>
      </div>

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