import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useVoting } from '../context/VotingContext';
import { 
  TrashIcon, 
  LinkIcon, 
  EyeIcon, 
  ChartBarIcon,
  ClockIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

function ManagePool() {
  const { poolId } = useParams();
  const navigate = useNavigate();
  const { getPool, updatePool, deletePool, loading, currentPool } = useVoting();
  const [error, setError] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [editingExpiry, setEditingExpiry] = useState(false);
  const [newExpiryDate, setNewExpiryDate] = useState('');
  const [newExpiryTime, setNewExpiryTime] = useState('');

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

  const handleDeletePool = async () => {
    try {
      await deletePool(poolId);
      navigate('/');
    } catch (error) {
      setError(error.message);
    }
  };

  const copyShareLink = async () => {
    const shareUrl = `${window.location.origin}/vote/${poolId}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateExpiry = async () => {
    if (!newExpiryDate || !newExpiryTime) {
      setError('Please provide both date and time');
      return;
    }

    try {
      const expiresAt = new Date(`${newExpiryDate}T${newExpiryTime}`);
      await updatePool(poolId, { 
        expiresAt,
        autoExpiry: true 
      });
      setEditingExpiry(false);
      setNewExpiryDate('');
      setNewExpiryTime('');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleToggleActive = async () => {
    try {
      await updatePool(poolId, { 
        isActive: !currentPool.isActive 
      });
    } catch (error) {
      setError(error.message);
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

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="grid md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="bg-white p-6 rounded-lg border">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Pool Not Found</h1>
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
  const shareUrl = `${window.location.origin}/vote/${poolId}`;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage Pool</h1>
        <h2 className="text-xl text-gray-700 mb-4">{currentPool.title}</h2>
        {currentPool.description && (
          <p className="text-gray-600">{currentPool.description}</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <button
          onClick={copyShareLink}
          className="flex items-center space-x-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <LinkIcon className="h-5 w-5 text-blue-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">
              {copied ? 'Copied!' : 'Copy Share Link'}
            </div>
            <div className="text-sm text-gray-500">Share with voters</div>
          </div>
        </button>

        <Link
          to={`/vote/${poolId}`}
          className="flex items-center space-x-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <EyeIcon className="h-5 w-5 text-green-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Preview Vote</div>
            <div className="text-sm text-gray-500">See voter experience</div>
          </div>
        </Link>

        <Link
          to={`/results/${poolId}`}
          className="flex items-center space-x-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ChartBarIcon className="h-5 w-5 text-purple-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">View Results</div>
            <div className="text-sm text-gray-500">Analytics & charts</div>
          </div>
        </Link>

        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="flex items-center space-x-2 p-4 bg-white border border-gray-200 rounded-lg hover:bg-red-50 transition-colors"
        >
          <TrashIcon className="h-5 w-5 text-red-600" />
          <div className="text-left">
            <div className="font-medium text-gray-900">Delete Pool</div>
            <div className="text-sm text-gray-500">Permanent removal</div>
          </div>
        </button>
      </div>

      {/* Pool Status */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pool Status</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div>
            <div className="text-sm text-gray-500 mb-1">Status</div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                currentPool.isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {currentPool.isActive ? 'Active' : 'Inactive'}
              </span>
              <button
                onClick={handleToggleActive}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {currentPool.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Total Votes</div>
            <div className="text-xl font-semibold text-gray-900">
              {currentPool.totalVotes || 0}
            </div>
          </div>

          <div>
            <div className="text-sm text-gray-500 mb-1">Expiry</div>
            <div className="flex items-center space-x-2">
              {timeRemaining ? (
                <span className={`text-sm font-medium ${
                  timeRemaining === 'Expired' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {timeRemaining}
                </span>
              ) : (
                <span className="text-sm text-gray-600">No expiry set</span>
              )}
              <button
                onClick={() => setEditingExpiry(true)}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                <PencilIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Expiry Modal */}
      {editingExpiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Update Expiry</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Date
                </label>
                <input
                  type="date"
                  value={newExpiryDate}
                  onChange={(e) => setNewExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Expiry Time
                </label>
                <input
                  type="time"
                  value={newExpiryTime}
                  onChange={(e) => setNewExpiryTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-6">
              <button
                onClick={() => {
                  setEditingExpiry(false);
                  setNewExpiryDate('');
                  setNewExpiryTime('');
                }}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateExpiry}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Update Expiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share URL */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Share URL</h3>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={shareUrl}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-700"
          />
          <button
            onClick={copyShareLink}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Questions Overview */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Questions Overview</h3>
        
        <div className="space-y-6">
          {currentPool.questions.map((question, questionIndex) => {
            const totalQuestionVotes = getTotalVotesForQuestion(questionIndex);
            
            return (
              <div key={questionIndex} className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Q{questionIndex + 1}: {question.question}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {totalQuestionVotes} {totalQuestionVotes === 1 ? 'vote' : 'votes'}
                </p>
                
                <div className="space-y-2">
                  {question.answers.map((answer, answerIndex) => {
                    const voteCount = getVoteCount(questionIndex, answerIndex);
                    
                    return (
                      <div key={answerIndex} className="flex items-center justify-between text-sm">
                        <span className="text-gray-700">{answer}</span>
                        <span className="text-gray-600">
                          {voteCount} {voteCount === 1 ? 'vote' : 'votes'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Pool</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this voting pool? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleDeletePool}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Delete Pool
              </button>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

export default ManagePool;