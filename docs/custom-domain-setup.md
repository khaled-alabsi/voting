# Custom Domain Setup Guide for GitHub Pages

This guide explains how to configure a custom domain for your GitHub Pages React application, including all necessary code changes and DNS configuration.

## Overview

When switching from GitHub Pages default domain (`username.github.io/repository`) to a custom domain, several configuration changes are required to ensure proper functionality.

## Quick Reference

| Configuration | GitHub Pages Default | Custom Domain |
|---|---|---|
| **Domain** | `khaled-alabsi.github.io/voting` | `poll.leute.space` |
| **Vite Base** | `/voting/` | `/` |
| **404.html pathSegmentsToKeep** | `1` | `0` |
| **Router Basename** | `/voting/` | `/` |
| **Share URLs** | Hardcoded GitHub domain | Dynamic from config |

## Step 1: Update Application Configuration

### 1.1 Create Site Configuration File

Create `src/config/site.ts`:

```typescript
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
  domain: 'https://your-custom-domain.com', // 🔄 UPDATE THIS
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
```

### 1.2 Update Vite Configuration

Update `vite.config.ts`:

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Use root path for custom domain
  base: '/',
})
```

### 1.3 Update 404.html for Custom Domain

Update `public/404.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8">
    <title>VotingApp</title>
    <script type="text/javascript">
      // For custom domains, set pathSegmentsToKeep to 0
      var pathSegmentsToKeep = 0; // 🔄 CHANGED FROM 1 TO 0

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

### 1.4 Update Services to Use Configuration

Update `src/services/pollService.ts`:

```typescript
// Add import
import { getPollUrl } from '../config/site';

// Update shareableLink in createPoll method
const poll: Poll = {
  // ... other properties
  shareableLink: getPollUrl(pollId), // 🔄 CHANGED FROM window.location.origin
  // ... other properties
};
```

## Step 2: GitHub Repository Configuration

### 2.1 Enable GitHub Pages with Custom Domain

1. Go to your repository on GitHub
2. Navigate to: **Settings → Pages**
3. Under **Custom domain**, enter your domain:
   ```
   your-custom-domain.com
   ```
4. Click **Save**
5. GitHub will create a `CNAME` file in your repository

### 2.2 Verify CNAME File

Ensure the `CNAME` file in your repository root contains only:
```
your-custom-domain.com
```

## Step 3: DNS Configuration

### 3.1 Configure GitHub Pages with a Subdomain via Cloudflare

1. **GitHub Repository Setup**

   * Go to: `Settings → Pages` in your `voting` repo.
   * Under **Custom domain**, enter:

     ```
     pools.leute.com
     ```
   * Save → GitHub creates/updates a `CNAME` file in the repo containing:

     ```
     pools.leute.com
     ```

2. **Cloudflare DNS Setup**

   * Open your domain in Cloudflare.
   * Go to **DNS → Records**.
   * Add a new record:

     * **Type**: `CNAME`
     * **Name**: `pools`
     * **Target**: `khaled-alabsi.github.io`
     * **Proxy status**: set to **DNS only** (gray cloud) at first.

3. **SSL and HTTPS**

   * Wait for DNS propagation (minutes to a few hours).
   * Go back to GitHub Pages → check **Enforce HTTPS**.
   * Once it works, you can switch the Cloudflare record to proxied (orange cloud) if you want Cloudflare features (cache, firewall, etc.).

4. **Access**

   * Your site will be available at:

     ```
     https://pools.leute.com
     ```
   * The old GitHub URL (`https://khaled-alabsi.github.io/voting`) will redirect automatically.

### 3.2 Alternative DNS Providers

