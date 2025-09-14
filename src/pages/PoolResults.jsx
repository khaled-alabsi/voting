import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { ChartBarIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

function PoolResults() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { getPool, loading, currentPool } = useVoting();
  const [error, setError] = useState('');

  useEffect(() => {
    if (poolId) {
      loadPool();
    }
  }, [poolId]);

  const loadPool = async () => {
    try {
      await getPool(poolId);
    } catch (error) {
      setError('Pool not found or has expired');
    }
  };

  const getVotePercentage = (questionIndex, answerIndex) => {
    if (!currentPool?.votes) return 0;
    
    const questionVotes = currentPool.votes[`question_${questionIndex}`] || {};
    const answerVotes = questionVotes[`answer_${answerIndex}`] || 0;
    
    // Calculate total votes for this question
    const totalQuestionVotes = Object.values(questionVotes).reduce((sum, votes) => sum + votes, 0);
    
    if (totalQuestionVotes === 0) return 0;
    return Math.round((answerVotes / totalQuestionVotes) * 100);
  };

  const getVoteCount = (questionIndex, answerIndex) => {
    if (!currentPool?.votes) return 0;
    
    const questionVotes = currentPool.votes[`question_${questionIndex}`] || {};
    return questionVotes[`answer_${answerIndex}`] || 0;
  };

  const getTotalVotesForQuestion = (questionIndex) => {
    if (!currentPool?.votes) return 0;
    
    const questionVotes = currentPool.votes[`question_${questionIndex}`] || {};
    return Object.values(questionVotes).reduce((sum, votes) => sum + votes, 0);
  };

  const exportResults = () => {
    if (!currentPool) return;

    const results = {
      pool: {
        id: currentPool.id,
        title: currentPool.title,
        description: currentPool.description,
        createdAt: currentPool.createdAt,
        totalVotes: currentPool.totalVotes || 0
      },
      questions: currentPool.questions.map((question, questionIndex) => ({
        question: question.question,
        totalVotes: getTotalVotesForQuestion(questionIndex),
        answers: question.answers.map((answer, answerIndex) => ({
          answer,
          votes: getVoteCount(questionIndex, answerIndex),
          percentage: getVotePercentage(questionIndex, answerIndex)
        }))
      }))
    };

    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `voting-results-${currentPool.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
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
      <div className="max-w-6xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2, 3].map(j => (
                    <div key={j} className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !currentPool) {
    return (
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Results Not Available</h1>
        <p className="text-gray-600 mb-8">{error || 'The voting pool you\'re looking for doesn\'t exist.'}</p>
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

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentPool.title}</h1>
            {currentPool.description && (
              <p className="text-gray-600">{currentPool.description}</p>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={exportResults}
              className="inline-flex items-center space-x-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
            >
              <ArrowDownTrayIcon className="h-4 w-4" />
              <span>Export Results</span>
            </button>
            <Link
              to={`/manage/${poolId}`}
              className="inline-flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <span>Manage Pool</span>
            </Link>
          </div>
        </div>

        <div className="flex items-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <ChartBarIcon className="h-4 w-4" />
            <span>Total Votes: {currentPool.totalVotes || 0}</span>
          </div>
          {timeRemaining && (
            <div className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-xs ${
              timeRemaining === 'Expired' 
                ? 'bg-red-50 text-red-800' 
                : 'bg-yellow-50 text-yellow-800'
            }`}>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{timeRemaining}</span>
            </div>
          )}
          {timeRemaining !== 'Expired' && (
            <Link
              to={`/vote/${poolId}`}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Vote Now →
            </Link>
          )}
        </div>
      </div>

      <div className="space-y-8">
        {currentPool.questions.map((question, questionIndex) => {
          const totalQuestionVotes = getTotalVotesForQuestion(questionIndex);
          
          return (
            <div key={questionIndex} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {question.question}
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                {totalQuestionVotes} {totalQuestionVotes === 1 ? 'vote' : 'votes'}
              </p>

              <div className="space-y-4">
                {question.answers.map((answer, answerIndex) => {
                  const voteCount = getVoteCount(questionIndex, answerIndex);
                  const percentage = getVotePercentage(questionIndex, answerIndex);
                  const isWinning = totalQuestionVotes > 0 && voteCount === Math.max(
                    ...question.answers.map((_, idx) => getVoteCount(questionIndex, idx))
                  );

                  return (
                    <div key={answerIndex} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-medium ${isWinning ? 'text-green-700' : 'text-gray-700'}`}>
                          {answer}
                        </span>
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">
                            {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                          </span>
                          <span className={`text-sm font-medium ${isWinning ? 'text-green-700' : 'text-gray-700'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-500 ${
                            isWinning ? 'bg-green-500' : 'bg-blue-500'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {currentPool.questions.length === 0 && (
        <div className="text-center py-12">
          <ChartBarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No questions have been added to this pool yet.</p>
        </div>
      )}
    </div>
  );
}

export default PoolResults;