import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import type { PollStats, Poll } from '../../types';

interface PollStatisticsProps {
  poll: Poll;
  stats: PollStats;
}

const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16'];

export const PollStatistics = ({ poll, stats }: PollStatisticsProps) => {
  // Prepare data for charts
  const questionStatsData = stats.questionStats.map((qs, index) => ({
    question: `Q${index + 1}`,
    totalVotes: qs.totalVotes,
    avgTime: Math.round(qs.averageTimeToVote / 1000) // Convert to seconds
  }));

  const getAnswerDistributionData = (questionId: string) => {
    const questionStat = stats.questionStats.find(qs => qs.questionId === questionId);
    if (!questionStat) return [];

    return Object.entries(questionStat.answerDistribution).map(([answerId, count]) => {
      const answer = poll.answers.find(a => a.id === answerId);
      return {
        name: answer?.text || 'Unknown',
        value: count,
        percentage: stats.totalVotes > 0 ? ((count / stats.totalVotes) * 100).toFixed(1) : '0'
      };
    });
  };

  const votingPatternData = stats.votingPattern
    .reduce((acc, pattern) => {
      const timeLabel = new Date(pattern.timestamp.toMillis()).toLocaleTimeString();
      const existingEntry = acc.find(entry => entry.time === timeLabel);
      
      if (existingEntry) {
        existingEntry.votes = pattern.cumulativeVotes;
      } else {
        acc.push({
          time: timeLabel,
          votes: pattern.cumulativeVotes
        });
      }
      return acc;
    }, [] as { time: string; votes: number }[])
    .slice(-20); // Show last 20 data points

  const timeToVoteData = Object.entries(stats.timeToVoteByOption)
    .map(([answerId, times]) => {
      const answer = poll.answers.find(a => a.id === answerId);
      const avgTime = times.length > 0 ? times.reduce((sum, time) => sum + time, 0) / times.length : 0;
      return {
        answer: answer?.text || 'Unknown',
        avgTime: Math.round(avgTime / 1000), // Convert to seconds
        count: times.length
      };
    })
    .filter(item => item.count > 0)
    .sort((a, b) => b.avgTime - a.avgTime);

  return (
    <div className="space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Total Votes</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalVotes}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Unique Voters</h3>
          <p className="text-3xl font-bold text-green-600">{stats.uniqueVoters}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Avg. Time to Vote</h3>
          <p className="text-3xl font-bold text-purple-600">
            {Math.round(stats.averageTimeToVote / 1000)}s
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-sm font-medium text-gray-600">Questions</h3>
          <p className="text-3xl font-bold text-orange-600">{poll.questions.length}</p>
        </div>
      </div>

      {/* Voting Pattern Over Time */}
      {votingPatternData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Voting Pattern Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={votingPatternData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="votes" stroke="#3B82F6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Question Statistics */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Votes and Response Time by Question</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={questionStatsData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="question" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Bar yAxisId="left" dataKey="totalVotes" fill="#3B82F6" name="Total Votes" />
            <Bar yAxisId="right" dataKey="avgTime" fill="#EF4444" name="Avg Time (seconds)" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Time to Vote by Answer */}
      {timeToVoteData.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Average Decision Time by Answer</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={timeToVoteData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="answer" type="category" width={150} />
              <Tooltip formatter={(value: number) => [`${value}s`, 'Avg Time']} />
              <Bar dataKey="avgTime" fill="#8B5CF6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Answer Distribution for each Question */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {poll.questions.map((question, index) => {
          const answerData = getAnswerDistributionData(question.id);
          if (answerData.length === 0) return null;

          return (
            <div key={question.id} className="bg-white p-6 rounded-lg shadow-sm border">
              <h3 className="text-lg font-semibold mb-4">
                Q{index + 1}: {question.text}
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={answerData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {answerData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Answer breakdown */}
              <div className="mt-4 space-y-2">
                {answerData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span>{item.name}</span>
                    </div>
                    <span className="font-medium">{item.value} votes ({item.percentage}%)</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};