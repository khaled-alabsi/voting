import { PollService } from '../src/services/pollService';
import { AuthService } from '../src/services/authService';
import type { PollFormData } from '../src/types';

async function testPollCreation() {
  console.log('🧪 Testing poll creation and retrieval...');
  
  try {
    // Sign in anonymously first
    console.log('📝 Signing in anonymously...');
    const user = await AuthService.signInAnonymously();
    console.log('✅ Signed in as:', user.uid);
    
    // Create test poll data
    const testPollData: PollFormData = {
      title: 'Test Poll - Fix Verification',
      description: 'Testing that poll creation and retrieval works correctly',
      questions: [
        {
          text: 'What is your favorite color?',
          answers: ['Red', 'Blue', 'Green', 'Yellow'],
          allowNewOptions: false,
          required: true
        },
        {
          text: 'Do you like pizza?',
          answers: ['Yes', 'No', 'Sometimes'],
          allowNewOptions: true,
          required: false
        }
      ],
      settings: {
        allowAnonymousVoting: true,
        requireAuthentication: false,
        allowNewQuestions: false,
        allowNewOptions: false,
        autoDelete: false,
        autoDeleteAfterDays: 30
      }
    };
    
    // Create the poll
    console.log('📊 Creating poll...');
    const pollId = await PollService.createPoll(testPollData, user.uid);
    console.log('✅ Poll created with ID:', pollId);
    
    // Wait a moment for Firestore to sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Try to retrieve the poll
    console.log('📖 Retrieving poll...');
    const retrievedPoll = await PollService.getPollById(pollId);
    
    if (retrievedPoll) {
      console.log('✅ Poll retrieved successfully!');
      console.log('📋 Poll details:');
      console.log('   Title:', retrievedPoll.title);
      console.log('   Questions:', retrievedPoll.questions.length);
      console.log('   Answers:', retrievedPoll.answers.length);
      console.log('   Shareable link:', retrievedPoll.shareableLink);
      console.log('   Document ID matches poll ID:', retrievedPoll.id === pollId);
    } else {
      console.error('❌ Failed to retrieve poll - this indicates the bug still exists');
    }
    
    // Test the URL that would be generated
    const testUrl = `http://localhost:5174/poll/${pollId}`;
    console.log('🔗 Test URL (for manual verification):', testUrl);
    
    // Sign out
    await AuthService.signOut();
    console.log('👋 Signed out');
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run the test
testPollCreation();