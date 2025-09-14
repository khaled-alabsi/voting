# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

# Voting App

A comprehensive web application for creating and managing voting polls with real-time analytics. Built with React, TypeScript, Firebase, and Tailwind CSS.

## Features

### 🗳️ Poll Creation and Sharing
- Create polls with multiple questions and customizable answer options
- Generate unique shareable links for each poll
- Customizable poll settings (anonymous voting, authentication requirements, etc.)

### 👥 Anonymous & Authenticated Voting
- Support for both anonymous and authenticated users
- Option to require authentication for specific polls
- Real-time vote tracking and updates

### 📊 Advanced Analytics
- Time-to-vote metrics for each question and answer
- Real-time voting pattern visualization
- Comprehensive statistics dashboard with charts
- Answer distribution analysis with pie charts
- Voting trends over time

### ⏰ Timer Features
- Countdown timers for poll expiration
- Automatic poll closure after expiration
- Auto-delete functionality with customizable delays

### 🛠️ Poll Management
- Dashboard for poll creators to manage their polls
- Export poll data in JSON format
- Delete polls with confirmation
- View detailed analytics for each poll

### 🎨 Modern UI/UX
- Responsive design for all screen sizes
- Clean, intuitive interface built with Tailwind CSS
- Real-time updates without page refreshes
- Smooth animations and transitions

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **Charts**: Recharts
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (Static Site)

## Getting Started

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore enabled

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/voting.git
cd voting
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with your Firebase configuration:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

4. Start the development server:
```bash
npm run dev
```

5. Open [http://localhost:5174](http://localhost:5174) in your browser.

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory, ready for static hosting.

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
