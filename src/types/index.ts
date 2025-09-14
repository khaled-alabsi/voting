import { Timestamp } from 'firebase/firestore';

export interface User {
  id: string;
  email?: string;
  displayName?: string;
  isAnonymous: boolean;
  createdAt: Timestamp;
}

export interface Question {
  id: string;
  text: string;
  order: number;
  allowNewOptions: boolean;
  required: boolean;
}

export interface Answer {
  id: string;
  questionId: string;
  text: string;
  order: number;
  addedByUser?: string; // User ID who added this option
  addedAt?: Timestamp;
}

export interface Vote {
  id: string;
  pollId: string;
  questionId: string;
  answerId: string;
  userId?: string; // Optional for anonymous votes
  votedAt: Timestamp;
  timeToVote?: number; // Time in milliseconds from poll start to vote
}

export interface PollSettings {
  allowAnonymousVoting: boolean;
  requireAuthentication: boolean;
  allowNewQuestions: boolean;
  allowNewOptions: boolean; // Global setting, can be overridden per question
  showResultsToVoters: boolean; // Whether voters can see results
  expiresAt?: Timestamp;
  autoDelete: boolean;
  autoDeleteAfterDays?: number;
}

export interface Poll {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  settings: PollSettings;
  questions: Question[];
  answers: Answer[];
  isActive: boolean;
  shareableLink: string;
  totalVotes: number;
  uniqueVoters: number;
}

export interface PollStats {
  pollId: string;
  totalVotes: number;
  uniqueVoters: number;
  averageTimeToVote: number;
  questionStats: QuestionStats[];
  timeToVoteByOption: { [answerId: string]: number[] };
  votingPattern: VotingPattern[];
}

export interface QuestionStats {
  questionId: string;
  totalVotes: number;
  averageTimeToVote: number;
  answerDistribution: { [answerId: string]: number };
}

export interface VotingPattern {
  timestamp: Timestamp;
  cumulativeVotes: number;
  questionId: string;
  answerId: string;
}

export interface PollFormData {
  title: string;
  description: string;
  questions: QuestionFormData[];
  settings: PollSettings;
}

export interface QuestionFormData {
  text: string;
  answers: string[];
  allowNewOptions: boolean;
  required: boolean;
}

// Export/Import types
export interface ExportData {
  poll: Poll;
  votes: Vote[];
  stats: PollStats;
  exportedAt: Timestamp;
  format: 'json' | 'csv';
}

// UI State types
export interface VotingSession {
  pollId: string;
  startedAt: Date;
  currentQuestionIndex: number;
  answers: { [questionId: string]: string };
  timeSpent: { [questionId: string]: number };
}

export interface NotificationState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  isVisible: boolean;
  duration?: number;
}