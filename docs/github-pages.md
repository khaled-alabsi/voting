# GitHub Pages Configuration

## 🎯 Overview

This document explains how GitHub Pages is configured for the VotingApp, including setup, SPA routing support, and integration with GitHub Actions.

## 🔧 Repository Configuration

### Pages Settings

**Location**: Repository Settings → Pages

**Configuration:**
- **Source**: GitHub Actions ✅
- **Custom domain**: Not configured
- **Enforce HTTPS**: Enabled by default

### Why GitHub Actions Source?

**GitHub Actions vs Deploy from Branch:**

| Feature | GitHub Actions | Deploy from Branch |
|---------|---------------|-------------------|
| Build Process | ✅ Custom Vite build | ❌ No build process |
| Environment Variables | ✅ From secrets | ❌ Not supported |
| Asset Optimization | ✅ Full optimization | ❌ Basic serving |
| SPA Support | ✅ Custom routing | ❌ Limited support |
| Framework Support | ✅ React/Vite/etc | ❌ Static files only |

## 🌐 URL Structure

**Base URL**: `https://khaled-alabsi.github.io/voting/`

**Path configuration:**
- Repository: `khaled-alabsi/voting`
- GitHub Pages URL: `https://[username].github.io/[repository]/`
- Base path: `/voting/`

## 🛠️ SPA (Single Page Application) Support

### The Problem

GitHub Pages serves static files. When a user visits:
```
https://khaled-alabsi.github.io/voting/firebase-test
```

GitHub Pages looks for a physical file at `/voting/firebase-test/index.html`, which doesn't exist for React Router routes, resulting in a 404 error.

### The Solution

**Two-file SPA solution:**

#### 1. 404.html Redirect Handler

**File**: `public/404.html`

```html
<script type="text/javascript">
  var pathSegmentsToKeep = 1; // For /voting/ base path
  
  var l = window.location;
  l.replace(
    l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
    l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
    l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
    (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
    l.hash
  );
</script>
```

**What it does:**
1. Intercepts 404 errors
2. Extracts the attempted route
3. Redirects to main app with encoded route information

#### 2. Route Recovery Script

**File**: `index.html`

```html
<script type="text/javascript">
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
```

**What it does:**
1. Detects redirected routes from 404 handler
2. Decodes the route information
3. Restores correct URL using `history.replaceState`
4. Allows React Router to handle routing normally

### URL Transformation Example

**User visits:**
```
https://khaled-alabsi.github.io/voting/firebase-test
```

**Step 1 - 404 Handler:**
```
https://khaled-alabsi.github.io/voting/?/firebase-test
```

**Step 2 - Route Recovery:**
```
https://khaled-alabsi.github.io/voting/firebase-test
```

**Step 3 - React Router:**
Routes to `FirebaseTestPage` component

## ⚙️ Base URL Configuration

### Vite Configuration

**File**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/voting/' : '/',
})
```

**Environment-specific base URLs:**
- **Development**: `/` (localhost:5173)
- **Production**: `/voting/` (GitHub Pages)

### React Router Configuration

**File**: `src/App.tsx`

```typescript
<Router basename={import.meta.env.BASE_URL}>
  {/* Routes */}
</Router>
```

**How basename works:**
- Vite automatically sets `import.meta.env.BASE_URL` based on config
- Development: `BASE_URL = "/"`
- Production: `BASE_URL = "/voting/"`

## 🚀 Deployment Process

### Build Process

**Command**: `npm run build`

**What happens:**
1. Vite builds with production base URL
2. Assets get correct paths: `/voting/assets/index-[hash].js`
3. HTML references assets with correct base URL
4. Output goes to `./dist/` folder

### GitHub Actions Integration

**Workflow steps:**
1. Build app with `npm run build`
2. Upload `./dist/` as Pages artifact
3. Deploy artifact to GitHub Pages
4. Site becomes available at production URL

### Asset Handling

**Asset paths in production:**
```
CSS: /voting/assets/index-[hash].css
JS:  /voting/assets/index-[hash].js
SVG: /voting/vite.svg
```

**Why this works:**
- Vite automatically prefixes all asset paths with base URL
- GitHub Pages serves files from `/voting/` path
- Browser loads assets from correct URLs

## 🔍 Troubleshooting

### Common Issues

#### 1. Blank Page on Load

**Symptoms:**
- Main page loads but shows blank screen
- Console errors about failed asset loading

**Causes:**
- Incorrect base URL configuration
- Missing basename in Router

**Solutions:**
```typescript
// Check vite.config.ts
base: '/voting/' // Must match repository name

// Check App.tsx
<Router basename={import.meta.env.BASE_URL}>
```

#### 2. 404 on Route Navigation

**Symptoms:**
- Direct URL access returns 404
- Navigation within app works fine

**Causes:**
- Missing or incorrect 404.html
- Incorrect pathSegmentsToKeep value

**Solutions:**
```javascript
// In 404.html, adjust for repository path
var pathSegmentsToKeep = 1; // For /voting/ base path
```

#### 3. Asset Loading Errors

**Symptoms:**
```
GET https://khaled-alabsi.github.io/assets/index-[hash].js 404
```

**Causes:**
- Assets trying to load from wrong path
- Base URL not applied to assets

**Solutions:**
- Verify Vite base configuration
- Check build output in `./dist/`
- Ensure assets have `/voting/` prefix

### Debug Commands

**Local testing:**
```bash
# Build and preview locally
npm run build
npm run preview

# Check asset paths in build
ls -la dist/assets/
```

**Check deployment:**
```bash
# View build output
cat dist/index.html | grep assets

# Test 404 handling
curl -I https://khaled-alabsi.github.io/voting/nonexistent-route
```

## 📊 Performance Optimization

### Asset Optimization

**Vite optimizations:**
- ✅ Code splitting
- ✅ Asset minification
- ✅ Tree shaking
- ✅ Hash-based caching

**GitHub Pages caching:**
- ✅ Static asset caching
- ✅ CDN distribution
- ✅ GZIP compression

### Loading Performance

**Typical load times:**
- First visit: ~500ms-1s
- Subsequent visits: ~100-200ms (cached)

**Optimization strategies:**
- Vite automatically chunks large dependencies
- Assets cached with content-based hashes
- Progressive loading of route components

## 🔐 Security

### HTTPS Enforcement

**Automatic features:**
- GitHub Pages enforces HTTPS
- Automatic redirects from HTTP to HTTPS
- Valid SSL certificate provided

### Content Security

**Built-in protections:**
- Static file serving only
- No server-side code execution
- Standard web security headers

## 🔄 Updates and Maintenance

### Updating Configuration

**To change base path:**
1. Update repository name
2. Update `vite.config.ts` base URL
3. Update `404.html` pathSegmentsToKeep
4. Redeploy via GitHub Actions

**To add custom domain:**
1. Add CNAME record in DNS
2. Configure custom domain in Pages settings
3. Update base URL to `/`
4. Redeploy

### Monitoring

**Health checks:**
- Monitor GitHub Actions workflow status
- Check Pages deployment status in repository
- Test key routes after deployment

**Status page:**
- GitHub Pages status: https://status.github.com/