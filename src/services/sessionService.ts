import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  onSnapshot,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { db } from '../lib/firebase';
import { CookieService } from './cookieService';
import { AuthService } from './authService';
import type { UserSession, PollSession, PollHistory, PollVisitor } from '../types';

// Collections
const USER_SESSIONS_COLLECTION = 'userSessions';
const POLL_SESSIONS_COLLECTION = 'pollSessions';
const POLL_VISITORS_COLLECTION = 'pollVisitors';

export class SessionService {
  private static SESSION_COOKIE_NAME = 'voting_session_token';
  private static SESSION_DURATION = 30; // 30 days

  /**
   * Initialize or get current session
   */
  static async initializeSession(): Promise<string> {
    // Check for existing session token in cookie
    let sessionToken = CookieService.getCookie(this.SESSION_COOKIE_NAME);
    
    if (sessionToken) {
      // Verify session exists in database
      const sessionDoc = await getDoc(doc(db, USER_SESSIONS_COLLECTION, sessionToken));
      if (sessionDoc.exists()) {
        // Update last activity
        await this.updateSessionActivity(sessionToken);
        return sessionToken;
      }
    }

    // Create new session
    sessionToken = uuidv4();
    const currentUser = AuthService.getCurrentUser();
    
    const session: UserSession = {
      id: sessionToken,
      userId: currentUser?.uid,
      sessionToken,
      createdAt: Timestamp.now(),
      lastActivity: Timestamp.now(),
      isActive: true,
      userAgent: navigator.userAgent,
      ipAddress: undefined // Would need server-side implementation
    };

    await setDoc(doc(db, USER_SESSIONS_COLLECTION, sessionToken), session);
    
    // Store token in cookie
    CookieService.setCookie(this.SESSION_COOKIE_NAME, sessionToken, this.SESSION_DURATION);
    
    return sessionToken;
  }

  /**
   * Get current session token
   */
  static getCurrentSessionToken(): string | null {
    return CookieService.getCookie(this.SESSION_COOKIE_NAME);
  }

