import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🔧 ATTENDANCE EMAIL FIX GUIDE\n');

console.log('📋 Most Common Issues and Solutions:\n');

console.log('1. ❌ CUSTOMERS DON\'T HAVE EMAIL ADDRESSES');
console.log('   Problem: Customers in database have no email or empty email');
console.log('   Solution: Add email addresses to your customers');
console.log('   How: Update customer records in your database with valid emails\n');

console.log('2. ❌ PARTICIPANT IDs DON\'T MATCH CUSTOMER IDs');
console.log('   Problem: The participantId in attendance data doesn\'t match customer _id');
console.log('   Solution: Check if participant IDs are correct');
console.log('   How: Look at server logs to see what IDs are being used\n');

console.log('3. ❌ EMAIL CREDENTIALS ISSUE');
console.log('   Problem: Gmail credentials are incorrect');
console.log('   Solution: Check EMAIL_USER and EMAIL_PASS in .env file');
console.log('   How: Make sure you\'re using Gmail App Password, not regular password\n');

console.log('4. ❌ EMAILS GOING TO SPAM');
console.log('   Problem: Emails are being sent but going to spam folder');
console.log('   Solution: Check spam/junk folder in your email');
console.log('   How: Look for emails with subject "Attendance Marked"\n');

console.log('🎯 DEBUGGING STEPS:\n');

console.log('Step 1: Check Server Logs');
console.log('When you mark attendance, look for these messages in your server console:');
console.log('   - "=== ATTENDANCE ONLY (NO COACH DATA) ==="');
console.log('   - "📧 Sending attendance notification emails..."');
console.log('   - "✅ Professional attendance notification sent to [email]"');
console.log('   - OR "❌ Skipping email for participant [ID] - no email found"');
console.log('');

console.log('Step 2: Check Email Configuration');
console.log('Run this command to test your email setup:');
console.log('   node debug-live-attendance.js');
console.log('');

console.log('Step 3: Check Customer Data');
console.log('The issue is likely that customers don\'t have email addresses.');
console.log('You need to:');
console.log('   1. Open your database (MongoDB)');
console.log('   2. Find the "users" collection');
console.log('   3. Look for customers (role: "customer")');
console.log('   4. Add email addresses to customers who don\'t have them');
console.log('');

console.log('Step 4: Test with Real Data');
console.log('After adding email addresses:');
console.log('   1. Mark attendance in your coach dashboard');
console.log('   2. Check server logs for email sending messages');
console.log('   3. Check your email inbox (and spam folder)');
console.log('');

console.log('🚀 QUICK FIX:');
console.log('If you want to test immediately, you can:');
console.log('1. Find a customer in your database');
console.log('2. Add your email address to that customer');
console.log('3. Mark attendance for that customer');
console.log('4. You should receive the email');
console.log('');

console.log('📧 Expected Email:');
console.log('Subject: "✅ Attendance Marked - [Session Title]" or "❌ Attendance Marked - [Session Title]"');
console.log('Content: Professional email with session details and attendance status');
console.log('');

console.log('Need help? Check the server console logs when marking attendance!');

