# Voting App

A static React application for creating and sharing voting pools with Firebase backend. Built for GitHub Pages hosting.

## Features

- **Create Custom Voting Pools**: Set up polls with customizable questions and multiple answer choices
- **Shareable Links**: Generate unique links for each voting pool
- **Anonymous Voting**: Support for anonymous participation
- **Real-time Analytics**: Track votes per option, voting patterns, and timing statistics
- **Flexible Pool Management**: 
  - Add/modify questions and answers
  - Set automatic expiry dates and times
  - Delete pools when needed
  - Export poll results as JSON
- **Timer Display**: Shows countdown until voting closes
- **Responsive Design**: Works on desktop and mobile devices
- **GitHub Pages Deployment**: Static hosting ready

## Tech Stack

- **Frontend**: React 18 with Vite
- **Styling**: Tailwind CSS
- **Icons**: Heroicons
- **State Management**: React Context + useReducer
- **Routing**: React Router DOM
- **Forms**: React Hook Form
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth (optional)
- **Deployment**: GitHub Pages via GitHub Actions

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Firebase project (for backend)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/khaled-alabsi/voting.git
   cd voting
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase:
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com)
   - Enable Firestore Database
   - Configure environment variables (see Environment Variables section below)
   - Set up Firestore security rules

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to the local development URL

### Environment Variables

This application uses environment variables for Firebase configuration to keep sensitive credentials secure.

#### Local Development Setup

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Firebase project credentials in the `.env` file:
   ```bash
   VITE_FIREBASE_API_KEY=your-actual-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
   VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef123456789012
   VITE_FIREBASE_MEASUREMENT_ID=G-XXXXXXXXXX
   ```

3. Get these values from your Firebase project:
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Select your project
   - Go to Project Settings (gear icon) → General tab
   - Scroll down to "Your apps" section
   - Copy the config values from the Firebase SDK snippet

#### CI/CD Setup with GitHub Secrets

For deployment via GitHub Actions, set up the following secrets in your GitHub repository:

1. Go to your repository → Settings → Secrets and variables → Actions
2. Add the following repository secrets:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_FIREBASE_MEASUREMENT_ID`

**Important**: 
- Never commit your `.env` file to version control
- The `.env` file is already excluded in `.gitignore`
- Use the `.env.example` file as a template for required variables

### Firestore Security Rules

Set up basic security rules in Firebase Console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /pools/{document} {
      allow read, write: if true; // Adjust security as needed
    }
  }
}
```

## Deployment to GitHub Pages

The app is configured for automatic deployment to GitHub Pages using GitHub Actions.

1. Push your code to the `main` branch
2. GitHub Actions will automatically build and deploy to GitHub Pages
3. Your app will be available at: `https://your-username.github.io/voting/`

### Manual Deployment

To deploy manually:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Usage

### Creating a Pool

1. Click "Create New Pool" on the homepage
2. Fill in the pool title and optional description
3. Configure settings:
   - Allow anonymous voting (default: enabled)
   - Set automatic expiry date/time (optional)
4. Add questions and answer options
5. Click "Create Pool" to generate the shareable link

### Managing a Pool

1. After creating a pool, you'll be redirected to the management page
2. Copy the shareable link to distribute to voters
3. Monitor real-time voting statistics
4. Update expiry settings or deactivate the pool
5. Export results as JSON when complete
6. Delete the pool when no longer needed

### Voting

1. Open the shared voting link
2. Read the questions and select your answers
3. Submit your vote
4. View results (if allowed by pool settings)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes and commit: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).

## Support

For issues and questions, please open an issue on the GitHub repository.
