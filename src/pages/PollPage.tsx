import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Clock, Share2, Users, CheckCircle } from 'lucide-react';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Poll, Vote, VotingSession } from '../types';
import { PollService } from '../services/pollService';
import { AuthService } from '../services/authService';
import { CountdownTimer } from '../components/UI/CountdownTimer';

interface PollPageProps {
  user: FirebaseUser | null;
}

export const PollPage = ({ user }: PollPageProps) => {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [votingSession, setVotingSession] = useState<VotingSession | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);

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
      setPoll(pollData);
      setLoading(false);
      if (!pollData) {
        setError('Poll not found');
      } else {
        // Check if poll is expired
        if (PollService.isPollExpired(pollData)) {
          setShowResults(true);
        }
      }
    });

    const unsubscribeVotes = PollService.subscribeToVotes(pollId, (votesData) => {
      setVotes(votesData);
    });

    return () => {
      unsubscribePoll();
      unsubscribeVotes();
    };
  }, [pollId]);

  const startVoting = async () => {
    if (!poll) return;

    // Check if authentication is required
    if (poll.settings.requireAuthentication && (!user || user.isAnonymous)) {
      alert('This poll requires authentication. Please sign in to vote.');
      return;
    }

    // Sign in anonymously if needed and allowed
    if (!user && poll.settings.allowAnonymousVoting) {
      try {
        await AuthService.signInAnonymously();
      } catch (error) {
        console.error('Failed to sign in anonymously:', error);
        alert('Failed to start voting session');
        return;
      }
    }

    setVotingSession({
      pollId: poll.id,
      startedAt: new Date(),
      currentQuestionIndex: 0,
      answers: {},
      timeSpent: {}
    });
  };

  const selectAnswer = (questionId: string, answerId: string) => {
    if (!votingSession) return;

    const questionStartTime = votingSession.timeSpent[questionId] || Date.now();
    const timeSpent = Date.now() - questionStartTime;

    setVotingSession(prev => prev ? {
      ...prev,
      answers: { ...prev.answers, [questionId]: answerId },
      timeSpent: { ...prev.timeSpent, [questionId]: timeSpent }
    } : null);
  };

  const submitVote = async (questionId: string, answerId: string) => {
    if (!poll || !user || submitting) return;

    setSubmitting(true);
    try {
      const timeToVote = votingSession?.timeSpent[questionId] || 0;
      await PollService.submitVote(poll.id, questionId, answerId, user.uid, timeToVote);
      
      // Remove this question from voting session
      if (votingSession) {
        const updatedAnswers = { ...votingSession.answers };
        delete updatedAnswers[questionId];
        setVotingSession({ ...votingSession, answers: updatedAnswers });
      }
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote');
    } finally {
      setSubmitting(false);
    }
  };

  const copyShareLink = () => {
    if (poll) {
      navigator.clipboard.writeText(poll.shareableLink);
      alert('Share link copied to clipboard!');
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
        <p className="text-gray-600">
          The poll you're looking for doesn't exist or has been removed.
        </p>
      </div>
    );
  }

  const hasVoted = (questionId: string) => {
    return user && votes.some(v => v.questionId === questionId && v.userId === user.uid);
  };

  const isExpired = PollService.isPollExpired(poll);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {/* Header */}
        <div className="border-b pb-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{poll.title}</h1>
              {poll.description && (
                <p className="text-gray-600 mb-4">{poll.description}</p>
              )}
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {votes.length} votes
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

              {/* Countdown Timer */}
              {poll.settings.expiresAt && !isExpired && (
                <div className="mt-4">
                  <CountdownTimer 
                    expiresAt={poll.settings.expiresAt} 
                    onExpire={() => setShowResults(true)}
                  />
                </div>
              )}
            </div>
            
            <button
              onClick={copyShareLink}
              className="flex items-center px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </button>
          </div>
        </div>

        {/* Voting Interface or Results */}
        {!votingSession && !showResults ? (
          <div className="text-center py-12">
            <h2 className="text-xl font-semibold mb-4">Ready to vote?</h2>
            <p className="text-gray-600 mb-6">
              This poll has {poll.questions.length} question{poll.questions.length !== 1 ? 's' : ''} for you to answer.
            </p>
            
            {isExpired ? (
              <div className="space-y-4">
                <p className="text-red-600">This poll has expired.</p>
                <button
                  onClick={() => setShowResults(true)}
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  View Results
                </button>
              </div>
            ) : (
              <button
                onClick={startVoting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Start Voting
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {poll.questions.map((question, index) => {
              const questionAnswers = poll.answers.filter(a => a.questionId === question.id);
              const questionVotes = votes.filter(v => v.questionId === question.id);
              const userHasVoted = hasVoted(question.id);
              const selectedAnswer = votingSession?.answers[question.id];
              
              return (
                <div key={question.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      {index + 1}. {question.text}
                    </h3>
                    {userHasVoted && (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  
                  {showResults || userHasVoted ? (
                    // Show results
                    <div className="space-y-3">
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
                  ) : (
                    // Show voting options
                    <div className="space-y-3">
                      {questionAnswers.map((answer) => (
                        <button
                          key={answer.id}
                          onClick={() => {
                            selectAnswer(question.id, answer.id);
                            submitVote(question.id, answer.id);
                          }}
                          disabled={submitting}
                          className={`w-full text-left p-3 rounded-md border transition-colors ${
                            selectedAnswer === answer.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {answer.text}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Results toggle */}
        {votes.length > 0 && !isExpired && (
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowResults(!showResults)}
              className="text-blue-600 hover:text-blue-700"
            >
              {showResults ? 'Hide Results' : 'Show Results'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};