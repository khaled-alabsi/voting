# React Router & SPA Configuration

## 🎯 Overview

This document explains how React Router is configured for the VotingApp to work seamlessly with GitHub Pages static hosting, including Single Page Application (SPA) routing solutions.

## ⚙️ Router Configuration

### Basic Setup

**File**: `src/App.tsx`

```typescript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/create" element={<CreatePollPage />} />
        <Route path="/poll/:pollId" element={<PollPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/firebase-test" element={<FirebaseTestPage />} />
        <Route path="/firebase-config" element={<FirebaseConfigPage />} />
      </Routes>
    </Router>
  );
}
```

### Key Configuration Points

**1. Basename Configuration:**
```typescript
<Router basename={import.meta.env.BASE_URL}>
```

**Why this matters:**
- Development: `BASE_URL = "/"` (localhost:5173)
- Production: `BASE_URL = "/voting/"` (GitHub Pages subpath)
- Automatically set by Vite based on `vite.config.ts`

**2. Route Definitions:**
```typescript
<Route path="/firebase-test" element={<FirebaseTestPage />} />
```

**Resolved URLs:**
- Development: `http://localhost:5173/firebase-test`
- Production: `https://khaled-alabsi.github.io/voting/firebase-test`

## 🌐 GitHub Pages SPA Problem

### The Challenge

**Traditional static hosting:**
- Serves physical files only
- `/voting/firebase-test` → looks for `/voting/firebase-test/index.html`
- File doesn't exist → 404 error

**SPA requirements:**
- All routes handled by single `index.html`
- Client-side routing via JavaScript
- Need to bypass server-side routing

### The Solution

**Two-file approach for GitHub Pages:**

#### 1. 404 Redirect Handler

**File**: `public/404.html`

**Purpose**: Intercept 404 errors and redirect to main app

**Key configuration:**
```javascript
var pathSegmentsToKeep = 1; // For /voting/ base path
```

**How it works:**
1. User visits non-existent route
2. GitHub Pages returns 404
3. `404.html` loads and executes redirect script
4. Transforms URL with encoded route information
5. Redirects to main app

**URL transformation:**
```
Input:  https://khaled-alabsi.github.io/voting/firebase-test
Output: https://khaled-alabsi.github.io/voting/?/firebase-test
```

#### 2. Route Recovery Script

**File**: `index.html`

**Purpose**: Decode redirected routes and restore correct URLs

**Script location**: In `<head>` before React loads

**How it works:**
1. Detect if URL contains encoded route (`/?/...`)
2. Decode the route information
3. Use `window.history.replaceState` to fix URL
4. React Router takes over with correct route

**URL restoration:**
```
Input:  https://khaled-alabsi.github.io/voting/?/firebase-test
Output: https://khaled-alabsi.github.io/voting/firebase-test
```

## 🔧 Implementation Details

### Path Segments Configuration

**Critical setting in `404.html`:**
```javascript
var pathSegmentsToKeep = 1;
```

**Why `pathSegmentsToKeep = 1`:**
- GitHub Pages serves from: `https://username.github.io/repository/`
- Repository path: `/voting/` (1 segment)
- Keep 1 segment, redirect everything after

**For different setups:**
- Custom domain: `pathSegmentsToKeep = 0`
- Subdirectory deployment: Adjust number accordingly

### Environment-Specific Behavior

**Development (Vite dev server):**
- Built-in SPA support
- No 404 handling needed
- Direct route serving works

**Production (GitHub Pages):**
- Static file serving only
- Requires 404 redirect solution
- Manual SPA route handling

## 🛠️ Advanced Routing Features

### Protected Routes

**Authentication-based routing:**
```typescript
<Route 
  path="/dashboard" 
  element={user ? <DashboardPage user={user} /> : <Navigate to="/" />} 
/>
```

**Anonymous user handling:**
```typescript
<Route 
  path="/create" 
  element={user && !user.isAnonymous ? <CreatePollPage user={user} /> : <Navigate to="/" />} 
/>
```

### Dynamic Routes

**Poll viewing with parameters:**
```typescript
<Route path="/poll/:pollId" element={<PollPage user={user} />} />
```

