import React, { createContext, useContext, useReducer } from 'react';
import { 
  collection, 
  addDoc, 
  doc, 
  getDoc, 
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
        createdAt: new Date(),
        votes: {},
        totalVotes: 0,
        isActive: true,
      };

      // For demo purposes, store in localStorage instead of Firebase
      try {
        const storedPools = JSON.parse(localStorage.getItem('voting-pools') || '[]');
        storedPools.push(newPool);
        localStorage.setItem('voting-pools', JSON.stringify(storedPools));
      } catch (error) {
        console.warn('LocalStorage demo mode:', error);
      }
      
      dispatch({ type: 'ADD_POOL', payload: newPool });
      return newPool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Get a specific pool
  const getPool = async (poolId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // For demo purposes, get from localStorage
      const storedPools = JSON.parse(localStorage.getItem('voting-pools') || '[]');
      const pool = storedPools.find(p => p.id === poolId);
      
      if (!pool) {
        throw new Error('Pool not found');
      }
      
      dispatch({ type: 'SET_CURRENT_POOL', payload: pool });
      return pool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Submit a vote
  const submitVote = async (poolId, questionIndex, answerIndex, isAnonymous = true) => {
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

      // Update pool in localStorage
      const storedPools = JSON.parse(localStorage.getItem('voting-pools') || '[]');
      const poolIndex = storedPools.findIndex(p => p.id === poolId);
      if (poolIndex !== -1) {
        storedPools[poolIndex] = { 
          ...storedPools[poolIndex], 
          votes, 
          totalVotes,
          lastVoteAt: new Date()
        };
        localStorage.setItem('voting-pools', JSON.stringify(storedPools));
      }

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
      
      // Update pool in localStorage
      const storedPools = JSON.parse(localStorage.getItem('voting-pools') || '[]');
      const poolIndex = storedPools.findIndex(p => p.id === poolId);
      if (poolIndex !== -1) {
        storedPools[poolIndex] = { 
          ...storedPools[poolIndex], 
          ...updates,
          updatedAt: new Date()
        };
        localStorage.setItem('voting-pools', JSON.stringify(storedPools));
      }

      const updatedPool = { ...pool, ...updates };
      dispatch({ type: 'UPDATE_POOL', payload: updatedPool });
      
      return updatedPool;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message });
      throw error;
    }
  };

  // Delete a pool
  const deletePool = async (poolId) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      // Remove from localStorage
      const storedPools = JSON.parse(localStorage.getItem('voting-pools') || '[]');
      const filteredPools = storedPools.filter(p => p.id !== poolId);
      localStorage.setItem('voting-pools', JSON.stringify(filteredPools));
      
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