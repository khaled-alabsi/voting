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
  writeBatch,
  addDoc
} from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';
import { getAuth } from 'firebase/auth';
import { db } from '../lib/firebase';
import { CookieService } from './cookieService';
import { AuthService } from './authService';
import type { UserSession, PollSession, PollHistory, PollVisitor, VotingSession } from '../types';

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
  static async joinPoll(pollId: string, role: 'creator' | 'voter' | 'viewer', name?: string): Promise<VotingSession> {
    console.log('SessionService.joinPoll called with:', { pollId, role, name });
    
    try {
      console.log('Attempting to join poll session...');
      
      // Check if Firebase is configured
      const auth = getAuth();
      console.log('Firebase auth instance:', !!auth);
      console.log('Current user:', auth.currentUser?.uid);
      
      const sessionId = uuidv4();
      console.log('Generated session ID:', sessionId);
      
      const sessionData = {
        id: sessionId,
        pollId,
        role,
        userName: name || 'Anonymous',
        joinedAt: new Date(),
        lastActivity: new Date(),
        status: 'active' as const
      };
      console.log('Session data to save:', sessionData);

      // Try to save to Firestore
      console.log('Attempting to save session to Firestore...');
      await addDoc(collection(db, 'sessions'), sessionData);
      console.log('Successfully saved session to Firestore');

      // Save to cookies for tracking
      console.log('Saving session to cookies...');
      CookieService.setCookie(`session_${pollId}`, sessionId, 30);
      CookieService.setCookie(`session_${pollId}_data`, JSON.stringify(sessionData), 30);
      console.log('Successfully saved session to cookies');

      const votingSession: VotingSession = {
        pollId,
        startedAt: new Date(),
        currentQuestionIndex: 0,
        answers: {},
        timeSpent: {},
        voterName: name
      };
      console.log('Created voting session object:', votingSession);

      // Track visitor analytics
      console.log('Tracking visitor...');
      await this.trackVisitor(pollId, role);
      console.log('Successfully tracked visitor');

      return votingSession;
    } catch (error) {
      console.error('SessionService.joinPoll error details:', {
        error,
        errorCode: error instanceof Error && 'code' in error ? error.code : 'unknown',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack : 'No stack trace'
      });
      
      // Provide more specific error messages
      const firebaseError = error as { code?: string };
      if (firebaseError?.code === 'permission-denied') {
        throw new Error('Permission denied: Please check Firestore security rules');
      } else if (firebaseError?.code === 'unavailable') {
        throw new Error('Firebase service unavailable: Please check your internet connection');
      } else if (firebaseError?.code === 'not-found') {
        throw new Error('Firebase project not found: Please verify your configuration');
      } else {
        throw new Error(`Failed to join poll: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  }

  /**
   * Track poll visitor
   */
  static async trackVisitor(pollId: string, sessionToken: string, voterName?: string): Promise<void> {
    console.log('SessionService.trackVisitor called with:', { pollId, sessionToken, voterName });
    const visitorId = `${sessionToken}_${pollId}`;
    console.log('Visitor ID:', visitorId);
    
    try {
      const existingVisitor = await getDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId));
      console.log('Existing visitor check:', existingVisitor.exists());
      
      if (existingVisitor.exists()) {
        // Update last seen
        console.log('Updating existing visitor...');
        await updateDoc(doc(db, POLL_VISITORS_COLLECTION, visitorId), {
          lastSeen: Timestamp.now(),
          voterName: voterName || existingVisitor.data().voterName
        });
        console.log('Existing visitor updated successfully');
      } else {
        // Create new visitor record
        console.log('Creating new visitor record...');
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
        console.log('New visitor record created successfully');
      }
    } catch (error) {
      console.error('Failed to track visitor:', error);
      throw error; // Re-throw the error
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
   * Get user's poll history with full poll details
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

      // Fetch poll details for each unique poll
      const pollsWithDetails = await Promise.all(
        Array.from(pollMap.values()).map(async (session) => {
          try {
            const pollDoc = await getDoc(doc(db, 'polls', session.pollId));
            const pollData = pollDoc.data();
            
            // Determine status based on expiration
            let status: 'active' | 'completed' | 'expired' = 'active';
            if (pollData?.settings?.expiresAt) {
              const expirationDate = pollData.settings.expiresAt.toDate();
              if (expirationDate < new Date()) {
                status = 'expired';
              }
            }

            return {
              pollId: session.pollId,
              role: session.role,
              lastAccessed: session.lastActivity,
              status,
              title: pollData?.title || 'Unknown Poll'
            };
          } catch (error) {
            console.error(`Failed to fetch poll ${session.pollId}:`, error);
            return {
              pollId: session.pollId,
              role: session.role,
              lastAccessed: session.lastActivity,
              status: 'expired' as const,
              title: 'Poll Not Found'
            };
          }
        })
      );

      return {
        userId: AuthService.getCurrentUser()?.uid,
        sessionToken,
        polls: pollsWithDetails
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

  /**
   * Get all polls created by the current user (admin functionality)
   */
  static async getCreatedPolls(): Promise<Array<{pollId: string, title: string, createdAt: Timestamp, status: string}>> {
    const currentUser = AuthService.getCurrentUser();
    if (!currentUser) return [];

    try {
      const q = query(
        collection(db, 'polls'),
        where('creatorId', '==', currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        let status = 'active';
        if (data.settings?.expiresAt) {
          const expirationDate = data.settings.expiresAt.toDate();
          if (expirationDate < new Date()) {
            status = 'expired';
          }
        }
        
        return {
          pollId: doc.id,
          title: data.title || 'Untitled Poll',
          createdAt: data.createdAt,
          status
        };
      });
    } catch (error) {
      console.error('Failed to get created polls:', error);
      return [];
    }
  }
}