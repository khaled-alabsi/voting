# Firebase Setup Documentation

## 🎯 Overview

This document provides comprehensive instructions for setting up Firebase for the VotingApp, including project creation, service configuration, and security rules.

## 🔧 Firebase Project Setup

### 1. Create Firebase Project

**Steps:**

1. **Visit Firebase Console:**
   - Go to: https://console.firebase.google.com/
   - Sign in with Google account

2. **Create new project:**
   - Click "Create a project"
   - Project name: `voting-app` (or your preferred name)
   - Project ID: `voting-946b7` (auto-generated, note this down)
   - Enable Google Analytics: Yes (recommended)
   - Select Analytics account or create new one
   - Click "Create project"

3. **Project overview:**
   - Wait for project creation (1-2 minutes)
   - Click "Continue" when ready

### 2. Add Web App

**Configuration:**

1. **Add app:**
   - In project overview, click "Web" icon (`</>`)
   - App nickname: `VotingApp Web`
   - ✅ Setup Firebase Hosting: No (using GitHub Pages)
   - Click "Register app"

2. **Save configuration:**
   - Copy the Firebase config object
   - Save these values for environment variables
   - Click "Continue to console"

**Example config:**
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyC...",
  authDomain: "voting-946b7.firebaseapp.com",
  projectId: "voting-946b7",
  storageBucket: "voting-946b7.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456",
  measurementId: "G-XXXXXXXXXX"
};
```

## 🔐 Authentication Setup

### 1. Enable Authentication

**Steps:**

1. **Navigate to Authentication:**
   - In Firebase console, click "Authentication" in sidebar
   - Click "Get started"

2. **Configure sign-in methods:**
   - Go to "Sign-in method" tab
   - Enable required providers:

**Anonymous Authentication:**
- Click "Anonymous"
- Toggle "Enable"
- Click "Save"

**Email/Password Authentication:**
- Click "Email/Password"
- Enable first option (Email/Password)
- Optionally enable "Email link (passwordless sign-in)"
- Click "Save"

### 2. Configure Authorized Domains

**For production deployment:**

1. **Add GitHub Pages domain:**
   - In "Sign-in method" tab
   - Scroll to "Authorized domains"
   - Click "Add domain"
   - Add: `khaled-alabsi.github.io`
   - Click "Add"

2. **Localhost for development:**
   - `localhost` should already be configured
   - If not, add `localhost`

### 3. Authentication Settings

**User data:**
- Navigate to "Settings" tab in Authentication
- Configure user account options as needed
- Set user account linking preferences

## 🗄️ Firestore Database Setup

### 1. Create Database

**Steps:**

1. **Navigate to Firestore:**
   - Click "Firestore Database" in sidebar
   - Click "Create database"

2. **Security rules mode:**
   - Select "Start in test mode" (temporary)
   - Click "Next"

3. **Database location:**
   - Choose region closest to users
   - Recommended: `us-central1` (default)
   - Click "Done"

### 2. Database Structure

**Collections to create:**

```
voting-app-db/
├── users/
│   └── {userId}/
│       ├── id: string
│       ├── email?: string
│       ├── displayName?: string
│       ├── isAnonymous: boolean
│       └── createdAt: timestamp
├── polls/
│   └── {pollId}/
│       ├── id: string
│       ├── title: string
│       ├── description: string
│       ├── creatorId: string
│       ├── questions: array
│       ├── answers: array
│       ├── settings: object
│       ├── shareableLink: string
│       └── createdAt: timestamp
└── votes/
    └── {voteId}/
        ├── id: string
        ├── pollId: string
        ├── questionId: string
        ├── answerId: string
        ├── userId?: string
        └── votedAt: timestamp
