# VotingApp Technical Documentation

This folder contains comprehensive technical documentation for the VotingApp project, covering deployment, configuration, and architecture details.

## 📋 Documentation Index

### Deployment & CI/CD
- [GitHub Actions Workflow](./github-actions.md) - Complete CI/CD pipeline documentation
- [GitHub Pages Configuration](./github-pages.md) - Static site hosting setup
- [Environment Secrets](./secrets-management.md) - Secure configuration handling

### Frontend Architecture
- [React Router Configuration](./routing.md) - SPA routing and GitHub Pages compatibility
- [Vite Build Configuration](./vite-config.md) - Build system and asset handling
- [Tailwind CSS Setup](./styling.md) - Design system and styling approach

### Backend & Database
- [Firebase Configuration](./firebase-setup.md) - Database and authentication setup
- [Environment Variables](./environment-setup.md) - Local and production configuration

### Development
- [Local Development Setup](./development.md) - Getting started guide
- [Testing Strategy](./testing.md) - Firebase testing and validation
- [Troubleshooting](./troubleshooting.md) - Common issues and solutions

## 🚀 Quick Start for New Developers

1. **Clone and Setup**: See [Development Setup](./development.md)
2. **Configure Firebase**: Follow [Firebase Setup](./firebase-setup.md)
3. **Deploy**: Understand [GitHub Actions](./github-actions.md)
4. **Test**: Use [Testing Strategy](./testing.md)

## 🏗️ Architecture Overview

```
VotingApp
├── Frontend (React + TypeScript + Vite)
│   ├── Routing (React Router with GitHub Pages SPA support)
│   ├── Styling (Tailwind CSS v3 with custom gradients)
│   └── State Management (React hooks + Firebase Auth)
├── Backend (Firebase)
│   ├── Authentication (Anonymous + Email/Password)
│   ├── Database (Firestore with real-time updates)
│   └── Security Rules (User-based access control)
└── Deployment (GitHub Actions → GitHub Pages)
    ├── Build Pipeline (Node.js + Vite)
    ├── Secret Management (GitHub Secrets)
    └── Static Hosting (GitHub Pages with SPA routing)
```

## 🔧 Key Technologies

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS v3
- **Backend**: Firebase (Auth + Firestore)
- **Deployment**: GitHub Actions, GitHub Pages
- **Testing**: Custom Firebase test suite
- **Routing**: React Router with SPA GitHub Pages compatibility