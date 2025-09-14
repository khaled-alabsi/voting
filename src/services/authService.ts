import {
  signInAnonymously,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import type { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { User } from '../types';

export class AuthService {
  // Sign in anonymously
  static async signInAnonymously(): Promise<FirebaseUser> {
    const result = await signInAnonymously(auth);
    await this.createUserDocument(result.user, true);
    return result.user;
  }

  // Sign in with email and password
  static async signInWithEmail(email: string, password: string): Promise<FirebaseUser> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  }

  // Create account with email and password
  static async createAccount(email: string, password: string, displayName?: string): Promise<FirebaseUser> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName) {
      await updateProfile(result.user, { displayName });
    }
    
    await this.createUserDocument(result.user, false);
    return result.user;
  }

  // Sign out
  static async signOut(): Promise<void> {
    await signOut(auth);
  }

  // Create user document in Firestore
  private static async createUserDocument(user: FirebaseUser, isAnonymous: boolean): Promise<void> {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      const userData: Partial<User> = {
        id: user.uid,
        isAnonymous,
        createdAt: Timestamp.now()
      };
      
      // Only add email and displayName if they exist
      if (user.email) {
        userData.email = user.email;
      }
      if (user.displayName) {
        userData.displayName = user.displayName;
      }
      
      await setDoc(userRef, userData);
    }
  }

  // Get user document
  static async getUserDocument(userId: string): Promise<User | null> {
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      return userDoc.data() as User;
    }
    
    return null;
  }

  // Subscribe to auth state changes
  static onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  static getCurrentUser(): FirebaseUser | null {
    return auth.currentUser;
  }

  // Check if user is anonymous
  static isAnonymous(): boolean {
    const user = this.getCurrentUser();
    return user?.isAnonymous || false;
  }

  // Convert anonymous account to permanent
  static async linkEmailPassword(email: string, password: string): Promise<FirebaseUser> {
    const user = this.getCurrentUser();
    if (!user || !user.isAnonymous) {
      throw new Error('No anonymous user to link');
    }

    // This would require implementing email/password linking
    // For now, we'll create a new account and transfer data
    const newUser = await this.createAccount(email, password);
    
    // Transfer any polls created by the anonymous user
    // This would need to be implemented based on your needs
    
    return newUser;
  }
}