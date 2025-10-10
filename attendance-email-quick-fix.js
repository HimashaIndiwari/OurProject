import dotenv from 'dotenv';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';

// Load environment variables
dotenv.config();

console.log('🔧 ATTENDANCE EMAIL QUICK FIX SCRIPT\n');

// Enhanced attendance email function with better error handling
async function sendAttendanceEmailWithDebug(customer, session, attendanceStatus, coachName) {
  console.log(`📧 Attempting to send email to: ${customer.email}`);
  console.log(`   Customer: ${customer.firstName} ${customer.lastName}`);
  console.log(`   Session: ${session.title}`);
  console.log(`   Status: ${attendanceStatus}`);
  console.log(`   Coach: ${coachName}`);
  
  try {
    const result = await sendAttendanceNotificationEmail(
      customer,
      session,
      attendanceStatus,
      coachName
    );
    
    if (result) {
      console.log(`✅ Email sent successfully to ${customer.email}`);
      return true;
    } else {
      console.log(`❌ Email function returned false for ${customer.email}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ Error sending email to ${customer.email}:`, error.message);
    return false;
  }
}

// Test function to verify the fix
async function testAttendanceEmailFix() {
  console.log('🧪 Testing attendance email fix...\n');
  
  // Test data
  const testCustomer = {
    firstName: 'John',
    lastName: 'Doe',
    email: process.env.EMAIL_USER // Use your email for testing
  };
  
  const testSession = {
    title: 'Cricket Batting Session',
    scheduledDate: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    description: 'Learn proper batting techniques'
  };
  
  const coachName = 'Coach Smith';
  
  // Test present attendance
  console.log('📧 Testing PRESENT attendance email...');
  const presentResult = await sendAttendanceEmailWithDebug(
    testCustomer,
    testSession,
    'present',
    coachName
  );
  
  console.log('');
  
  // Test absent attendance
  console.log('📧 Testing ABSENT attendance email...');
  const absentResult = await sendAttendanceEmailWithDebug(
    testCustomer,
    testSession,
    'absent',
    coachName
  );
  
  console.log('\n📊 Test Results:');
  console.log(`Present email: ${presentResult ? '✅ Success' : '❌ Failed'}`);
  console.log(`Absent email: ${absentResult ? '✅ Success' : '❌ Failed'}`);
  
  return presentResult && absentResult;
}

// Main execution
async function main() {
  console.log('🚀 Starting attendance email fix verification...\n');
  
  const testResult = await testAttendanceEmailFix();
  
  console.log('\n🎯 SUMMARY:');
  if (testResult) {
    console.log('✅ Email system is working correctly!');
    console.log('');
    console.log('If emails are still not being sent during attendance marking:');
    console.log('1. Check server console for error messages');
    console.log('2. Verify customers have email addresses in database');
    console.log('3. Ensure participant IDs match customer IDs');
    console.log('4. Check if session data is complete');
  } else {
    console.log('❌ Email system has issues that need to be fixed');
    console.log('');
    console.log('Check:');
    console.log('1. EMAIL_USER and EMAIL_PASS environment variables');
    console.log('2. Gmail App Password is correct');
    console.log('3. Network connectivity');
  }
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Start your server: npm start');
  console.log('2. Mark attendance in coach dashboard');
  console.log('3. Watch server console for email messages');
  console.log('4. Check your email inbox for notifications');
  console.log('');
  console.log('🔍 Look for these messages in server console:');
  console.log('   📧 Sending attendance notification emails...');
  console.log('   ✅ Professional attendance notification sent to [email]');
  console.log('   ❌ Failed to send professional email to [email]');
  console.log('');
  
  process.exit(0);
}

main().catch(console.error);
