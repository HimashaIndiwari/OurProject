import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testRealAttendanceMarking() {
  console.log('🧪 Testing Real Attendance Marking with Email Notifications...\n');
  
  try {
    // Test data - you'll need to replace these with real IDs from your database
    const testData = {
      sessionId: 'YOUR_SESSION_ID_HERE', // Replace with a real session ID
      attendanceData: [
        {
          participantId: 'YOUR_PARTICIPANT_ID_HERE', // Replace with a real participant ID
          attended: true
        }
      ]
    };
    
    console.log('📋 Test Configuration:');
    console.log(`Session ID: ${testData.sessionId}`);
    console.log(`Participant ID: ${testData.attendanceData[0].participantId}`);
    console.log(`Attendance Status: ${testData.attendanceData[0].attended ? 'Present' : 'Absent'}`);
    console.log('');
    
    if (testData.sessionId === 'YOUR_SESSION_ID_HERE') {
      console.log('⚠️  Please update the test data with real IDs from your database:');
      console.log('1. Replace YOUR_SESSION_ID_HERE with a real session ID');
      console.log('2. Replace YOUR_PARTICIPANT_ID_HERE with a real participant ID');
      console.log('3. Make sure the participant has a valid email address');
      console.log('');
      console.log('You can find these IDs by:');
      console.log('- Checking your database for sessions and participants');
      console.log('- Looking at the browser network tab when marking attendance');
      console.log('- Checking the server logs for session and participant IDs');
      return;
    }
    
    console.log('📤 Sending attendance marking request...');
    
    // Make the request to the actual endpoint used by the frontend
    const response = await axios.put(
      'http://localhost:5000/api/coaches/attendance-only',
      testData,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('📊 Response Status:', response.status);
    console.log('📊 Response Data:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log('✅ Attendance marked successfully!');
      console.log('📧 Check your email inbox for attendance notification');
      console.log('📧 Look for emails with subject containing "Attendance Marked"');
    } else {
      console.log('❌ Attendance marking failed');
    }
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    
    if (error.response) {
      console.error('📊 Error Response Status:', error.response.status);
      console.error('📊 Error Response Data:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

// Run the test
testRealAttendanceMarking();

