import { sendAttendanceNotificationEmail } from './utils/wemailService.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function finalTest() {
  console.log('🎯 FINAL ATTENDANCE EMAIL TEST\n');
  
  // Test data
  const testCustomer = {
    firstName: 'John',
    lastName: 'Doe',
    email: process.env.TEST_EMAIL || process.env.EMAIL_USER
  };

  const testSession = {
    title: 'Cricket Batting Fundamentals - Session 5',
    scheduledDate: new Date('2024-01-20'),
    startTime: '14:00',
    endTime: '15:30',
    description: 'Advanced batting techniques and footwork drills'
  };

  const testCoachName = 'Coach Michael Johnson';

  console.log('📧 Sending attendance notification emails...\n');
  
  try {
    // Test 1: Present attendance
    console.log('✅ Test 1: Present Attendance');
    console.log(`   Customer: ${testCustomer.firstName} ${testCustomer.lastName}`);
    console.log(`   Email: ${testCustomer.email}`);
    console.log(`   Session: ${testSession.title}`);
    console.log(`   Date: ${testSession.scheduledDate.toLocaleDateString()}`);
    console.log(`   Time: ${testSession.startTime} - ${testSession.endTime}`);
    console.log(`   Coach: ${testCoachName}`);
    
    const presentResult = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'present',
      testCoachName
    );
    
    if (presentResult) {
      console.log('   ✅ PRESENT email sent successfully!\n');
    } else {
      console.log('   ❌ PRESENT email failed\n');
    }
    
    // Wait between emails
    console.log('⏳ Waiting 3 seconds before next email...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Test 2: Absent attendance
    console.log('❌ Test 2: Absent Attendance');
    console.log(`   Customer: ${testCustomer.firstName} ${testCustomer.lastName}`);
    console.log(`   Email: ${testCustomer.email}`);
    console.log(`   Session: ${testSession.title}`);
    console.log(`   Date: ${testSession.scheduledDate.toLocaleDateString()}`);
    console.log(`   Time: ${testSession.startTime} - ${testSession.endTime}`);
    console.log(`   Coach: ${testCoachName}`);
    
    const absentResult = await sendAttendanceNotificationEmail(
      testCustomer,
      testSession,
      'absent',
      testCoachName
    );
    
    if (absentResult) {
      console.log('   ✅ ABSENT email sent successfully!\n');
    } else {
      console.log('   ❌ ABSENT email failed\n');
    }
    
    console.log('🎉 FINAL TEST COMPLETED!\n');
    console.log('📋 Results Summary:');
    console.log(`   Present Email: ${presentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
    console.log(`   Absent Email: ${absentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
    
    if (presentResult && absentResult) {
      console.log('\n🎊 ALL TESTS PASSED! The attendance email system is working perfectly!');
      console.log('\n📧 Check your email inbox for:');
      console.log('   1. "✅ Attendance Marked - Cricket Batting Fundamentals - Session 5" (Present)');
      console.log('   2. "❌ Attendance Marked - Cricket Batting Fundamentals - Session 5" (Absent)');
      console.log('\n💡 The emails should be professional, branded, and contain all session details.');
    } else {
      console.log('\n⚠️  Some tests failed. Check the error messages above.');
    }
    
  } catch (error) {
    console.error('❌ Error during final test:', error.message);
  }
}

// Run the final test
finalTest();

