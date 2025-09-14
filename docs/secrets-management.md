# Secrets Management Documentation

## 🎯 Overview

This document explains how environment variables and secrets are managed in the VotingApp, covering local development, GitHub Actions, and Firebase configuration.

## 🔐 Secret Types

### 1. Firebase Configuration

**Purpose**: Connect to Firebase services (Authentication, Firestore, Analytics)

**Required secrets:**

| Variable | Purpose | Example |
|----------|---------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase Web API authentication | `AIzaSyC...` |
| `VITE_FIREBASE_AUTH_DOMAIN` | Authentication domain | `voting-946b7.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project identifier | `voting-946b7` |
| `VITE_FIREBASE_STORAGE_BUCKET` | Cloud Storage bucket | `voting-946b7.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | FCM sender ID | `123456789012` |
| `VITE_FIREBASE_APP_ID` | Firebase app identifier | `1:123:web:abc123` |
| `VITE_FIREBASE_MEASUREMENT_ID` | Google Analytics ID | `G-XXXXXXXXXX` |

### 2. Build Configuration

**Purpose**: Control build behavior and deployment settings

| Variable | Purpose | Default |
|----------|---------|---------|
| `NODE_ENV` | Environment mode | `development`/`production` |
| `BASE_URL` | Application base path | `/` (dev), `/voting/` (prod) |

## 🏠 Local Development

### Environment File

**File**: `.env` (root directory)

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

### Security Best Practices

**Git configuration:**
```bash
# .env is already in .gitignore
echo ".env" >> .gitignore
```

**File permissions:**
```bash
# Restrict access to .env file
chmod 600 .env
```

**Backup strategy:**
- Keep secure backup of Firebase credentials
- Document where to find values in Firebase Console
- Never commit actual values to repository

### Getting Firebase Values

**Where to find Firebase configuration:**

1. **Firebase Console**: https://console.firebase.google.com
2. **Select your project** → `voting-946b7`
3. **Project Settings** (gear icon) → **General** tab
4. **Your apps** section → **Web app** → **Config**

**Example config object:**
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

## ☁️ GitHub Actions (Production)

### Repository Secrets

**Location**: Repository Settings → Secrets and variables → Actions

**Required secrets:**
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`
- `REACT_APP_FIREBASE_MEASUREMENT_ID`

### Adding Secrets

**Step-by-step process:**

1. **Navigate to repository**:
   ```
   https://github.com/khaled-alabsi/voting
   ```

2. **Go to Settings**:
   ```
   Settings → Secrets and variables → Actions
   ```

3. **Add each secret**:
   - Click "New repository secret"
   - Enter name: `REACT_APP_FIREBASE_API_KEY`
   - Enter value: `AIzaSyC...` (from Firebase Console)
   - Click "Add secret"
   - Repeat for each Firebase config value

### Environment File Creation

**Workflow step** (in `.github/workflows/deploy.yml`):

```yaml
- name: Create environment file
  run: |
    echo "VITE_FIREBASE_API_KEY=${{ secrets.REACT_APP_FIREBASE_API_KEY }}" >> .env
    echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.REACT_APP_FIREBASE_AUTH_DOMAIN }}" >> .env
    echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.REACT_APP_FIREBASE_PROJECT_ID }}" >> .env
    echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.REACT_APP_FIREBASE_STORAGE_BUCKET }}" >> .env
    echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.REACT_APP_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
    echo "VITE_FIREBASE_APP_ID=${{ secrets.REACT_APP_FIREBASE_APP_ID }}" >> .env
    echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.REACT_APP_FIREBASE_MEASUREMENT_ID }}" >> .env
