import { sendAttendanceNotificationEmail } from './utils/wemailService.js';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cricketxpert');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

async function debugAttendanceEmails() {
  console.log('🔍 DEBUGGING ATTENDANCE EMAIL SYSTEM...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log(`MONGODB_URI: ${process.env.MONGODB_URI ? '✅ Set' : '❌ Not set'}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured!');
    console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }
  
  try {
    // Connect to database
    await connectDB();
    
    // Find a real customer from the database
    console.log('👥 Looking for customers in database...');
    const customers = await User.find({ role: 'customer' }).limit(5);
    
    if (customers.length === 0) {
      console.log('❌ No customers found in database');
      console.log('Creating test customer...');
      
      // Create a test customer
      const testCustomer = new User({
        username: 'testcustomer',
        email: process.env.TEST_EMAIL || 'test@example.com',
        passwordHash: 'test',
        role: 'customer',
        firstName: 'Test',
        lastName: 'Customer'
      });
      
      await testCustomer.save();
      console.log('✅ Test customer created');
      
      // Use the test customer
      const customer = testCustomer;
      
      // Create test session data
      const testSession = {
        title: 'Cricket Batting Fundamentals - Session 3',
        scheduledDate: new Date(),
        startTime: '10:00',
        endTime: '11:30',
        description: 'Learn proper batting stance, grip, and basic shot techniques'
      };
      
      const testCoachName = 'Coach Smith';
      
      console.log('\n📧 Testing email with real database customer...');
      console.log(`Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
      
      // Test present attendance
      console.log('\n🧪 Test 1: Present Attendance');
      const presentResult = await sendAttendanceNotificationEmail(
        customer,
        testSession,
        'present',
        testCoachName
      );
      
      console.log(`Result: ${presentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Wait between emails
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test absent attendance
      console.log('\n🧪 Test 2: Absent Attendance');
      const absentResult = await sendAttendanceNotificationEmail(
        customer,
        testSession,
        'absent',
        testCoachName
      );
      
      console.log(`Result: ${absentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
      
    } else {
      console.log(`✅ Found ${customers.length} customers in database`);
      
      // Use the first customer with an email
      const customer = customers.find(c => c.email) || customers[0];
      
      if (!customer.email) {
        console.log('❌ No customer with email found');
        return;
      }
      
      console.log(`Using customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
      
      // Find a real session
      console.log('\n📅 Looking for sessions in database...');
      const sessions = await Session.find().populate('coach').limit(5);
      
      let testSession;
      let testCoachName = 'Coach Smith';
      
      if (sessions.length > 0) {
        testSession = sessions[0];
        if (testSession.coach && testSession.coach.firstName) {
          testCoachName = `${testSession.coach.firstName} ${testSession.coach.lastName || ''}`;
        }
        console.log(`Using session: ${testSession.title}`);
      } else {
        console.log('No sessions found, using test session data');
        testSession = {
          title: 'Cricket Batting Fundamentals - Session 3',
          scheduledDate: new Date(),
          startTime: '10:00',
          endTime: '11:30',
          description: 'Learn proper batting stance, grip, and basic shot techniques'
        };
      }
      
      console.log('\n📧 Testing email with real database data...');
      
      // Test present attendance
      console.log('\n🧪 Test 1: Present Attendance');
      const presentResult = await sendAttendanceNotificationEmail(
        customer,
        testSession,
        'present',
        testCoachName
      );
      
      console.log(`Result: ${presentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
      
      // Wait between emails
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Test absent attendance
      console.log('\n🧪 Test 2: Absent Attendance');
      const absentResult = await sendAttendanceNotificationEmail(
        customer,
        testSession,
        'absent',
        testCoachName
      );
      
      console.log(`Result: ${absentResult ? '✅ SUCCESS' : '❌ FAILED'}`);
    }
    
    console.log('\n🎉 Debug test completed!');
    console.log('\n📋 Next Steps:');
    console.log('1. Check your email inbox (including spam folder)');
    console.log('2. Check server logs for detailed email sending information');
    console.log('3. Verify Gmail App Password is correct');
    console.log('4. Check Gmail sending limits');
    
  } catch (error) {
    console.error('❌ Error during debug test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the debug test
debugAttendanceEmails();

