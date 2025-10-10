import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';
import User from './models/User.js';
import Session from './models/Session.js';

// Load environment variables
dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cricketexpert');
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Debug function to check attendance email flow
async function debugAttendanceEmailFlow() {
  console.log('🔍 DEBUGGING ATTENDANCE EMAIL FLOW\n');
  
  try {
    // Step 1: Check if we have sessions with participants
    console.log('📋 Step 1: Checking sessions with participants...');
    const sessions = await Session.find({ 
      participants: { $exists: true, $not: { $size: 0 } } 
    }).populate('participants.user', 'firstName lastName email').limit(5);
    
    if (sessions.length === 0) {
      console.log('❌ No sessions with participants found');
      return;
    }
    
    console.log(`✅ Found ${sessions.length} sessions with participants`);
    
    // Step 2: Check participants and their email addresses
    console.log('\n📋 Step 2: Checking participant email addresses...');
    for (const session of sessions) {
      console.log(`\n📅 Session: ${session.title} (ID: ${session._id})`);
      console.log(`   Participants: ${session.participants.length}`);
      
      for (const participant of session.participants) {
        const user = participant.user;
        if (user) {
          console.log(`   👤 ${user.firstName} ${user.lastName} - Email: ${user.email || '❌ NO EMAIL'}`);
        } else {
          console.log(`   👤 Participant ID: ${participant._id} - User: ❌ NOT FOUND`);
        }
      }
    }
    
    // Step 3: Test email sending with real data
    console.log('\n📋 Step 3: Testing email sending with real data...');
    const testSession = sessions[0];
    const testParticipant = testSession.participants[0];
    
    if (testParticipant && testParticipant.user && testParticipant.user.email) {
      console.log(`📧 Testing with: ${testParticipant.user.firstName} ${testParticipant.user.lastName} (${testParticipant.user.email})`);
      
      const testCustomer = {
        firstName: testParticipant.user.firstName,
        lastName: testParticipant.user.lastName,
        email: testParticipant.user.email
      };
      
      const testSessionData = {
        title: testSession.title,
        scheduledDate: testSession.scheduledDate,
        startTime: testSession.startTime,
        endTime: testSession.endTime,
        description: testSession.description
      };
      
      const emailResult = await sendAttendanceNotificationEmail(
        testCustomer,
        testSessionData,
        'present',
        'Test Coach'
      );
      
      if (emailResult) {
        console.log('✅ Test email sent successfully!');
      } else {
        console.log('❌ Test email failed');
      }
    } else {
      console.log('❌ Cannot test email - participant has no email address');
    }
    
    // Step 4: Check for common issues
    console.log('\n📋 Step 4: Checking for common issues...');
    
    // Check sessions without coach
    const sessionsWithoutCoach = await Session.find({ coach: { $exists: false } });
    if (sessionsWithoutCoach.length > 0) {
      console.log(`⚠️  Found ${sessionsWithoutCoach.length} sessions without coach`);
    }
    
    // Check participants without user reference
    const sessionsWithOrphanParticipants = await Session.find({
      'participants.user': { $exists: false }
    });
    if (sessionsWithOrphanParticipants.length > 0) {
      console.log(`⚠️  Found ${sessionsWithOrphanParticipants.length} sessions with orphan participants`);
    }
    
    // Check users without email
    const usersWithoutEmail = await User.find({ 
      email: { $exists: false } 
    }).countDocuments();
    if (usersWithoutEmail > 0) {
      console.log(`⚠️  Found ${usersWithoutEmail} users without email addresses`);
    }
    
    console.log('\n🎉 Debug analysis completed!');
    
  } catch (error) {
    console.error('❌ Error during debug analysis:', error.message);
  }
}

// Function to simulate the actual attendance marking process
async function simulateAttendanceMarking() {
  console.log('\n🧪 SIMULATING ACTUAL ATTENDANCE MARKING PROCESS\n');
  
  try {
    // Get a real session
    const session = await Session.findOne({ 
      participants: { $exists: true, $not: { $size: 0 } } 
    }).populate('participants.user', 'firstName lastName email');
    
    if (!session) {
      console.log('❌ No session found for simulation');
      return;
    }
    
    console.log(`📅 Simulating attendance marking for: ${session.title}`);
    
    // Create attendance data like the frontend would send
    const attendanceData = session.participants.map(participant => ({
      participantId: participant.user ? participant.user._id.toString() : participant._id.toString(),
      attended: Math.random() > 0.5 // Random attendance for testing
    }));
    
    console.log('📊 Attendance data:', attendanceData);
    
    // Get coach details
    const coach = await User.findById(session.coach);
    const coachName = coach?.firstName ? `${coach.firstName} ${coach.lastName || ''}` : 'Your Coach';
    
    // Get customer details for email notifications
    const customerIds = [...new Set(attendanceData.map(item => item.participantId))];
    const customers = await User.find({ _id: { $in: customerIds } });
    const customerMap = customers.reduce((acc, customer) => {
      acc[customer._id.toString()] = customer;
      return acc;
    }, {});
    
    console.log(`👥 Found ${customers.length} customers for email notifications`);
    
    // Send email notifications (like in the actual code)
    console.log('📧 Sending attendance notification emails...');
    
    const emailPromises = attendanceData.map(async (item) => {
      const customer = customerMap[item.participantId];
      if (!customer || !customer.email) {
        console.log(`⚠️  Skipping email for participant ${item.participantId} - no email found`);
        return;
      }

      const attendanceStatus = item.attended ? 'present' : 'absent';
      console.log(`📤 Sending ${attendanceStatus} email to ${customer.email}`);

      try {
        const emailSent = await sendAttendanceNotificationEmail(
          customer,
          session,
          attendanceStatus,
          coachName
        );
        
        if (emailSent) {
          console.log(`✅ Professional attendance notification sent to ${customer.email}`);
        } else {
          console.log(`❌ Failed to send professional email to ${customer.email}`);
        }
      } catch (emailError) {
        console.log(`❌ Error sending professional email to ${customer.email}:`, emailError.message);
      }
    });

    // Wait for all emails to be sent (or fail)
    await Promise.allSettled(emailPromises);
    console.log('📧 Email notification process completed');
    
  } catch (error) {
    console.error('❌ Error during simulation:', error.message);
  }
}

// Main execution
async function main() {
  await connectDB();
  await debugAttendanceEmailFlow();
  await simulateAttendanceMarking();
  
  console.log('\n🎯 SUMMARY:');
  console.log('1. Check if participants have email addresses');
  console.log('2. Verify participant IDs match customer IDs');
  console.log('3. Ensure sessions have proper coach assignments');
  console.log('4. Check server logs during actual attendance marking');
  console.log('5. Test with real data using this script');
  
  process.exit(0);
}

main().catch(console.error);
