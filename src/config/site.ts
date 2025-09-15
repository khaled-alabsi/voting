// Site configuration for different environments
export interface SiteConfig {
  domain: string;
  name: string;
  description: string;
  social: {
    twitter?: string;
    github?: string;
  };
}

// Environment-based configuration
const isDevelopment = import.meta.env.DEV;

// Default configuration for development
const developmentConfig: SiteConfig = {
  domain: 'http://localhost:5173',
  name: 'Voting App (Dev)',
  description: 'Create and manage polls with real-time voting - Development',
  social: {
    github: 'https://github.com/khaled-alabsi/voting'
  }
};

// Production configuration - Update this when using custom domain
const productionConfig: SiteConfig = {
  domain: 'https://poll.leute.space', // Update this to your custom domain
  name: 'Voting App',
  description: 'Create and manage polls with real-time voting',
  social: {
    github: 'https://github.com/khaled-alabsi/voting'
  }
};

// Export the appropriate config based on environment
export const siteConfig: SiteConfig = isDevelopment ? developmentConfig : productionConfig;

// Helper functions for URL generation
export const getBaseUrl = (): string => {
  return siteConfig.domain;
};

export const getPollUrl = (pollId: string): string => {
  return `${getBaseUrl()}/poll/${pollId}`;
};

export const getShareUrl = (pollId: string): string => {
  return getPollUrl(pollId);
};

// Environment variables with fallbacks
export const env = {
  FIREBASE_API_KEY: import.meta.env.VITE_FIREBASE_API_KEY || '',
  FIREBASE_AUTH_DOMAIN: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  FIREBASE_PROJECT_ID: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  FIREBASE_STORAGE_BUCKET: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  FIREBASE_MESSAGING_SENDER_ID: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  FIREBASE_APP_ID: import.meta.env.VITE_FIREBASE_APP_ID || '',
  FIREBASE_MEASUREMENT_ID: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
} as const;

export default siteConfig;