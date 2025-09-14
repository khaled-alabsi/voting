import { Timestamp } from 'firebase/firestore';
import { PollService } from '../services/pollService';
import { AuthService } from '../services/authService';
import type { PollFormData, Poll, Question, Answer } from '../types';

// Dummy data for testing
const dummyPolls: PollFormData[] = [
  {
    title: "What's your favorite programming language?",
    description: "Help us understand the developer community preferences",
    questions: [
      {
        text: "Which programming language do you use most frequently?",
        answers: ["JavaScript", "Python", "Java", "TypeScript", "Go", "Rust"],
        allowNewOptions: true,
        required: true
      },
      {
        text: "What's your experience level?",
        answers: ["Beginner (0-2 years)", "Intermediate (3-5 years)", "Senior (6+ years)"],
        allowNewOptions: false,
        required: true
      }
    ],
    settings: {
      allowAnonymousVoting: true,
      requireAuthentication: false,
      allowNewQuestions: false,
      allowNewOptions: true,
      autoDelete: false,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)) // 7 days from now
    }
  },
  {
    title: "Team Lunch Preferences",
    description: "Let's decide where to go for our team lunch this Friday!",
    questions: [
      {
        text: "What type of cuisine do you prefer?",
        answers: ["Italian", "Mexican", "Asian", "American", "Mediterranean"],
        allowNewOptions: true,
        required: true
      },
      {
        text: "What's your budget preference?",
        answers: ["Budget-friendly ($10-15)", "Moderate ($16-25)", "Premium ($26+)"],
        allowNewOptions: false,
        required: true
      },
      {
        text: "Any dietary restrictions?",
        answers: ["None", "Vegetarian", "Vegan", "Gluten-free", "Other"],
        allowNewOptions: true,
        required: false
      }
    ],
    settings: {
      allowAnonymousVoting: false,
      requireAuthentication: true,
      allowNewQuestions: false,
      allowNewOptions: true,
      autoDelete: true,
      autoDeleteAfterDays: 3,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)) // 3 days from now
    }
  },
  {
    title: "Movie Night Selection",
    description: "Vote for what movie we should watch for our next movie night!",
    questions: [
      {
        text: "What genre are you in the mood for?",
        answers: ["Action", "Comedy", "Drama", "Horror", "Sci-Fi", "Romance"],
        allowNewOptions: true,
        required: true
      },
      {
        text: "Preferred movie length?",
        answers: ["Short (< 90 min)", "Medium (90-120 min)", "Long (120+ min)"],
        allowNewOptions: false,
        required: true
      }
    ],
    settings: {
      allowAnonymousVoting: true,
      requireAuthentication: false,
      allowNewQuestions: true,
      allowNewOptions: true,
      autoDelete: false,
      expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)) // 5 days from now
    }
  }
];

