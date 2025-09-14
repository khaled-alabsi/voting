import {
  collection,
  doc,
  addDoc,
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
    
    // Process questions and answers
    const questions: Question[] = pollData.questions.map((q, index) => ({
      id: uuidv4(),
      text: q.text,
      order: index,
      allowNewOptions: q.allowNewOptions,
      required: q.required
    }));

    const answers: Answer[] = [];
    pollData.questions.forEach((q, qIndex) => {
      q.answers.forEach((answerText, aIndex) => {
        answers.push({
          id: uuidv4(),
          questionId: questions[qIndex].id,
          text: answerText,
          order: aIndex
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

    await addDoc(collection(db, POLLS_COLLECTION), poll);
    return pollId;
  }

  // Get poll by ID
  static async getPollById(pollId: string): Promise<Poll | null> {
    const pollDoc = await getDoc(doc(db, POLLS_COLLECTION, pollId));
    if (pollDoc.exists()) {
      return { ...pollDoc.data(), id: pollDoc.id } as Poll;
    }
    return null;
  }

  // Get polls by creator
  static async getPollsByCreator(creatorId: string): Promise<Poll[]> {
    const q = query(
      collection(db, POLLS_COLLECTION),
      where('creatorId', '==', creatorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Poll));
  }

  // Subscribe to poll changes
  static subscribeToPoll(pollId: string, callback: (poll: Poll | null) => void) {
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    return onSnapshot(pollRef, (doc) => {
      if (doc.exists()) {
        callback({ ...doc.data(), id: doc.id } as Poll);
      } else {
        callback(null);
      }
    });
  }

  // Update poll
  static async updatePoll(pollId: string, updates: Partial<Poll>): Promise<void> {
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    await updateDoc(pollRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  // Delete poll
  static async deletePoll(pollId: string): Promise<void> {
    const batch = writeBatch(db);
    
    // Delete the poll
    const pollRef = doc(db, POLLS_COLLECTION, pollId);
    batch.delete(pollRef);
    
    // Delete all votes for this poll
    const votesQuery = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId)
    );
    const votesSnapshot = await getDocs(votesQuery);
    votesSnapshot.docs.forEach(voteDoc => {
      batch.delete(voteDoc.ref);
    });
    
    await batch.commit();
  }

  // Add new question to poll
  static async addQuestion(pollId: string, questionText: string): Promise<void> {
    const poll = await this.getPollById(pollId);
    if (!poll) throw new Error('Poll not found');

    const newQuestion: Question = {
      id: uuidv4(),
      text: questionText,
      order: poll.questions.length,
      allowNewOptions: poll.settings.allowNewOptions,
      required: false
    };

    const updatedQuestions = [...poll.questions, newQuestion];
    await this.updatePoll(pollId, { questions: updatedQuestions });
  }

  // Add new answer option to question
  static async addAnswerOption(pollId: string, questionId: string, answerText: string, userId?: string): Promise<void> {
    const poll = await this.getPollById(pollId);
    if (!poll) throw new Error('Poll not found');

    const questionAnswers = poll.answers.filter(a => a.questionId === questionId);
    const newAnswer: Answer = {
      id: uuidv4(),
      questionId,
      text: answerText,
      order: questionAnswers.length,
      addedByUser: userId,
      addedAt: Timestamp.now()
    };

    const updatedAnswers = [...poll.answers, newAnswer];
    await this.updatePoll(pollId, { answers: updatedAnswers });
  }

  // Submit vote
  static async submitVote(
    pollId: string,
    questionId: string,
    answerId: string,
    userId?: string,
    timeToVote?: number
  ): Promise<void> {
    const vote: Vote = {
      id: uuidv4(),
      pollId,
      questionId,
      answerId,
      userId,
      votedAt: Timestamp.now(),
      timeToVote
    };

    const batch = writeBatch(db);
    
    // Add the vote
    const voteRef = doc(collection(db, VOTES_COLLECTION));
    batch.set(voteRef, vote);
    
    // Update poll statistics
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
      where('pollId', '==', pollId),
      orderBy('votedAt', 'asc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vote));
  }

  // Subscribe to votes for a poll
  static subscribeToVotes(pollId: string, callback: (votes: Vote[]) => void) {
    const q = query(
      collection(db, VOTES_COLLECTION),
      where('pollId', '==', pollId),
      orderBy('votedAt', 'asc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const votes = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Vote));
      callback(votes);
    });
  }

  // Calculate poll statistics
  static async calculatePollStats(pollId: string): Promise<PollStats> {
    const [poll, votes] = await Promise.all([
      this.getPollById(pollId),
      this.getVotesForPoll(pollId)
    ]);

    if (!poll) throw new Error('Poll not found');

    const uniqueVoters = new Set(votes.filter(v => v.userId).map(v => v.userId)).size;
    const anonymousVotes = votes.filter(v => !v.userId).length;
    const totalUniqueVoters = uniqueVoters + anonymousVotes;

    const timeToVoteValues = votes.filter(v => v.timeToVote).map(v => v.timeToVote!);
    const averageTimeToVote = timeToVoteValues.length > 0 
      ? timeToVoteValues.reduce((sum, time) => sum + time, 0) / timeToVoteValues.length 
      : 0;

    // Calculate question statistics
    const questionStats = poll.questions.map(question => {
      const questionVotes = votes.filter(v => v.questionId === question.id);
      const questionTimeValues = questionVotes.filter(v => v.timeToVote).map(v => v.timeToVote!);
      const questionAvgTime = questionTimeValues.length > 0
        ? questionTimeValues.reduce((sum, time) => sum + time, 0) / questionTimeValues.length
        : 0;

      const answerDistribution: { [answerId: string]: number } = {};
      poll.answers
        .filter(a => a.questionId === question.id)
        .forEach(answer => {
          answerDistribution[answer.id] = questionVotes.filter(v => v.answerId === answer.id).length;
        });

      return {
        questionId: question.id,
        totalVotes: questionVotes.length,
        averageTimeToVote: questionAvgTime,
        answerDistribution
      };
    });

    // Calculate time to vote by option
    const timeToVoteByOption: { [answerId: string]: number[] } = {};
    poll.answers.forEach(answer => {
      const answerVotes = votes.filter(v => v.answerId === answer.id && v.timeToVote);
      timeToVoteByOption[answer.id] = answerVotes.map(v => v.timeToVote!);
    });

    // Calculate voting pattern over time
    const votingPattern = votes.map(vote => ({
      timestamp: vote.votedAt,
      cumulativeVotes: votes.filter(v => v.votedAt.toMillis() <= vote.votedAt.toMillis()).length,
      questionId: vote.questionId,
      answerId: vote.answerId
    }));

    return {
      pollId,
      totalVotes: votes.length,
      uniqueVoters: totalUniqueVoters,
      averageTimeToVote,
      questionStats,
      timeToVoteByOption,
      votingPattern
    };
  }

  // Check if poll is expired
  static isPollExpired(poll: Poll): boolean {
    if (!poll.settings.expiresAt) return false;
    return Timestamp.now().toMillis() > poll.settings.expiresAt.toMillis();
  }

  // Export poll data
  static async exportPollData(pollId: string): Promise<ExportData> {
    const [poll, votes, stats] = await Promise.all([
      this.getPollById(pollId),
      this.getVotesForPoll(pollId),
      this.calculatePollStats(pollId)
    ]);

    if (!poll) throw new Error('Poll not found');

    return {
      poll,
      votes,
      stats,
      exportedAt: Timestamp.now(),
      format: 'json'
    };
  }
}