For other DNS providers, create a CNAME record:
- **Name**: `@` (for root domain) or `subdomain` (for subdomain)
- **Value**: `username.github.io`
- **TTL**: 3600 (or your provider's default)

## Step 4: Environment and Configuration Updates

### 4.1 Update Site Configuration

In `src/config/site.ts`, update the production domain:

```typescript
const productionConfig: SiteConfig = {
  domain: 'https://your-actual-domain.com', // 🔄 UPDATE THIS
  name: 'Your App Name',
  description: 'Your app description',
  // ... other config
};
```

### 4.2 Test Configuration

Create a test script to verify your configuration:

```typescript
// src/utils/configTest.ts
import { siteConfig, getPollUrl, getShareUrl } from '../config/site';

export const testConfiguration = () => {
  console.log('🔧 Site Configuration Test');
  console.log('Domain:', siteConfig.domain);
  console.log('Sample Poll URL:', getPollUrl('test-poll-id'));
  console.log('Sample Share URL:', getShareUrl('test-poll-id'));
  
  // Verify environment
  console.log('Environment:', import.meta.env.DEV ? 'Development' : 'Production');
  console.log('Base URL:', import.meta.env.BASE_URL);
};
```

## Step 5: Deployment and Testing

### 5.1 Deploy Changes

```bash
# Commit all changes
git add .
git commit -m "Configure custom domain: update base paths, 404.html, and share URLs"
git push origin main
```

### 5.2 Verify Deployment

1. Wait for GitHub Actions to complete
2. Check GitHub Pages deployment status
3. Test the following URLs:
   - `https://your-domain.com` (homepage)
   - `https://your-domain.com/poll/test-id` (direct poll access)
   - `https://your-domain.com/nonexistent-page` (404 redirect)

### 5.3 Test Share Functionality

1. Create a new poll
2. Check that the share URL uses your custom domain
3. Test sharing the URL in a new browser tab

## Troubleshooting

### Common Issues

1. **White Page/404 Errors**
   - Verify `vite.config.ts` has `base: '/'`
   - Check `404.html` has `pathSegmentsToKeep = 0`
   - Ensure CNAME file is correct

2. **Assets Not Loading**
   - Check browser network tab for 404 errors
   - Verify GitHub Actions deployment completed successfully
   - Clear browser cache

3. **Share URLs Still Use Old Domain**
   - Verify site configuration is imported correctly
   - Check that `getPollUrl` is used instead of `window.location.origin`
   - Clear application data and test with new poll

4. **DNS Not Resolving**
   - Use `dig` or `nslookup` to verify DNS propagation
   - Wait up to 24 hours for full propagation
   - Check DNS provider configuration

### Verification Commands

```bash
# Check DNS resolution
nslookup your-domain.com

# Check CNAME record
dig your-domain.com CNAME

# Test HTTPS certificate
curl -I https://your-domain.com
```

## Rollback Plan

If you need to revert to GitHub Pages default domain:

1. **Remove Custom Domain**
   ```bash
   # Delete CNAME file
   rm CNAME
   git add . && git commit -m "Remove custom domain" && git push
   ```

2. **Restore Configuration**
   ```typescript
   // vite.config.ts
   base: process.env.NODE_ENV === 'production' ? '/repository-name/' : '/',
   
   // 404.html
   var pathSegmentsToKeep = 1;
   
   // site.ts
   domain: 'https://username.github.io/repository-name',
   ```

## Best Practices

1. **Always test in development first**
2. **Keep configuration centralized in `site.ts`**
3. **Use environment-specific configs**
4. **Document DNS changes for your team**
5. **Monitor site after domain changes**
6. **Keep backup of working configuration**

## Checklist

Before going live with custom domain:

- [ ] Updated `src/config/site.ts` with correct domain
- [ ] Changed `vite.config.ts` base to `'/'`
- [ ] Updated `404.html` pathSegmentsToKeep to `0`
- [ ] Modified share URL generation to use config
- [ ] Set up DNS CNAME record
- [ ] Configured GitHub Pages custom domain
- [ ] Enabled HTTPS enforcement
- [ ] Tested all major routes
- [ ] Verified share functionality
- [ ] Checked asset loading
- [ ] Confirmed 404 redirects work

## Additional Resources

- [GitHub Pages Custom Domain Documentation](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
- [Cloudflare DNS Documentation](https://developers.cloudflare.com/dns/)
- [SPA GitHub Pages Setup](https://github.com/rafgraph/spa-github-pages)

---

**Note**: Replace `your-domain.com`, `username`, and `repository-name` with your actual values throughout this guide.