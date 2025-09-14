import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';

function VotePool() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { getPool, submitVote, loading, currentPool } = useVoting();
  const [votes, setVotes] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [hasVoted, setHasVoted] = useState(false);

  useEffect(() => {
    if (poolId) {
      loadPool();
    }
  }, [poolId]);

  const loadPool = async () => {
    try {
      await getPool(poolId);
    } catch (error) {
      setSubmitError('Pool not found or has expired');
    }
  };

  const handleVoteChange = (questionIndex, answerIndex) => {
    setVotes(prev => ({
      ...prev,
      [questionIndex]: answerIndex
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError('');

    if (!currentPool) return;

    // Check if user has answered all questions
    const unansweredQuestions = currentPool.questions.filter((_, index) => votes[index] === undefined);
    if (unansweredQuestions.length > 0) {
      setSubmitError('Please answer all questions before submitting');
      return;
    }

    try {
      // Submit each vote
      for (const [questionIndex, answerIndex] of Object.entries(votes)) {
        await submitVote(poolId, parseInt(questionIndex), answerIndex, currentPool.allowAnonymous);
      }
      setHasVoted(true);
    } catch (error) {
      setSubmitError(error.message);
    }
  };

  const getTimeRemaining = () => {
    if (!currentPool?.expiresAt) return null;
    
    const now = new Date();
    const expiry = new Date(currentPool.expiresAt.seconds * 1000);
    const timeLeft = expiry - now;
    
    if (timeLeft <= 0) return 'Expired';
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    return `${minutes}m remaining`;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="h-4 bg-gray-200 rounded w-1/4"></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!currentPool) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool Not Found</h1>
        <p className="text-gray-600 mb-8">The voting pool you're looking for doesn't exist or has been removed.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
        >
          Go Home
        </button>
      </div>
    );
  }

  const timeRemaining = getTimeRemaining();
  const isExpired = timeRemaining === 'Expired';

  if (hasVoted) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Vote Submitted!</h1>
          <p className="text-gray-600 mb-6">Thank you for participating in this voting pool.</p>
          <div className="space-x-4">
            <button
              onClick={() => navigate(`/results/${poolId}`)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              View Results
            </button>
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-800"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isExpired) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Voting Closed</h1>
        <p className="text-gray-600 mb-8">This voting pool has expired and is no longer accepting votes.</p>
        <button
          onClick={() => navigate(`/results/${poolId}`)}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 mr-4"
        >
          View Results
        </button>
        <button
          onClick={() => navigate('/')}
          className="text-gray-600 hover:text-gray-800"
        >
          Go Home
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentPool.title}</h1>
        {currentPool.description && (
          <p className="text-gray-600 mb-4">{currentPool.description}</p>
        )}
        {timeRemaining && (
          <div className="inline-flex items-center space-x-2 bg-yellow-50 text-yellow-800 px-3 py-1 rounded-full text-sm">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{timeRemaining}</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {currentPool.questions.map((question, questionIndex) => (
          <div key={questionIndex} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {question.question}
            </h2>
            <div className="space-y-3">
              {question.answers.map((answer, answerIndex) => (
                <label key={answerIndex} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`question_${questionIndex}`}
                    value={answerIndex}
                    checked={votes[questionIndex] === answerIndex}
                    onChange={() => handleVoteChange(questionIndex, answerIndex)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="text-gray-700">{answer}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{submitError}</p>
          </div>
        )}

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading || Object.keys(votes).length !== currentPool.questions.length}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Submitting...' : 'Submit Vote'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default VotePool;