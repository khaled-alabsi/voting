import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { User as FirebaseUser } from 'firebase/auth';
import type { Poll, PollStats } from '../types';
import { PollService } from '../services/pollService';
import { PollStatistics } from '../components/Statistics/PollStatistics';
import { BarChart3, Calendar, Users, TrendingUp, Eye, Download, Trash2 } from 'lucide-react';

interface DashboardPageProps {
  user: FirebaseUser;
}

export const DashboardPage = ({ user }: DashboardPageProps) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null);
  const [pollStats, setPollStats] = useState<PollStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    const loadPolls = async () => {
      try {
        const userPolls = await PollService.getPollsByCreator(user.uid);
        setPolls(userPolls);
      } catch (error) {
        console.error('Error loading polls:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPolls();
  }, [user.uid]);

  const handleViewPollStats = async (poll: Poll) => {
    setSelectedPoll(poll);
    setLoadingStats(true);
    
    try {
      const stats = await PollService.calculatePollStats(poll.id);
      setPollStats(stats);
    } catch (error) {
      console.error('Error loading poll stats:', error);
      alert('Failed to load poll statistics');
    } finally {
      setLoadingStats(false);
    }
  };

  const handleExportPoll = async (poll: Poll) => {
    try {
      const exportData = await PollService.exportPollData(poll.id);
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${poll.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_export.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting poll:', error);
      alert('Failed to export poll data');
    }
  };

  const handleDeletePoll = async (poll: Poll) => {
    if (!confirm(`Are you sure you want to delete "${poll.title}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await PollService.deletePoll(poll.id);
      setPolls(polls.filter(p => p.id !== poll.id));
      if (selectedPoll?.id === poll.id) {
        setSelectedPoll(null);
        setPollStats(null);
      }
      alert('Poll deleted successfully');
    } catch (error) {
      console.error('Error deleting poll:', error);
      alert('Failed to delete poll');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Manage your polls and view analytics</p>
      </div>

      {selectedPoll && pollStats ? (
        // Poll Statistics View
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedPoll.title}</h2>
              <p className="text-gray-600">Detailed analytics and statistics</p>
            </div>
            <button
              onClick={() => {
                setSelectedPoll(null);
                setPollStats(null);
              }}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Back to Dashboard
            </button>
          </div>

          {loadingStats ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <PollStatistics poll={selectedPoll} stats={pollStats} />
          )}
        </div>
      ) : (
        // Dashboard Overview
        <>
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <BarChart3 className="w-8 h-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Polls</p>
                  <p className="text-2xl font-bold text-gray-900">{polls.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Polls</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {polls.filter(poll => poll.isActive).length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm border">
              <div className="flex items-center">
                <Calendar className="w-8 h-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-600">This Month</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {polls.filter(poll => {
                      const pollDate = poll.createdAt.toDate();
                      const now = new Date();
                      return pollDate.getMonth() === now.getMonth() && 
                             pollDate.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Polls List */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b">
              <h2 className="text-xl font-semibold text-gray-900">Your Polls</h2>
            </div>

            {polls.length === 0 ? (
              <div className="p-12 text-center">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No polls yet</h3>
                <p className="text-gray-600 mb-4">Create your first poll to get started</p>
                <Link
                  to="/create"
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Create Poll
                </Link>
              </div>
            ) : (
              <div className="divide-y">
                {polls.map((poll) => (
                  <div key={poll.id} className="p-6 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                          <Link to={`/poll/${poll.id}`} className="hover:text-blue-600">
                            {poll.title}
                          </Link>
                        </h3>
                        {poll.description && (
                          <p className="text-gray-600 text-sm mb-2">{poll.description}</p>
                        )}
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <span>{poll.questions.length} questions</span>
                          <span>{poll.totalVotes} votes</span>
                          <span>Created {poll.createdAt.toDate().toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          poll.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {poll.isActive ? 'Active' : 'Closed'}
                        </span>
                        
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewPollStats(poll)}
                            className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md"
                            title="View Statistics"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleExportPoll(poll)}
                            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded-md"
                            title="Export Data"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleDeletePoll(poll)}
                            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md"
                            title="Delete Poll"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};