```

### 3. Security Rules

**Replace test mode rules with production rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read and write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Polls are publicly readable, but only authenticated users can create
    match /polls/{pollId} {
      allow read: if true;
      allow create: if request.auth != null 
        && request.auth.uid == resource.data.creatorId;
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.creatorId;
    }
    
    // Votes can be created by authenticated or anonymous users
    match /votes/{voteId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null || 
        (request.auth == null && 
         get(/databases/$(database)/documents/polls/$(resource.data.pollId))
         .data.settings.allowAnonymousVoting == true);
      allow update, delete: if request.auth != null 
        && request.auth.uid == resource.data.userId;
    }
    
    // Test documents (for Firebase testing)
    match /test/{testId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

**How to update rules:**

1. Go to Firestore Database → Rules tab
2. Replace existing rules with above code
3. Click "Publish"

## 📊 Analytics Setup (Optional)

### 1. Google Analytics Configuration

**If enabled during project creation:**

1. **View Analytics data:**
   - Go to "Analytics" in Firebase console
   - Connect to Google Analytics property
   - Configure conversion events

2. **Custom events tracking:**
   - Poll creation events
   - Vote submission events
   - User engagement metrics

## 🔧 Firebase SDK Configuration

### 1. Environment Variables

**Create mapping from Firebase config to environment variables:**

| Firebase Config | Environment Variable |
|----------------|---------------------|
| `apiKey` | `VITE_FIREBASE_API_KEY` |
| `authDomain` | `VITE_FIREBASE_AUTH_DOMAIN` |
| `projectId` | `VITE_FIREBASE_PROJECT_ID` |
| `storageBucket` | `VITE_FIREBASE_STORAGE_BUCKET` |
| `messagingSenderId` | `VITE_FIREBASE_MESSAGING_SENDER_ID` |
| `appId` | `VITE_FIREBASE_APP_ID` |
| `measurementId` | `VITE_FIREBASE_MEASUREMENT_ID` |

### 2. Local Development

**Create `.env` file:**

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=voting-946b7.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=voting-946b7
VITE_FIREBASE_STORAGE_BUCKET=voting-946b7.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### 3. GitHub Actions Secrets

**Add to repository secrets:**

1. Go to repository Settings → Secrets and variables → Actions
2. Add each environment variable as a secret:
   - Name: `REACT_APP_FIREBASE_API_KEY`
   - Value: `your_api_key_here`
   - Repeat for all 7 variables

## 🔍 Testing Firebase Setup

### 1. Configuration Validation

**Test locally:**
```bash
npm run dev
# Visit: http://localhost:5173/firebase-config
```

**Validation checks:**
- ✅ Environment variables loaded
- ✅ Firebase initialized
- ✅ Project ID valid
- ✅ Firestore connection
- ✅ Authentication service

### 2. Full Firebase Test

**Test all services:**
```bash
npm run dev
# Visit: http://localhost:5173/firebase-test
```

**Test operations:**
- ✅ Anonymous authentication
- ✅ Firestore read/write
- ✅ Document creation
- ✅ User document creation
- ✅ Poll creation with test data

### 3. Production Testing

**After deployment:**
- Visit: https://khaled-alabsi.github.io/voting/firebase-config
- Verify all services work in production
- Test with actual user workflows

## 🛠️ Troubleshooting

### Common Setup Issues

#### 1. Authentication Configuration Not Found

**Error:**
```
Firebase: Error (auth/configuration-not-found)
```

**Solution:**
- Ensure Authentication is enabled in Firebase Console
- Enable at least Anonymous sign-in method
- Verify authorized domains include your domain

#### 2. Firestore Permission Denied

**Error:**
```
FirebaseError: Missing or insufficient permissions
```

**Solutions:**
- Update Firestore security rules
- Ensure user is authenticated for protected operations
- Check rule logic matches your data structure

#### 3. Invalid API Key

**Error:**
```
Firebase: Error (auth/invalid-api-key)
```

**Solutions:**
- Verify API key is copied correctly
- Ensure no extra spaces or characters
- Regenerate API key if necessary

#### 4. Project Not Found

**Error:**
```
Firebase: Error (auth/project-not-found)
```

**Solutions:**
- Verify project ID is correct
- Ensure project exists and is active
- Check billing account if applicable

### Firebase Console Debugging

**Useful console sections:**
- **Authentication** → Users: View registered users
- **Firestore** → Data: Browse database collections
- **Usage**: Monitor API quotas and usage
- **Settings** → Project settings: Verify configuration

### Development Debugging

**Browser console debugging:**
```javascript
// Check Firebase initialization
console.log(firebase.apps);

// Check environment variables
console.log(import.meta.env);

// Test Firebase services
firebase.auth().onAuthStateChanged(user => console.log(user));
```

## 📈 Performance & Optimization

### Firestore Optimization

**Index management:**
- Monitor index usage in Firestore console
- Create composite indexes for complex queries
- Remove unused indexes to reduce storage costs

**Query optimization:**
- Use appropriate query limits
- Implement pagination for large result sets
- Use real-time listeners efficiently

### Security Best Practices

**Authentication security:**
- Implement proper user data validation
- Use Firebase Auth state listeners correctly
- Handle authentication errors gracefully

**Database security:**
- Keep security rules up to date
- Test rules with the Rules Playground
- Monitor for security rule violations
- Implement proper data validation in rules

## 📊 Monitoring & Maintenance

### Regular Maintenance Tasks

**Monthly:**
- Review Firebase usage and billing
- Check security rule violations
- Update dependencies if needed
- Monitor authentication metrics

**Quarterly:**
- Review and update security rules
- Audit user access patterns
- Check for unused features or data
- Update Firebase SDK versions

### Cost Management

**Firebase pricing:**
- Firestore: Pay per operation (reads/writes)
- Authentication: Free tier includes 10K MAU
- Analytics: Free with Google Analytics

**Cost optimization:**
- Minimize unnecessary reads/writes
- Use efficient query patterns
- Implement proper caching strategies
- Monitor usage quotas regularly