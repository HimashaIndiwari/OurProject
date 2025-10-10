import mongoose from 'mongoose';
import dotenv from 'dotenv';
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

// Test the attendance-only endpoint logic
async function testAttendanceOnlyEndpoint() {
  console.log('🧪 TESTING ATTENDANCE-ONLY ENDPOINT LOGIC\n');
  
  try {
    // Step 1: Find a session with participants
    const session = await Session.findOne({ 
      participants: { $exists: true, $not: { $size: 0 } } 
    }).populate('participants.user', 'firstName lastName email');
    
    if (!session) {
      console.log('❌ No session found with participants');
      return;
    }
    
    console.log(`📅 Testing with session: ${session.title} (ID: ${session._id})`);
    console.log(`👥 Participants: ${session.participants.length}`);
    
    // Step 2: Create test attendance data
    const attendanceData = session.participants.map(participant => ({
      participantId: participant.user ? participant.user._id.toString() : participant._id.toString(),
      attended: true // Mark all as present for testing
    }));
    
    console.log('📊 Test attendance data:', attendanceData);
    
    // Step 3: Simulate the exact logic from attendanceOnly function
    console.log('\n🔄 Simulating attendanceOnly function logic...');
    
    // Get coach details
    const coach = await User.findById(session.coach);
    const coachName = coach?.firstName ? `${coach.firstName} ${coach.lastName || ''}` : 'Your Coach';
    console.log(`👨‍🏫 Coach: ${coachName}`);
    
    // Get customer details for email notifications
    const customerIds = [...new Set(attendanceData.map(item => item.participantId))];
    console.log(`🔍 Looking for customers with IDs: ${customerIds.join(', ')}`);
    
    const customers = await User.find({ _id: { $in: customerIds } });
    console.log(`👥 Found ${customers.length} customers in database`);
    
    const customerMap = customers.reduce((acc, customer) => {
      acc[customer._id.toString()] = customer;
      return acc;
    }, {});
    
    // Step 4: Check each participant
    console.log('\n📋 Checking each participant:');
    for (const item of attendanceData) {
      const customer = customerMap[item.participantId];
      console.log(`\n👤 Participant ID: ${item.participantId}`);
      console.log(`   Customer found: ${customer ? '✅ Yes' : '❌ No'}`);
      
      if (customer) {
        console.log(`   Name: ${customer.firstName} ${customer.lastName}`);
        console.log(`   Email: ${customer.email || '❌ NO EMAIL'}`);
        console.log(`   Can send email: ${customer.email ? '✅ Yes' : '❌ No'}`);
      }
    }
    
    // Step 5: Test email sending
    console.log('\n📧 Testing email sending...');
    const { sendAttendanceNotificationEmail } = await import('./utils/wemailService.js');
    
    let emailCount = 0;
    let successCount = 0;
    
    for (const item of attendanceData) {
      const customer = customerMap[item.participantId];
      if (!customer || !customer.email) {
        console.log(`⚠️  Skipping participant ${item.participantId} - no email found`);
        continue;
      }

      const attendanceStatus = item.attended ? 'present' : 'absent';
      emailCount++;
      
      try {
        const emailSent = await sendAttendanceNotificationEmail(
          customer,
          session,
          attendanceStatus,
          coachName
        );
        
        if (emailSent) {
          console.log(`✅ Email sent to ${customer.email}`);
          successCount++;
        } else {
          console.log(`❌ Failed to send email to ${customer.email}`);
        }
      } catch (emailError) {
        console.log(`❌ Error sending email to ${customer.email}:`, emailError.message);
      }
    }
    
    console.log(`\n📊 Email Results: ${successCount}/${emailCount} emails sent successfully`);
    
    // Step 6: Check for common issues
    console.log('\n🔍 Checking for common issues:');
    
    // Check if session has coach
    if (!session.coach) {
      console.log('❌ Session has no coach assigned');
    } else {
      console.log('✅ Session has coach assigned');
    }
    
    // Check if participants have user references
    const orphanParticipants = session.participants.filter(p => !p.user);
    if (orphanParticipants.length > 0) {
      console.log(`❌ Found ${orphanParticipants.length} participants without user references`);
    } else {
      console.log('✅ All participants have user references');
    }
    
    // Check if users have email addresses
    const usersWithoutEmail = customers.filter(c => !c.email);
    if (usersWithoutEmail.length > 0) {
      console.log(`❌ Found ${usersWithoutEmail.length} users without email addresses`);
    } else {
      console.log('✅ All users have email addresses');
    }
    
  } catch (error) {
    console.error('❌ Error during testing:', error.message);
  }
}

// Main execution
async function main() {
  await connectDB();
  await testAttendanceOnlyEndpoint();
  
  console.log('\n🎯 NEXT STEPS:');
  console.log('1. Check your server logs when marking attendance');
  console.log('2. Verify that participants have email addresses');
  console.log('3. Ensure the frontend is sending correct participant IDs');
  console.log('4. Test with this script to isolate the issue');
  
  process.exit(0);
}

main().catch(console.error);
