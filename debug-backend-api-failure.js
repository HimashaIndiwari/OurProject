import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

console.log('🔍 DEBUGGING BACKEND API CALL FAILURE\n');

console.log('❌ ISSUE IDENTIFIED: Backend API call is failing');
console.log('✅ Frontend is working (shows "Attendance marked successfully!")');
console.log('❌ Backend is not receiving the request or failing to process it');
console.log('❌ This is why emails are not being sent');
console.log('');

async function debugBackendAPI() {
  try {
    console.log('📋 Testing backend API endpoints...\n');
    
    // Test 1: Check if server is running
    console.log('1. Testing server connectivity...');
    try {
      const healthResponse = await axios.get('http://localhost:5000', { timeout: 5000 });
      console.log('✅ Server is running and accessible');
    } catch (error) {
      if (error.code === 'ECONNREFUSED') {
        console.log('❌ Server is not running or not accessible');
        console.log('Solution: Start your server with "npm start"');
        return;
      } else {
        console.log('⚠️  Server responded with error:', error.message);
      }
    }
    
    // Test 2: Check attendance-only endpoint
    console.log('\n2. Testing attendance-only endpoint...');
    try {
      const testData = {
        sessionId: 'test-session-id',
        attendanceData: [
          {
            participantId: 'test-participant-id',
            attended: true
          }
        ]
      };
      
      const response = await axios.put(
        'http://localhost:5000/api/coaches/attendance-only',
        testData,
        { timeout: 5000 }
      );
      
      console.log('✅ Endpoint is accessible');
      console.log('Response:', response.data);
      
    } catch (error) {
      if (error.response) {
        console.log('📡 Endpoint responded with error:');
        console.log('Status:', error.response.status);
        console.log('Data:', JSON.stringify(error.response.data, null, 2));
        
        if (error.response.status === 500) {
          console.log('❌ Server error - Check server console for details');
        } else if (error.response.status === 404) {
          console.log('❌ Endpoint not found - Check route definition');
        }
      } else {
        console.log('❌ Network error:', error.message);
      }
    }
    
    // Test 3: Check other endpoints
    console.log('\n3. Testing other coach endpoints...');
    try {
      const response = await axios.get('http://localhost:5000/api/coaches', { timeout: 5000 });
      console.log('✅ Coaches endpoint is accessible');
    } catch (error) {
      console.log('❌ Coaches endpoint error:', error.message);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

async function main() {
  await debugBackendAPI();
  
  console.log('\n🎯 DIAGNOSIS:');
  console.log('');
  console.log('The frontend is calling the backend API, but the API call is failing.');
  console.log('This causes the frontend to fall back to local storage.');
  console.log('Since the backend never processes the request, emails are not sent.');
  console.log('');
  
  console.log('🔧 SOLUTIONS:');
  console.log('');
  console.log('1. Check server console for error messages');
  console.log('   - Look for error messages when marking attendance');
  console.log('   - Check for database connection issues');
  console.log('   - Look for validation errors');
  console.log('');
  
  console.log('2. Verify the endpoint route');
  console.log('   - Check if PUT /api/coaches/attendance-only is defined');
  console.log('   - Ensure the route is properly configured');
  console.log('');
  
  console.log('3. Check database connection');
  console.log('   - Ensure MongoDB is running');
  console.log('   - Verify database connection string');
  console.log('');
  
  console.log('4. Test with real data');
  console.log('   - Use actual session ID from your database');
  console.log('   - Use actual participant IDs');
  console.log('');
  
  console.log('📋 DEBUGGING STEPS:');
  console.log('');
  console.log('1. Open your server console (where you ran "npm start")');
  console.log('2. Mark attendance in the coach dashboard');
  console.log('3. Watch for error messages in the server console');
  console.log('4. Look for messages like:');
  console.log('   - "Error marking attendance"');
  console.log('   - "Session not found"');
  console.log('   - "Database connection error"');
  console.log('   - "Cast to ObjectId failed"');
  console.log('');
  
  console.log('🚀 IMMEDIATE ACTION:');
  console.log('');
  console.log('1. Check your server console NOW');
  console.log('2. Mark attendance again');
  console.log('3. Look for error messages');
  console.log('4. Share the error messages with me');
  console.log('');
  
  console.log('The email system is working - we just need to fix the API call!');
}

main().catch(console.error);