export class FirebaseTestService {
  static async testConnection(): Promise<void> {
    try {
      console.log('🔍 Testing Firebase connection...');
      
      // Test 1: Test basic Firebase configuration first
      console.log('\n📝 Step 1: Testing Firebase configuration...');
      await this.testFirebaseConfig();
      
      // Test 2: Create a test user (anonymous)
      console.log('\n📝 Step 2: Testing authentication...');
      const user = await AuthService.signInAnonymously();
      console.log('✅ Authentication successful!');
      console.log('👤 User ID:', user.uid);
      console.log('🔒 Is Anonymous:', user.isAnonymous);
      
      // Test 3: Test Firestore connection
      console.log('\n📝 Step 3: Testing Firestore connection...');
      await this.testFirestore();
      
      // Test 4: Create dummy polls
      console.log('\n📝 Step 4: Creating dummy polls...');
      const createdPolls: string[] = [];
      
      for (let i = 0; i < dummyPolls.length; i++) {
        const pollData = dummyPolls[i];
        console.log(`\n📊 Creating poll ${i + 1}: "${pollData.title}"`);
        
        const pollId = await PollService.createPoll(pollData, user.uid);
        createdPolls.push(pollId);
        
        console.log(`✅ Poll created with ID: ${pollId}`);
        console.log(`📊 Questions: ${pollData.questions.length}`);
        console.log(`🎯 Total answers: ${pollData.questions.reduce((sum, q) => sum + q.answers.length, 0)}`);
      }
      
      // Test 5: Retrieve and display created polls
      console.log('\n📝 Step 5: Retrieving created polls...');
      
      for (const pollId of createdPolls) {
        const poll = await PollService.getPollById(pollId);
        if (poll) {
          console.log(`\n📊 Poll: ${poll.title}`);
          console.log(`📝 Description: ${poll.description}`);
          console.log(`🔗 Shareable Link: ${poll.shareableLink}`);
          console.log(`👥 Creator: ${poll.creatorId}`);
          console.log(`📅 Created: ${poll.createdAt.toDate().toLocaleString()}`);
          console.log(`⚙️ Settings:`);
          console.log(`   - Anonymous voting: ${poll.settings.allowAnonymousVoting}`);
          console.log(`   - Require auth: ${poll.settings.requireAuthentication}`);
          console.log(`   - Allow new options: ${poll.settings.allowNewOptions}`);
          console.log(`   - Expires: ${poll.settings.expiresAt?.toDate().toLocaleString() || 'Never'}`);
          
          console.log(`❓ Questions (${poll.questions.length}):`);
          poll.questions.forEach((question: Question, index: number) => {
            console.log(`   ${index + 1}. ${question.text}`);
            const questionAnswers = poll.answers.filter((a: Answer) => a.questionId === question.id);
            questionAnswers.forEach((answer: Answer, answerIndex: number) => {
              console.log(`      ${String.fromCharCode(97 + answerIndex)}. ${answer.text}`);
            });
          });
        }
      }
      
      // Test 6: Test voting functionality
      console.log('\n📝 Step 6: Testing voting functionality...');
      
      if (createdPolls.length > 0) {
        const testPoll = await PollService.getPollById(createdPolls[0]);
        if (testPoll && testPoll.questions.length > 0) {
          const firstQuestion = testPoll.questions[0];
          const firstAnswer = testPoll.answers.find((a: Answer) => a.questionId === firstQuestion.id);
          
          if (firstAnswer) {
            console.log(`🗳️  Casting a test vote...`);
            console.log(`   Poll: ${testPoll.title}`);
            console.log(`   Question: ${firstQuestion.text}`);
            console.log(`   Answer: ${firstAnswer.text}`);
            
            await PollService.submitVote(testPoll.id, firstQuestion.id, firstAnswer.id, user.uid);
            console.log('✅ Vote submitted successfully!');
            
            // Get poll statistics
            const stats = await PollService.calculatePollStats(testPoll.id);
            console.log(`📊 Poll Statistics:`);
            console.log(`   - Total votes: ${stats.totalVotes}`);
            console.log(`   - Unique voters: ${stats.uniqueVoters}`);
            console.log(`   - Average time to vote: ${stats.averageTimeToVote}ms`);
          }
        }
      }
      
      // Test 7: List all polls by creator (simplified to avoid index requirement)
      console.log('\n📝 Step 7: Verifying created polls...');
      console.log(`📋 Successfully created ${createdPolls.length} polls:`);
      createdPolls.forEach((pollId, index) => {
        console.log(`   ${index + 1}. Poll ID: ${pollId}`);
      });
      
      // Note about the index
      console.log('\n📝 Note: Advanced queries require Firestore indexes.');
      console.log('🔗 To enable full query functionality, create the required index at:');
      console.log('   Firebase Console → Firestore → Indexes');
      
      console.log('\n🎉 All tests completed successfully!');
      console.log('🔥 Firebase connection is working perfectly!');
      console.log(`📊 Created ${createdPolls.length} test polls`);
      console.log(`🗳️  Submitted 1 test vote`);
      
      // Sign out
      await AuthService.signOut();
      console.log('👋 Signed out successfully');
      
    } catch (error) {
      console.error('❌ Firebase test failed:', error);
      if (error instanceof Error) {
        console.error('📝 Error message:', error.message);
        console.error('📚 Error stack:', error.stack);
        
        // Provide specific guidance based on error type
        await this.handleFirebaseError(error);
      }
    }
  }
  
  static async testFirebaseConfig(): Promise<void> {
    await import('../lib/firebase');
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Firestore instance created');
  }
  
