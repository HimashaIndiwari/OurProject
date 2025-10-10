import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Load environment variables
dotenv.config();

console.log('🔍 Debugging Email Credentials...\n');

console.log('📋 Environment Variables:');
console.log(`EMAIL_USER: "${process.env.EMAIL_USER}"`);
console.log(`EMAIL_PASS: "${process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET'}"`);
console.log('');

// Test 1: Direct transporter creation (like in test-basic-email.js)
console.log('🧪 Test 1: Direct transporter creation...');
try {
  const directTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  
  await directTransporter.verify();
  console.log('✅ Direct transporter works!');
} catch (error) {
  console.log('❌ Direct transporter failed:', error.message);
}

// Test 2: Import wemailService and check its transporter
console.log('\n🧪 Test 2: wemailService transporter...');
try {
  // Import the wemailService
  const wemailService = await import('./utils/wemailService.js');
  console.log('✅ wemailService imported successfully');
  
  // Try to send a simple test email using the wemailService
  const testResult = await wemailService.sendWelcomeEmail(
    process.env.TEST_EMAIL || process.env.EMAIL_USER,
    'Test User'
  );
  
  if (testResult) {
    console.log('✅ wemailService email sent successfully!');
  } else {
    console.log('❌ wemailService email failed');
  }
  
} catch (error) {
  console.log('❌ wemailService test failed:', error.message);
}

// Test 3: Check if the issue is with the attendance email function specifically
console.log('\n🧪 Test 3: Attendance email function...');
try {
  const { sendAttendanceNotificationEmail } = await import('./utils/wemailService.js');
  
  const testCustomer = {
    firstName: 'Test',
    lastName: 'User',
    email: process.env.TEST_EMAIL || process.env.EMAIL_USER
  };
  
  const testSession = {
    title: 'Test Session',
    scheduledDate: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    description: 'Test session'
  };
  
  const result = await sendAttendanceNotificationEmail(
    testCustomer,
    testSession,
    'present',
    'Test Coach'
  );
  
  if (result) {
    console.log('✅ Attendance email sent successfully!');
  } else {
    console.log('❌ Attendance email failed');
  }
  
} catch (error) {
  console.log('❌ Attendance email test failed:', error.message);
  console.log('Error details:', error);
}

console.log('\n🎉 Debug test completed!');

