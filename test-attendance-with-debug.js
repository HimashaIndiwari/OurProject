import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testAttendanceWithDebug() {
  console.log('🧪 TESTING ATTENDANCE MARKING WITH DEBUG INFO...\n');
  
  console.log('📋 Step-by-Step Debug Process:');
  console.log('1. First, let\'s test if your server is running');
  console.log('2. Then test the attendance endpoint');
  console.log('3. Check what happens when you mark attendance');
  console.log('');
  
  // Step 1: Test server connectivity
  console.log('🔍 Step 1: Testing server connectivity...');
  try {
    const response = await axios.get('http://localhost:5000/api/health', { timeout: 5000 });
    console.log('✅ Server is running');
  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.log('❌ Server not running - please start your server first!');
      console.log('   Run: npm start or npm run dev');
      return;
    } else {
      console.log('⚠️  Server might be running but health endpoint not available');
    }
  }
  
  // Step 2: Test attendance endpoint
  console.log('\n🔍 Step 2: Testing attendance endpoint...');
  try {
    const response = await axios.put(
      'http://localhost:5000/api/coaches/attendance-only',
      {
        sessionId: '507f1f77bcf86cd799439011', // Dummy ID
        attendanceData: [{ participantId: '507f1f77bcf86cd799439012', attended: true }]
      },
      { timeout: 5000 }
    );
    console.log('❌ Unexpected success with dummy data');
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log('✅ Attendance endpoint is working (404 expected for dummy data)');
    } else {
      console.log('❌ Attendance endpoint error:', error.message);
    }
  }
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Make sure your server is running');
  console.log('2. Go to your coach dashboard');
  console.log('3. Mark attendance for a session');
  console.log('4. Watch your SERVER console for these messages:');
  console.log('   - "=== ATTENDANCE ONLY (NO COACH DATA) ==="');
  console.log('   - "📧 Sending attendance notification emails..."');
  console.log('   - "✅ Professional attendance notification sent to [email]"');
  console.log('   - OR error messages if something goes wrong');
  console.log('');
  console.log('5. Check your email inbox for attendance notifications');
  console.log('');
  console.log('🔧 If you still don\'t receive emails, the issue might be:');
  console.log('   - Customers don\'t have email addresses in the database');
  console.log('   - Participant IDs don\'t match customer IDs');
  console.log('   - Email credentials are incorrect');
  console.log('   - Emails are going to spam folder');
}

testAttendanceWithDebug();

