import { AuthService } from './authService';

export interface CreatorSession {
  pollId: string;
  creatorId: string;
  isActive: boolean;
  createdAt: number;
}

export class CreatorAuthService {
  private static STORAGE_KEY = 'voting_creator_sessions';
  private static SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

  /**
   * Create a creator session for a poll
   */
  static createCreatorSession(pollId: string, creatorId: string): void {
    const sessions = this.getCreatorSessions();
    
    const session: CreatorSession = {
      pollId,
      creatorId,
      isActive: true,
      createdAt: Date.now()
    };

    // Remove existing session for this poll if any
    const filteredSessions = sessions.filter(s => s.pollId !== pollId);
    filteredSessions.push(session);

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
  }

  /**
   * Check if current user is the creator of a poll
   */
  static isCreator(pollId: string, creatorId?: string): boolean {
    const sessions = this.getCreatorSessions();
    const currentUser = AuthService.getCurrentUser();
    
    // Check by current user ID if available
    if (currentUser && creatorId) {
      return currentUser.uid === creatorId;
    }

    // Check by stored session
    const session = sessions.find(s => 
      s.pollId === pollId && 
      s.isActive && 
      this.isSessionValid(s)
    );

    if (!session) return false;

    // If we have a current user, verify it matches the session
    if (currentUser) {
      return currentUser.uid === session.creatorId;
    }

    // For anonymous sessions, we trust the local storage
    return true;
  }

  /**
   * Get admin URL for a poll
   */
  static getAdminUrl(pollId: string): string {
    return `/poll/${pollId}/admin`;
  }

  /**
   * Get voter URL for a poll  
   */
  static getVoterUrl(pollId: string): string {
    return `/poll/${pollId}`;
  }

  /**
   * Remove creator session
   */
  static removeCreatorSession(pollId: string): void {
    const sessions = this.getCreatorSessions();
    const filteredSessions = sessions.filter(s => s.pollId !== pollId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredSessions));
  }

  /**
   * Clean expired sessions
   */
  static cleanExpiredSessions(): void {
    const sessions = this.getCreatorSessions();
    const validSessions = sessions.filter(s => this.isSessionValid(s));
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(validSessions));
  }

  /**
   * Get all creator sessions
   */
  private static getCreatorSessions(): CreatorSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to parse creator sessions:', error);
      return [];
    }
  }

  /**
   * Check if session is still valid
   */
  private static isSessionValid(session: CreatorSession): boolean {
    return session.isActive && 
           (Date.now() - session.createdAt) < this.SESSION_DURATION;
  }

  /**
   * Get creator session for a poll
   */
  static getCreatorSession(pollId: string): CreatorSession | null {
    const sessions = this.getCreatorSessions();
    const session = sessions.find(s => 
      s.pollId === pollId && 
      s.isActive && 
      this.isSessionValid(s)
    );
    return session || null;
  }
}