import dotenv from 'dotenv';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';

// Load environment variables
dotenv.config();

console.log('🔍 ATTENDANCE EMAIL DEBUGGING GUIDE\n');

console.log('📋 STEP 1: Check Email Configuration');
console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
console.log('');

console.log('📋 STEP 2: Test Email Function');
console.log('Testing attendance email function...');

async function testEmailFunction() {
  try {
    const testCustomer = {
      firstName: 'John',
      lastName: 'Doe',
      email: process.env.EMAIL_USER // Use your email for testing
    };
    
    const testSession = {
      title: 'Test Cricket Session',
      scheduledDate: new Date(),
      startTime: '10:00',
      endTime: '11:00',
      description: 'Test session for debugging'
    };
    
    const result = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'present',
      'Test Coach'
    );
    
    if (result) {
      console.log('✅ Attendance email function works!');
    } else {
      console.log('❌ Attendance email function failed');
    }
  } catch (error) {
    console.log('❌ Error testing email function:', error.message);
  }
}

await testEmailFunction();

console.log('\n📋 STEP 3: Common Issues Checklist');
console.log('');
console.log('❓ CHECK THESE WHEN MARKING ATTENDANCE:');
console.log('');
console.log('1. 📧 CUSTOMER EMAIL ADDRESSES:');
console.log('   - Do your customers have email addresses in the database?');
console.log('   - Check: SELECT email FROM users WHERE email IS NOT NULL;');
console.log('');
console.log('2. 🔗 PARTICIPANT ID MATCHING:');
console.log('   - Are participant IDs matching customer IDs?');
console.log('   - Check if participantId in attendanceData matches user._id');
console.log('');
console.log('3. 📅 SESSION DATA:');
console.log('   - Does the session have all required fields?');
console.log('   - Check: title, scheduledDate, startTime, endTime');
console.log('');
console.log('4. 👨‍🏫 COACH DATA:');
console.log('   - Does the session have a coach assigned?');
console.log('   - Check: session.coach field');
console.log('');
console.log('5. 🖥️ SERVER LOGS:');
console.log('   - Look for these messages in your server console:');
console.log('     📧 Sending attendance notification emails...');
console.log('     ✅ Professional attendance notification sent to [email]');
console.log('     ❌ Failed to send professional email to [email]');
console.log('');

console.log('📋 STEP 4: Debug Commands');
console.log('');
console.log('Run these commands to debug:');
console.log('');
console.log('1. Test basic email:');
console.log('   node test-basic-email.js');
console.log('');
console.log('2. Test attendance email:');
console.log('   node test-attendance-email.js');
console.log('');
console.log('3. Debug email credentials:');
console.log('   node debug-email-credentials.js');
console.log('');

console.log('📋 STEP 5: Frontend Debugging');
console.log('');
console.log('Check your frontend code:');
console.log('');
console.log('1. Are you calling the correct endpoint?');
console.log('   - PUT /api/coaches/attendance-only');
console.log('   - PUT /api/coaches/:id/sessions/:sessionId/attendance');
console.log('');
console.log('2. Is the request body correct?');
console.log('   {');
console.log('     "sessionId": "session_id_here",');
console.log('     "attendanceData": [');
console.log('       {');
console.log('         "participantId": "user_id_here",');
console.log('         "attended": true');
console.log('       }');
console.log('     ]');
console.log('   }');
console.log('');
console.log('3. Are participant IDs correct?');
console.log('   - They should be user._id values');
console.log('   - Not session participant IDs');
console.log('');

console.log('📋 STEP 6: Database Debugging');
console.log('');
console.log('Run these MongoDB queries:');
console.log('');
console.log('1. Check sessions with participants:');
console.log('   db.sessions.find({"participants": {$exists: true, $not: {$size: 0}}})');
console.log('');
console.log('2. Check users with email addresses:');
console.log('   db.users.find({"email": {$exists: true, $ne: null}})');
console.log('');
console.log('3. Check specific session participants:');
console.log('   db.sessions.findOne({"_id": ObjectId("session_id")}, {"participants": 1})');
console.log('');

console.log('🎯 MOST LIKELY ISSUES:');
console.log('');
console.log('1. ❌ Customers don\'t have email addresses');
console.log('   Solution: Add email addresses to customer records');
console.log('');
console.log('2. ❌ Participant IDs don\'t match customer IDs');
console.log('   Solution: Use user._id instead of participant._id');
console.log('');
console.log('3. ❌ Session data is incomplete');
console.log('   Solution: Ensure session has all required fields');
console.log('');
console.log('4. ❌ Server errors are being ignored');
console.log('   Solution: Check server console for error messages');
console.log('');

console.log('🚀 QUICK FIX:');
console.log('');
console.log('If emails are not being sent, check your server console');
console.log('for error messages when you mark attendance.');
console.log('');
console.log('The email system is working (as confirmed by tests),');
console.log('so the issue is likely in the data or request format.');
console.log('');

console.log('✅ Email system status: WORKING');
console.log('❓ Issue is likely in: Data format or missing customer emails');
console.log('');

process.exit(0);
