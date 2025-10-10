import dotenv from 'dotenv';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';

// Load environment variables
dotenv.config();

async function debugLiveAttendance() {
  console.log('🔍 DEBUGGING LIVE ATTENDANCE EMAIL ISSUE...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured!');
    return;
  }
  
  // Test with your actual email
  const testCustomer = {
    firstName: 'Test',
    lastName: 'User',
    email: process.env.EMAIL_USER // Use your actual email
  };

  const testSession = {
    title: 'Live Test Session',
    scheduledDate: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    description: 'Testing live attendance email'
  };

  const testCoachName = 'Test Coach';

  console.log('📧 Testing attendance email with your actual email...');
  console.log(`Email: ${testCustomer.email}`);
  console.log('');
  
  try {
    const result = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'present',
      testCoachName
    );
    
    if (result) {
      console.log('✅ Email sent successfully!');
      console.log('📬 Check your inbox for: "✅ Attendance Marked - Live Test Session"');
    } else {
      console.log('❌ Email failed to send');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugLiveAttendance();