  static async testFirestore(): Promise<void> {
    const { collection, addDoc, getDocs, deleteDoc, doc, Timestamp } = await import('firebase/firestore');
    const { db } = await import('../lib/firebase');
    
    // Create a test document
    const testData = {
      message: 'Hello from Firebase test!',
      timestamp: Timestamp.now(),
      testId: Math.random().toString(36).substring(7)
    };
    
    console.log('📝 Creating test document in Firestore...');
    const docRef = await addDoc(collection(db, 'test'), testData);
    console.log('✅ Test document created with ID:', docRef.id);
    
    // Read test documents
    console.log('📖 Reading test documents...');
    const querySnapshot = await getDocs(collection(db, 'test'));
    console.log(`✅ Found ${querySnapshot.size} test documents`);
    
    // Clean up test documents
    console.log('🧹 Cleaning up test documents...');
    const deletePromises: Promise<void>[] = [];
    querySnapshot.forEach((document) => {
      deletePromises.push(deleteDoc(doc(db, 'test', document.id)));
    });
    await Promise.all(deletePromises);
    console.log('✅ Test documents cleaned up');
  }
  
  static async handleFirebaseError(error: Error): Promise<void> {
    const errorCode = (error as { code?: string }).code;
    
    console.log('\n🔧 Firebase Configuration Guide:');
    
    switch (errorCode) {
      case 'auth/configuration-not-found':
        console.log('❌ Firebase Authentication is not properly configured.');
        console.log('\n📋 To fix this, you need to:');
        console.log('1. 🌐 Go to the Firebase Console: https://console.firebase.google.com');
        console.log('2. 📂 Select your project: voting-946b7');
        console.log('3. 🔐 Click on "Authentication" in the left sidebar');
        console.log('4. 🚀 Click "Get started" if not already set up');
        console.log('5. 📝 Go to "Sign-in method" tab');
        console.log('6. ✅ Enable "Anonymous" authentication');
        console.log('   - Click on "Anonymous"');
        console.log('   - Toggle "Enable"');
        console.log('   - Click "Save"');
        console.log('7. 📧 Optionally enable "Email/Password" for regular users');
        console.log('\n🔄 After enabling Authentication, try the test again.');
        break;
        
      case 'permission-denied':
        console.log('❌ Firestore Security Rules are blocking access.');
        console.log('\n📋 To fix this, you need to:');
        console.log('1. 🌐 Go to the Firebase Console');
        console.log('2. 📂 Select your project');
        console.log('3. 🗄️ Click on "Firestore Database"');
        console.log('4. 🛡️ Go to "Rules" tab');
        console.log('5. 📝 Update rules to allow read/write access');
        console.log('\n📄 For development, you can use these rules:');
        console.log('```');
        console.log('rules_version = "2";');
        console.log('service cloud.firestore {');
        console.log('  match /databases/{database}/documents {');
        console.log('    match /{document=**} {');
        console.log('      allow read, write: if true; // Allow all access for development');
        console.log('    }');
        console.log('  }');
        console.log('}');
        console.log('```');
        console.log('\n⚠️ WARNING: These rules allow all access. Use proper security rules in production!');
        break;
        
      case 'invalid-api-key':
        console.log('❌ Invalid Firebase API key.');
        console.log('\n📋 To fix this:');
        console.log('1. 🔍 Check your .env file');
        console.log('2. ✅ Verify VITE_FIREBASE_API_KEY is correct');
        console.log('3. 🌐 Get the correct key from Firebase Console > Project Settings');
        break;
        
      default:
        console.log('❌ Unknown Firebase error.');
        console.log('\n📋 General troubleshooting:');
        console.log('1. 🔍 Check your .env file has all required variables');
        console.log('2. 🌐 Verify project configuration in Firebase Console');
        console.log('3. 🔄 Try refreshing the page');
        console.log('4. 📝 Check Firebase Console for any service outages');
    }
    
    console.log('\n📞 Need more help?');
    console.log('- 📚 Firebase Documentation: https://firebase.google.com/docs');
    console.log('- 🔐 Authentication Setup: https://firebase.google.com/docs/auth/web/start');
    console.log('- 🗄️ Firestore Setup: https://firebase.google.com/docs/firestore/quickstart');
  }
  
  static async clearTestData(): Promise<void> {
    try {
      console.log('🧹 Clearing test data...');
      
      // Sign in as anonymous user
      const user = await AuthService.signInAnonymously();
      
      // Get all polls by this user
      const polls = await PollService.getPollsByCreator(user.uid);
      
      console.log(`🗑️  Found ${polls.length} polls to delete`);
      
      for (const poll of polls) {
        await PollService.deletePoll(poll.id);
        console.log(`✅ Deleted poll: ${poll.title}`);
      }
      
      console.log('🎉 Test data cleared successfully!');
      
      await AuthService.signOut();
      
    } catch (error) {
      console.error('❌ Failed to clear test data:', error);
    }
  }
}

// Export for use in other files
export { dummyPolls };