  /**
   * Update session activity
   */
  static async updateSessionActivity(sessionToken: string): Promise<void> {
    try {
      await updateDoc(doc(db, USER_SESSIONS_COLLECTION, sessionToken), {
        lastActivity: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to update session activity:', error);
    }
  }

  /**
   * Join a poll session
   */
  static async joinPoll(pollId: string, role: 'creator' | 'voter' | 'viewer', voterName?: string): Promise<void> {
    const sessionToken = await this.initializeSession();
    const pollSessionId = `${sessionToken}_${pollId}`;

    try {
      // Check if session already exists
      const existingSession = await getDoc(doc(db, POLL_SESSIONS_COLLECTION, pollSessionId));
      
      if (existingSession.exists()) {
        // Update existing session
        await updateDoc(doc(db, POLL_SESSIONS_COLLECTION, pollSessionId), {
          lastActivity: Timestamp.now(),
          isActive: true,
          voterName: voterName || existingSession.data().voterName
        });
      } else {
        // Create new poll session
        const pollSession: PollSession = {
          id: pollSessionId,
          sessionId: sessionToken,
          pollId,
          role,
          joinedAt: Timestamp.now(),
          lastActivity: Timestamp.now(),
          hasVoted: false,
          isActive: true,
          voterName
        };

        await setDoc(doc(db, POLL_SESSIONS_COLLECTION, pollSessionId), pollSession);
      }

      // Track as visitor
      await this.trackVisitor(pollId, sessionToken, voterName);
      
    } catch (error) {
      console.error('Failed to join poll session:', error);
    }
  }

  /**
   * Track poll visitor
   */
  static async trackVisitor(pollId: string, sessionToken: string, voterName?: string): Promise<void> {
    const visitorId = `${sessionToken}_${pollId}`;
    
    try {
      const existingVisitor = await getDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId));
      
      if (existingVisitor.exists()) {
        // Update last seen
        await updateDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId), {
          lastSeen: Timestamp.now(),
          voterName: voterName || existingVisitor.data().voterName
        });
      } else {
        // Create new visitor record
        const visitor: PollVisitor = {
          sessionId: sessionToken,
          pollId,
          joinedAt: Timestamp.now(),
          lastSeen: Timestamp.now(),
          hasVoted: false,
          voterName,
          userAgent: navigator.userAgent
        };

        await setDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId), visitor);
      }
    } catch (error) {
      console.error('Failed to track visitor:', error);
    }
  }

  /**
   * Mark user as voted
   */
  static async markAsVoted(pollId: string): Promise<void> {
    const sessionToken = this.getCurrentSessionToken();
    if (!sessionToken) return;

    const pollSessionId = `${sessionToken}_${pollId}`;
    const visitorId = `${sessionToken}_${pollId}`;

    try {
      // Update poll session
      await updateDoc(doc(db, POLL_SESSIONS_COLLECTION, pollSessionId), {
        hasVoted: true,
        lastActivity: Timestamp.now()
      });

      // Update visitor record
      await updateDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId), {
        hasVoted: true,
        lastSeen: Timestamp.now()
      });
    } catch (error) {
      console.error('Failed to mark as voted:', error);
    }
  }

  /**
   * Get poll visitors for admin panel
   */
  static async getPollVisitors(pollId: string): Promise<PollVisitor[]> {
    try {
      const q = query(
        collection(db, POLL_VISITORS_COLLECTION),
        where('pollId', '==', pollId),
        orderBy('joinedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PollVisitor & { id: string }));
    } catch (error) {
      console.error('Failed to get poll visitors:', error);
      return [];
    }
  }

  /**
   * Subscribe to poll visitors (real-time)
   */
  static subscribeToPollVisitors(pollId: string, callback: (visitors: PollVisitor[]) => void): () => void {
    const q = query(
      collection(db, POLL_VISITORS_COLLECTION),
      where('pollId', '==', pollId)
    );

    return onSnapshot(q, (querySnapshot) => {
      const visitors = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      } as PollVisitor & { id: string }));
      callback(visitors);
    });
  }

  /**
   * Get user's poll history
   */
  static async getUserPollHistory(): Promise<PollHistory | null> {
    const sessionToken = this.getCurrentSessionToken();
    if (!sessionToken) return null;

    try {
      const q = query(
        collection(db, POLL_SESSIONS_COLLECTION),
        where('sessionId', '==', sessionToken),
        orderBy('lastActivity', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const pollSessions = querySnapshot.docs.map(doc => doc.data() as PollSession);

      // Group by poll and get latest session for each
      const pollMap = new Map();
      for (const session of pollSessions) {
        if (!pollMap.has(session.pollId) || session.lastActivity > pollMap.get(session.pollId).lastActivity) {
          pollMap.set(session.pollId, session);
        }
      }

      const polls = Array.from(pollMap.values()).map(session => ({
        pollId: session.pollId,
        role: session.role,
        lastAccessed: session.lastActivity,
        status: 'active' as const, // Would need to check poll expiration
        title: 'Loading...' // Would need to fetch poll titles
      }));

      return {
        userId: AuthService.getCurrentUser()?.uid,
        sessionToken,
        polls
      };
    } catch (error) {
      console.error('Failed to get poll history:', error);
      return null;
    }
  }

  /**
   * Check if user is creator of poll
   */
  static async isPollCreator(pollId: string): Promise<boolean> {
    const sessionToken = this.getCurrentSessionToken();
    if (!sessionToken) return false;

    try {
      const pollSessionId = `${sessionToken}_${pollId}`;
      const sessionDoc = await getDoc(doc(db, POLL_SESSIONS_COLLECTION, pollSessionId));
      
      if (sessionDoc.exists()) {
        return sessionDoc.data().role === 'creator';
      }
      return false;
    } catch (error) {
      console.error('Failed to check creator status:', error);
      return false;
    }
  }

  /**
   * Clean expired sessions
   */
  static async cleanExpiredSessions(): Promise<void> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    try {
      const q = query(
        collection(db, USER_SESSIONS_COLLECTION),
        where('lastActivity', '<', Timestamp.fromDate(thirtyDaysAgo))
      );
      
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      
      querySnapshot.docs.forEach((document) => {
        batch.delete(document.ref);
      });
      
      await batch.commit();
    } catch (error) {
      console.error('Failed to clean expired sessions:', error);
    }
  }

  /**
   * Sign out and clear session
   */
  static async signOut(): Promise<void> {
    const sessionToken = this.getCurrentSessionToken();
    
    if (sessionToken) {
      try {
        // Mark session as inactive
        await updateDoc(doc(db, USER_SESSIONS_COLLECTION, sessionToken), {
          isActive: false,
          lastActivity: Timestamp.now()
        });
      } catch (error) {
        console.error('Failed to mark session as inactive:', error);
      }
      
      // Clear cookie
      CookieService.deleteCookie(this.SESSION_COOKIE_NAME);
    }
  }
}