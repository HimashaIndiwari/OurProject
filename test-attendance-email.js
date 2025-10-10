import { sendAttendanceNotificationEmail } from './utils/wemailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Test data
const testCustomer = {
  firstName: 'John',
  lastName: 'Doe',
  email: process.env.TEST_EMAIL || 'test@example.com' // Use your test email
};

const testSession = {
  title: 'Cricket Batting Fundamentals - Session 3',
  scheduledDate: new Date('2024-01-15'),
  startTime: '10:00',
  endTime: '11:30',
  description: 'Learn proper batting stance, grip, and basic shot techniques'
};

const testCoachName = 'Coach Smith';

async function testAttendanceEmail() {
  console.log('🧪 Testing Attendance Email Notifications...\n');
  
  try {
    // Test 1: Present attendance
    console.log('📧 Test 1: Sending "Present" attendance notification...');
    const presentResult = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'present',
      testCoachName
    );
    
    if (presentResult) {
      console.log('✅ Present attendance email sent successfully!\n');
    } else {
      console.log('❌ Failed to send present attendance email\n');
    }
    
    // Wait a bit between emails
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Test 2: Absent attendance
    console.log('📧 Test 2: Sending "Absent" attendance notification...');
    const absentResult = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'absent',
      testCoachName
    );
    
    if (absentResult) {
      console.log('✅ Absent attendance email sent successfully!\n');
    } else {
      console.log('❌ Failed to send absent attendance email\n');
    }
    
    console.log('🎉 Attendance email testing completed!');
    console.log('\n📋 Test Summary:');
    console.log(`- Present email: ${presentResult ? '✅ Success' : '❌ Failed'}`);
    console.log(`- Absent email: ${absentResult ? '✅ Success' : '❌ Failed'}`);
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Check if email credentials are configured
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ Email credentials not configured!');
  console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
  process.exit(1);
}

// Run the test
testAttendanceEmail();

