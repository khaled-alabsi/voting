import {
  collection,
  doc,
  setDoc,
  updateDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import type { Poll, Vote, Question, Answer, PollFormData, PollStats, ExportData } from '../types';

// Collections
const POLLS_COLLECTION = 'polls';
const VOTES_COLLECTION = 'votes';

export class PollService {
  // Create a new poll
  static async createPoll(pollData: PollFormData, creatorId: string): Promise<string> {
    const pollId = uuidv4();
    const now = Timestamp.now();
    
    const questions: Question[] = pollData.questions.map((question, index) => ({
      id: `q${index + 1}`,
      text: question.text,
      order: index,
      allowNewOptions: question.allowNewOptions,
      required: question.required
    }));

    const answers: Answer[] = [];
    pollData.questions.forEach((question, questionIndex) => {
      question.answers.forEach((answerText, answerIndex) => {
        answers.push({
          id: `a${questionIndex + 1}_${answerIndex + 1}`,
          questionId: `q${questionIndex + 1}`,
          text: answerText,
          order: answerIndex
        });
      });
    });

    const poll: Poll = {
      id: pollId,
      title: pollData.title,
      description: pollData.description,
      creatorId,
      createdAt: now,
      updatedAt: now,
      settings: pollData.settings,
      questions,
      answers,
      isActive: true,
      shareableLink: `${window.location.origin}/poll/${pollId}`,
      totalVotes: 0,
      uniqueVoters: 0
    };

    await setDoc(doc(db, POLLS_COLLECTION, pollId), poll);
    return pollId;
  }

  // Get a poll by ID
  static async getPoll(pollId: string): Promise<Poll | null> {
    const pollDoc = await getDoc(doc(db, POLLS_COLLECTION, pollId));
    if (pollDoc.exists()) {
      return pollDoc.data() as Poll;
    }
    return null;
  }

  // Get all polls (for admin/dashboard)
  static async getAllPolls(): Promise<Poll[]> {
    const querySnapshot = await getDocs(collection(db, POLLS_COLLECTION));
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Poll));
  }

  // Get polls created by a user
  static async getPollsByUser(userId: string): Promise<Poll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where('creatorId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Poll));
  }

  // Submit a vote
  static async submitVote(
    pollId: string,
    questionId: string,
    answerId: string,
    userId?: string
  ): Promise<void> {
    const voteId = uuidv4();
    const vote: Vote = {
      id: voteId,
      pollId,
      questionId,
      answerId,
      userId,
      votedAt: Timestamp.now()
    };

    const batch = writeBatch(db);
    
    // Add the vote
    batch.set(doc(db, VOTES_COLLECTION, voteId), vote);
    
    // Update poll stats
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    batch.update(pollRef, {
      totalVotes: increment(1),
      updatedAt: Timestamp.now()
    });

    await batch.commit();
  }

  // Get votes for a poll
  static async getVotesForPoll(pollId: string): Promise<Vote[]> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('votedAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    const votes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vote));
    
    // Sort in memory instead of at database level
    return votes.sort((a, b) => {
      const aTime = a.votedAt?.seconds || 0;
      const bTime = b.votedAt?.seconds || 0;
      return aTime - bTime;
    });
  }

  // Subscribe to votes for a poll (real-time)
  static subscribeToVotes(pollId: string, callback: (votes: Vote[]) => void): () => void {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId)
      // Temporarily removed orderBy to avoid index requirement
      // orderBy('votedAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const votes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vote));
      
      // Sort in memory instead of at database level
      const sortedVotes = votes.sort((a, b) => {
        const aTime = a.votedAt?.seconds || 0;
        const bTime = b.votedAt?.seconds || 0;
        return aTime - bTime;
      });
      
      callback(sortedVotes);
    });
  }

  // Subscribe to a poll (real-time)
  static subscribeToPoll(pollId: string, callback: (poll: Poll | null) => void): () => void {
    return onSnapshot(doc(db, POLLS_COLLECTION, pollId), (doc) => {
      if (doc.exists()) {
        callback(doc.data() as Poll);
      } else {
        callback(null);
      }
    });
  }

  // Check if user has already voted
  static async hasUserVoted(pollId: string, userId: string): Promise<boolean> {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      where('userId', '==', userId)
    );
    
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  }

  // Get poll statistics
  static async getPollStats(pollId: string): Promise<PollStats> {
    const votes = await this.getVotesForPoll(pollId);
    const poll = await this.getPoll(pollId);
    
    if (!poll) {
      throw new Error('Poll not found');
    }

    const questionStats = poll.questions.map(question => {
      const questionVotes = votes.filter(vote => vote.questionId === question.id);
      const answerDistribution: { [answerId: string]: number } = {};
      
      questionVotes.forEach(vote => {
        answerDistribution[vote.answerId] = (answerDistribution[vote.answerId] || 0) + 1;
      });

      return {
        questionId: question.id,
        totalVotes: questionVotes.length,
        averageTimeToVote: 0, // TODO: Calculate based on vote timing
        answerDistribution
      };
    });

    const timeToVoteByOption: { [answerId: string]: number[] } = {};
    // TODO: Calculate time to vote data

    const votingPattern = votes.map(vote => ({
      timestamp: vote.votedAt,
      cumulativeVotes: 1, // TODO: Calculate cumulative votes
      questionId: vote.questionId,
      answerId: vote.answerId
    }));

    const stats: PollStats = {
      pollId,
      totalVotes: votes.length,
      uniqueVoters: new Set(votes.map(vote => vote.userId).filter(Boolean)).size,
      averageTimeToVote: 0, // TODO: Calculate average
      questionStats,
      timeToVoteByOption,
      votingPattern
    };

    return stats;
  }

  // Delete a poll and all its votes
  static async deletePoll(pollId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete the poll
    batch.delete(doc(db, POLLS_COLLECTION, pollId));
    
    // Delete all votes for this poll
    const votes = await this.getVotesForPoll(pollId);
    votes.forEach(vote => {
      batch.delete(doc(db, VOTES_COLLECTION, vote.id));
    });

    await batch.commit();
  }

  // Update poll
  static async updatePoll(pollId: string, updates: Partial<Poll>): Promise<void> {
    await updateDoc(doc(db, POLLS_COLLECTION, pollId), updates);
  }

  // Export poll data
  static async exportPollData(pollId: string): Promise<ExportData> {
    const poll = await this.getPoll(pollId);
    const votes = await this.getVotesForPoll(pollId);
    const stats = await this.getPollStats(pollId);

    if (!poll) {
      throw new Error('Poll not found');
    }

    return {
      poll,
      votes,
      stats,
      exportedAt: Timestamp.now(),
      format: 'json'
    };
  }

  // Get public polls
  static async getPublicPolls(): Promise<Poll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where('isActive', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Poll));
  }

  // Get polls created by a user (alias for getPollsByUser)
  static async getPollsByCreator(userId: string): Promise<Poll[]> {
    return this.getPollsByUser(userId);
  }

  // Calculate poll statistics (alias for getPollStats)
  static async calculatePollStats(pollId: string): Promise<PollStats> {
    return this.getPollStats(pollId);
  }

  // Check if poll is expired
  static isPollExpired(poll: Poll): boolean {
    if (!poll.settings.expiresAt) return false;
    return new Date() > poll.settings.expiresAt.toDate();
  }

  // Search polls
  static async searchPolls(searchTerm: string): Promise<Poll[]> {
    // Note: This is a simple implementation. For better search,
    // consider using Algolia or similar search service
    const polls = await this.getPublicPolls();
    
    return polls.filter(poll => 
      poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      poll.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }
}