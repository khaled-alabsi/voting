# React App Setup Guide for GitHub Pages

This guide provides a comprehensive setup for creating a React app with routing, GitHub Actions deployment, and proper secret management to avoid common pitfalls like white pages and sub-URL issues.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Routing Configuration](#routing-configuration)
3. [GitHub Pages Configuration](#github-pages-configuration)
4. [GitHub Actions Setup](#github-actions-setup)
5. [Secret Management with GH CLI](#secret-management-with-gh-cli)
6. [Error Handling](#error-handling)
7. [Troubleshooting](#troubleshooting)

## Initial Setup

### 1. Create React App with TypeScript and Vite

```bash
npm create vite@latest my-app -- --template react-ts
cd my-app
npm install
```

### 2. Install Essential Dependencies

```bash
# Routing
npm install react-router-dom
npm install @types/react-router-dom --save-dev

# UI Framework (Tailwind CSS)
npm install -D tailwindcss@^3.4.0 postcss autoprefixer
npx tailwindcss init -p

# State Management (if needed)
npm install zustand
# or
npm install @reduxjs/toolkit react-redux
```

### 3. Configure Tailwind CSS

Update `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

Add to `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Routing Configuration

### 1. Install React Router

```bash
npm install react-router-dom
```

### 2. Configure Router for GitHub Pages

Create `src/router.tsx`:
```tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from './App';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import NotFoundPage from './pages/NotFoundPage';

// Use the repository name as base URL for GitHub Pages
const basename = import.meta.env.PROD ? '/repository-name' : '';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <NotFoundPage />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      // Add more routes here
    ],
  },
], { basename });

export default function Router() {
  return <RouterProvider router={router} />;
}
```

### 3. Update Main App

Update `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
);
```

Update `src/App.tsx`:
```tsx
import { Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}

export default App;
```

## GitHub Pages Configuration

### 1. Configure Vite for GitHub Pages

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: process.env.NODE_ENV === 'production' ? '/repository-name/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
});
```

### 2. Create 404.html for SPA Routing

Create `public/404.html`:
```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>Redirecting...</title>
    <script type="text/javascript">
      // Redirect to index.html with the current path as a query parameter
      var pathSegmentsToKeep = 1; // Change this if using a custom domain
      var l = window.location;
      l.replace(
        l.protocol + '//' + l.hostname + (l.port ? ':' + l.port : '') +
        l.pathname.split('/').slice(0, 1 + pathSegmentsToKeep).join('/') + '/?/' +
        l.pathname.slice(1).split('/').slice(pathSegmentsToKeep).join('/').replace(/&/g, '~and~') +
        (l.search ? '&' + l.search.slice(1).replace(/&/g, '~and~') : '') +
        l.hash
      );
    </script>
  </head>
  <body>
  </body>
</html>
```

### 3. Handle Redirects in Index

Add to `public/index.html` in the `<head>` section:
```html
<script type="text/javascript">
  // Handle redirected routes for SPA
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

## GitHub Actions Setup

### 1. Create Workflow File

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build-and-deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Create environment file
        run: |
          echo "VITE_FIREBASE_API_KEY=${{ secrets.VITE_FIREBASE_API_KEY }}" >> .env
          echo "VITE_FIREBASE_AUTH_DOMAIN=${{ secrets.VITE_FIREBASE_AUTH_DOMAIN }}" >> .env
          echo "VITE_FIREBASE_PROJECT_ID=${{ secrets.VITE_FIREBASE_PROJECT_ID }}" >> .env
          echo "VITE_FIREBASE_STORAGE_BUCKET=${{ secrets.VITE_FIREBASE_STORAGE_BUCKET }}" >> .env
          echo "VITE_FIREBASE_MESSAGING_SENDER_ID=${{ secrets.VITE_FIREBASE_MESSAGING_SENDER_ID }}" >> .env
          echo "VITE_FIREBASE_APP_ID=${{ secrets.VITE_FIREBASE_APP_ID }}" >> .env
          echo "VITE_FIREBASE_MEASUREMENT_ID=${{ secrets.VITE_FIREBASE_MEASUREMENT_ID }}" >> .env

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2. Enable GitHub Pages

1. Go to repository Settings → Pages
2. Select "GitHub Actions" as source
3. Save the configuration

## Secret Management with GH CLI

### 1. Install GH CLI

```bash
# macOS
brew install gh

# Windows
winget install --id GitHub.cli

# Linux
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

### 2. Authenticate with GitHub

```bash
gh auth login
# Follow the prompts to authenticate
```

### 3. Set Repository Secrets

```bash
# Navigate to your repository directory
cd /path/to/your/repository

# Set Firebase secrets (replace with your actual values)
gh secret set VITE_FIREBASE_API_KEY --body "your-api-key"
gh secret set VITE_FIREBASE_AUTH_DOMAIN --body "your-project.firebaseapp.com"
gh secret set VITE_FIREBASE_PROJECT_ID --body "your-project-id"
gh secret set VITE_FIREBASE_STORAGE_BUCKET --body "your-project.appspot.com"
gh secret set VITE_FIREBASE_MESSAGING_SENDER_ID --body "123456789"
gh secret set VITE_FIREBASE_APP_ID --body "1:123456789:web:abcdef"
gh secret set VITE_FIREBASE_MEASUREMENT_ID --body "G-XXXXXXXXXX"

# Verify secrets are set
gh secret list
```

### 4. Environment Configuration

Create `.env.example`:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
```

Create `.env` (add to `.gitignore`):
```bash
# Copy from .env.example and fill with actual values
cp .env.example .env
```

## Error Handling

### 1. Create Error Boundary Component

Create `src/components/ErrorBoundary.tsx`:
```tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                Something went wrong
              </h2>
              <p className="text-gray-600 mb-4">
                An unexpected error occurred. Please try refreshing the page.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500">
                    Error Details
                  </summary>
                  <pre className="mt-2 text-xs text-red-600 whitespace-pre-wrap">
                    {this.state.error?.toString()}
                    {this.state.errorInfo?.componentStack}
                  </pre>
                </details>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

### 2. Wrap App with Error Boundary

Update `src/main.tsx`:
```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './router';
import { ErrorBoundary } from './components/ErrorBoundary';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Router />
    </ErrorBoundary>
  </React.StrictMode>,
);
```

### 3. Create 404 Page Component

Create `src/pages/NotFoundPage.tsx`:
```tsx
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Page Not Found
        </h2>
        <p className="text-gray-600 mb-8">
          The page you're looking for doesn't exist.
        </p>
        <Link
          to="/"
          className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}
```

## Troubleshooting

### Common Issues and Solutions

1. **White Page on GitHub Pages**
   - Check that `vite.config.ts` has the correct `base` path
   - Ensure `404.html` is present in the `public` folder
   - Verify that the router has the correct `basename`

2. **Routes Not Working on Refresh**
   - Make sure `404.html` redirect script is correct
   - Check that the repository name matches in all configurations

3. **Environment Variables Not Loading**
   - Verify secrets are set using `gh secret list`
   - Check that variable names start with `VITE_`
   - Ensure the GitHub Actions workflow creates the `.env` file

4. **Build Failures**
   - Check TypeScript errors: `npm run type-check`
   - Verify all dependencies are installed: `npm ci`
   - Check for unused imports and variables

5. **Firebase Connection Issues**
   - Verify all Firebase config variables are set
   - Check Firebase project settings match the environment variables
   - Ensure Firebase rules allow the necessary operations

### Deployment Checklist

- [ ] Repository name matches in `vite.config.ts` and router
- [ ] All secrets are set using GH CLI
- [ ] GitHub Pages is enabled with GitHub Actions source
- [ ] `404.html` is in the public folder
- [ ] Error boundary is implemented
- [ ] TypeScript compilation passes
- [ ] All environment variables are prefixed with `VITE_`
- [ ] Firebase configuration is correct
- [ ] Routes work both in development and production

### Useful Commands

```bash
# Check if secrets are set
gh secret list

# View GitHub Actions run logs
gh run list
gh run view [run-id]
gh run view [run-id] --log-failed

# Build and preview locally
npm run build
npm run preview

# Type checking
npm run type-check

# Deploy manually (if needed)
npm run build
gh workflow run deploy.yml
```

This setup guide should help you avoid the common pitfalls we encountered and ensure a smooth deployment process for future React applications.