**Parameter access in component:**
```typescript
import { useParams } from 'react-router-dom';

function PollPage() {
  const { pollId } = useParams<{ pollId: string }>();
  // Use pollId to fetch poll data
}
```

### Navigation Helpers

**Programmatic navigation:**
```typescript
import { useNavigate } from 'react-router-dom';

function CreatePollPage() {
  const navigate = useNavigate();
  
  const handlePollCreated = (pollId: string) => {
    navigate(`/poll/${pollId}`);
  };
}
```

**Link components:**
```typescript
import { Link } from 'react-router-dom';

<Link to="/create" className="btn-primary">
  Create Poll
</Link>
```

## 🔍 Testing Routing

### Local Development Testing

**Test all routes work:**
```bash
npm run dev

# Visit these URLs directly:
http://localhost:5173/
http://localhost:5173/create
http://localhost:5173/firebase-test
http://localhost:5173/firebase-config
```

**Should all load without 404 errors**

### Production Testing

**After deployment, test GitHub Pages:**
```
https://khaled-alabsi.github.io/voting/
https://khaled-alabsi.github.io/voting/firebase-test
https://khaled-alabsi.github.io/voting/firebase-config
```

**Verify:**
- ✅ Direct URL access works
- ✅ Navigation within app works
- ✅ Browser back/forward works
- ✅ Refresh on any route works

### Debug Tools

**Browser console debugging:**
```javascript
// Check current route
console.log(window.location.pathname);

// Check React Router state
console.log(window.history.length);

// Check if 404 redirect occurred
console.log(window.location.search);
```

## 🚨 Troubleshooting

### Common Issues

#### 1. 404 on Direct Route Access

**Symptoms:**
- Navigation within app works
- Direct URL access shows 404
- Refresh on non-home routes fails

**Solutions:**
- Verify `404.html` exists in `public/` folder
- Check `pathSegmentsToKeep` value
- Ensure route recovery script in `index.html`

#### 2. Incorrect Basename

**Symptoms:**
- Routes generate wrong URLs
- Navigation doesn't work in production
- Assets load from wrong paths

**Solutions:**
- Check `vite.config.ts` base setting
- Verify Router basename configuration
- Ensure environment variables are correct

#### 3. History API Issues

**Symptoms:**
- Browser back button doesn't work
- URLs don't update on navigation
- Bookmark/share URLs are wrong

**Solutions:**
- Use `BrowserRouter` (not `HashRouter`)
- Verify `history.replaceState` in recovery script
- Check for JavaScript errors blocking router

### Debug Commands

**Test routing locally:**
```bash
# Build and serve locally to simulate production
npm run build
npm run preview

# Test routes work in preview mode
```

**Check 404 handling:**
```bash
# Test 404 redirect (should redirect to main app)
curl -I https://khaled-alabsi.github.io/voting/nonexistent-route
```

## 📈 Performance Considerations

### Code Splitting

**Route-based code splitting:**
```typescript
import { lazy, Suspense } from 'react';

const CreatePollPage = lazy(() => import('./pages/CreatePollPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

<Route 
  path="/create" 
  element={
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePollPage />
    </Suspense>
  } 
/>
```

**Benefits:**
- Smaller initial bundle size
- Faster page load times
- Load route components on-demand

### Preloading

**Preload critical routes:**
```typescript
// Preload important routes on app initialization
import('./pages/CreatePollPage');
import('./pages/PollPage');
```

## 🔄 Future Improvements

### Potential Enhancements

**1. Route Guards:**
```typescript
function ProtectedRoute({ children, requireAuth = true }) {
  if (requireAuth && !user) {
    return <Navigate to="/" />;
  }
  return children;
}
```

**2. Route Loading States:**
```typescript
function RouteLoader({ children }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {children}
    </Suspense>
  );
}
```

**3. Error Boundaries:**
```typescript
function RouteErrorBoundary({ children }) {
  return (
    <ErrorBoundary fallback={<ErrorPage />}>
      {children}
    </ErrorBoundary>
  );
}
```

### Migration Considerations

**If moving away from GitHub Pages:**
- Remove 404.html redirect handling
- Remove route recovery script
- Update base URL configuration
- Test all routes still work

**If adding custom domain:**
- Update `pathSegmentsToKeep` to 0
- Remove `/voting/` base path
- Update all asset references
- Test deployment pipeline