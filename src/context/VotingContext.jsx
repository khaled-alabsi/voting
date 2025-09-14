import React, { createContext, useContext, useReducer } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase';
import { v4 as uuidv4 } from 'uuid';

const VotingContext = createContext();

const initialState = {
  pools: [],
  currentPool: null,
  loading: false,
  error: null,
};

function votingReducer(state, action) {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'SET_POOLS':
      return { ...state, pools: action.payload, loading: false };
    case 'SET_CURRENT_POOL':
      return { ...state, currentPool: action.payload, loading: false };
    case 'ADD_POOL':
      return { ...state, pools: [...state.pools, action.payload], loading: false };
    case 'UPDATE_POOL':
      return {
        ...state,
        pools: state.pools.map(pool => 
          pool.id === action.payload.id ? action.payload : pool
        ),
        currentPool: state.currentPool?.id === action.payload.id ? action.payload : state.currentPool,
        loading: false
      };
    case 'DELETE_POOL':
      return {
        ...state,
        pools: state.pools.filter(pool => pool.id !== action.payload),
        currentPool: state.currentPool?.id === action.payload ? null : state.currentPool,
        loading: false
      };
    default:
      return state;
  }
}

export function VotingProvider({ children }) {
  const [state, dispatch] = useReducer(votingReducer, initialState);

  // Create a new voting pool
  const createPool = async (poolData) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const poolId = uuidv4();
      const newPool = {
        id: poolId,
        ...poolData,
        createdAt: serverTimestamp(),
        votes: {},
        totalVotes: 0,
        isActive: true,
      };

      // Store in Firebase Firestore
      await addDoc(collection(db, 'voting-pools'), newPool);
      
      dispatch({ type: 'ADD_POOL', payload: { ...newPool, createdAt: new Date() } });
      return { ...newPool, createdAt: new Date() };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Get a specific pool
  const getPool = async (poolId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Query Firebase Firestore to find pool by id
      const poolsRef = collection(db, 'voting-pools');
      const q = query(poolsRef, where('id', '==', poolId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error('Pool not found');
      }
      
      const poolDoc = querySnapshot.docs[0];
      const pool = { docId: poolDoc.id, ...poolDoc.data() };
      
      dispatch({ type: 'SET_CURRENT_POOL', payload: pool });
      return pool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Submit a vote
  const submitVote = async (poolId, questionIndex, answerIndex) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const pool = await getPool(poolId);
      const votes = pool.votes || {};
      const questionKey = `question_${questionIndex}`;
      const answerKey = `answer_${answerIndex}`;
      
      // Initialize question votes if not exists
      if (!votes[questionKey]) {
        votes[questionKey] = {};
      }
      
      // Initialize answer votes if not exists
      if (!votes[questionKey][answerKey]) {
        votes[questionKey][answerKey] = 0;
      }
      
      // Increment vote count
      votes[questionKey][answerKey]++;
      
      // Update total votes
      const totalVotes = (pool.totalVotes || 0) + 1;

      // Update pool in Firebase Firestore
      const poolDocRef = doc(db, 'voting-pools', pool.docId);
      await updateDoc(poolDocRef, {
        votes,
        totalVotes,
        lastVoteAt: serverTimestamp()
      });

      const updatedPool = { ...pool, votes, totalVotes };
      dispatch({ type: 'UPDATE_POOL', payload: updatedPool });
      
      return updatedPool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Update pool settings
  const updatePool = async (poolId, updates) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const pool = await getPool(poolId);
      
      // Update pool in Firebase Firestore
      const poolDocRef = doc(db, 'voting-pools', pool.docId);
      await updateDoc(poolDocRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });

      const updatedPool = { ...pool, ...updates };
      dispatch({ type: 'UPDATE_POOL', payload: updatedPool });
      
      return updatedPool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Load all pools
  const loadPools = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const poolsRef = collection(db, 'voting-pools');
      const q = query(poolsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const pools = querySnapshot.docs.map(doc => ({
        docId: doc.id,
        ...doc.data()
      }));
      
      dispatch({ type: 'SET_POOLS', payload: pools });
      return pools;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Delete a pool
  const deletePool = async (poolId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      const pool = await getPool(poolId);
      
      // Remove from Firebase Firestore
      const poolDocRef = doc(db, 'voting-pools', pool.docId);
      await deleteDoc(poolDocRef);
      
      dispatch({ type: 'DELETE_POOL', payload: poolId });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  const value = {
    ...state,
    createPool,
    getPool,
    loadPools,
    submitVote,
    updatePool,
    deletePool,
  };

  return (
    <VotingContext.Provider value={value}>
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (!context) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}