```

**Process:**
1. GitHub Actions reads secrets from repository settings
2. Creates `.env` file during build process
3. Vite reads environment variables during build
4. Variables get embedded in built JavaScript files
5. Deployed app uses Firebase configuration

## 🔒 Security Considerations

### Secret Protection

**GitHub's security measures:**
- ✅ Secrets encrypted at rest
- ✅ Secrets only accessible during workflow execution
- ✅ Secrets automatically redacted from logs
- ✅ Limited to repository collaborators

**Best practices:**
- ✅ Use least-privilege Firebase security rules
- ✅ Enable Firebase App Check for production
- ✅ Monitor Firebase usage and quotas
- ✅ Rotate API keys periodically

### Firebase Security

**API Key security:**
```
⚠️  Firebase API keys are not traditional secrets
✅  They identify your project, not authenticate users
✅  Real security comes from Firebase Security Rules
✅  Safe to include in client-side code
```

**Security rules example:**
```javascript
// Firestore security rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Polls have specific access rules
    match /polls/{pollId} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Authenticated users can create
    }
  }
}
```

### Public vs Private Variables

**Public (embedded in client code):**
- ✅ `VITE_FIREBASE_API_KEY` - Safe to expose
- ✅ `VITE_FIREBASE_AUTH_DOMAIN` - Safe to expose
- ✅ `VITE_FIREBASE_PROJECT_ID` - Safe to expose

**Never expose:**
- ❌ Firebase Admin SDK private keys
- ❌ Database connection strings with passwords
- ❌ Third-party API keys with write permissions

## 🛠️ Development Setup

### Initial Setup

**1. Clone repository:**
```bash
git clone https://github.com/khaled-alabsi/voting.git
cd voting
```

**2. Install dependencies:**
```bash
npm install
```

**3. Create environment file:**
```bash
cp .env.example .env
# Edit .env with your Firebase configuration
```

**4. Get Firebase config:**
- Visit Firebase Console
- Copy configuration values
- Update .env file

**5. Test locally:**
```bash
npm run dev
# Visit http://localhost:5173/firebase-config to verify setup
```

### Environment Validation

**Configuration check page:**
```
http://localhost:5173/firebase-config
```

**What it validates:**
- ✅ Environment variables loaded
- ✅ Firebase initialization successful
- ✅ Project ID format valid
- ✅ Firestore instance created
- ✅ Authentication instance created

## 🔧 Troubleshooting

### Common Issues

#### 1. Missing Environment Variables

**Symptoms:**
```javascript
Firebase: No Firebase App '[DEFAULT]' has been created
```

**Solutions:**
```bash
# Check .env file exists
ls -la .env

# Verify variable names (must start with VITE_)
grep VITE_ .env

# Check file format (no spaces around =)
VITE_FIREBASE_API_KEY=value  # ✅ Correct
VITE_FIREBASE_API_KEY = value  # ❌ Incorrect
```

#### 2. GitHub Actions Secret Issues

**Symptoms:**
```
undefined is not a valid Firebase configuration
```

**Solutions:**
```bash
# Check secret names match exactly
REACT_APP_FIREBASE_API_KEY  # ✅ In GitHub Secrets
VITE_FIREBASE_API_KEY       # ✅ In .env creation step

# Verify all 7 Firebase secrets are configured
# Check workflow environment variable creation step
```

#### 3. Firebase Configuration Errors

**Symptoms:**
```javascript
Firebase: Error (auth/invalid-api-key)
```

**Solutions:**
- Verify API key is correct and complete
- Check project ID matches Firebase project
- Ensure Firebase services are enabled
- Verify domain configuration in Firebase Console

### Debug Commands

**Local debugging:**
```bash
# Check environment variables
npm run dev
# Open browser console, check process.env

# Test Firebase connection
npm run dev
# Visit /firebase-config route
```

**Production debugging:**
```bash
# Check deployed environment
# View browser console on production site
# Check Network tab for Firebase API calls
```

## 📊 Monitoring

### Security Monitoring

**Firebase Console monitoring:**
- Authentication usage and errors
- Firestore read/write operations
- Security rule violations
- API quota usage

**GitHub repository monitoring:**
- Secret access logs (limited visibility)
- Workflow execution logs
- Deployment success/failure notifications

### Best Practices

**Regular maintenance:**
- ✅ Review Firebase usage monthly
- ✅ Monitor for unusual API activity
- ✅ Update dependencies regularly
- ✅ Review security rules quarterly

**Emergency procedures:**
- 🚨 Rotate Firebase API keys if compromised
- 🚨 Update security rules if breach detected
- 🚨 Disable Firebase services if necessary
- 🚨 Review audit logs for unauthorized access