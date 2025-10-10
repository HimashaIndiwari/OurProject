import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';

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

console.log('🔍 COMPREHENSIVE ATTENDANCE EMAIL DEBUG\n');

async function debugAttendanceEmailIssue() {
  try {
    await connectDB();
    
    console.log('📋 STEP 1: Check if we have sessions with participants...');
    
    // Find sessions with participants
    const sessions = await Session.find({ 
      participants: { $exists: true, $not: { $size: 0 } } 
    }).populate('participants.user', 'firstName lastName email').limit(5);
    
    if (sessions.length === 0) {
      console.log('❌ No sessions with participants found in database');
      console.log('This could be why emails are not being sent.');
      return;
    }
    
    console.log(`✅ Found ${sessions.length} sessions with participants\n`);
    
    // Analyze each session
    for (const session of sessions) {
      console.log(`📅 Session: ${session.title} (ID: ${session._id})`);
      console.log(`   Participants: ${session.participants.length}`);
      
      if (session.participants.length === 0) {
        console.log('   ❌ No participants in this session\n');
        continue;
      }
      
      // Check each participant
      console.log('   📝 Participants:');
      for (const participant of session.participants) {
        console.log(`      Participant ID: ${participant._id}`);
        console.log(`      User ID: ${participant.user?._id || 'N/A'}`);
        console.log(`      Name: ${participant.user?.firstName || 'Unknown'} ${participant.user?.lastName || ''}`);
        console.log(`      Email: ${participant.user?.email || '❌ NO EMAIL'}`);
        console.log(`      Attended: ${participant.attended !== undefined ? participant.attended : 'Not marked'}`);
        console.log('');
      }
      
      // Test the email logic with this session
      console.log('   🧪 Testing email logic with this session...');
      
      // Create mock attendance data (like frontend would send)
      const mockAttendanceData = session.participants.map(participant => ({
        participantId: participant._id.toString(), // Frontend sends participant._id
        attended: true // Mark all as present for testing
      }));
      
      console.log('   📊 Mock attendance data:', mockAttendanceData);
      
      // Test the FIXED logic
      const participantIds = [...new Set(mockAttendanceData.map(item => item.participantId))];
      const sessionParticipants = session.participants.filter(p => 
        participantIds.includes(p._id.toString())
      );
      
      console.log(`   🔍 Found ${sessionParticipants.length} matching participants`);
      
      if (sessionParticipants.length === 0) {
        console.log('   ❌ No matching participants found - this is the problem!');
        continue;
      }
      
      // Extract user IDs
      const userIds = sessionParticipants.map(p => p.user.toString());
      console.log(`   👥 User IDs to lookup: ${userIds.join(', ')}`);
      
      // Find users
      const customers = await User.find({ _id: { $in: userIds } });
      console.log(`   👤 Found ${customers.length} users in database`);
      
      if (customers.length === 0) {
        console.log('   ❌ No users found - this is the problem!');
        continue;
      }
      
      // Create mapping
      const participantToUserMap = {};
      sessionParticipants.forEach(participant => {
        const user = customers.find(c => c._id.toString() === participant.user.toString());
        if (user) {
          participantToUserMap[participant._id.toString()] = user;
        }
      });
      
      console.log(`   🗺️  Created mapping for ${Object.keys(participantToUserMap).length} participants`);
      
      // Test email sending
      console.log('   📧 Testing email sending...');
      
      let emailCount = 0;
      let successCount = 0;
      
      for (const item of mockAttendanceData) {
        const customer = participantToUserMap[item.participantId];
        
        if (!customer || !customer.email) {
          console.log(`      ❌ No customer/email for participant ${item.participantId}`);
          continue;
        }
        
        console.log(`      📤 Sending email to ${customer.email}...`);
        emailCount++;
        
        try {
          const emailSent = await sendAttendanceNotificationEmail(
            customer,
            session,
            'present',
            'Test Coach'
          );
          
          if (emailSent) {
            console.log(`      ✅ Email sent successfully to ${customer.email}`);
            successCount++;
          } else {
            console.log(`      ❌ Email function returned false`);
          }
        } catch (error) {
          console.log(`      ❌ Error sending email:`, error.message);
        }
      }
      
      console.log(`   📊 Email results: ${successCount}/${emailCount} sent successfully\n`);
      
      // Only test first session to avoid spam
      break;
    }
    
    console.log('📋 STEP 2: Check for common issues...');
    
    // Check users without email addresses
    const usersWithoutEmail = await User.find({ 
      email: { $exists: false } 
    }).countDocuments();
    
    if (usersWithoutEmail > 0) {
      console.log(`❌ Found ${usersWithoutEmail} users without email addresses`);
    } else {
      console.log('✅ All users have email addresses');
    }
    
    // Check sessions without coach
    const sessionsWithoutCoach = await Session.find({ 
      coach: { $exists: false } 
    }).countDocuments();
    
    if (sessionsWithoutCoach > 0) {
      console.log(`❌ Found ${sessionsWithoutCoach} sessions without coach`);
    } else {
      console.log('✅ All sessions have coach assigned');
    }
    
    console.log('\n🎯 DIAGNOSIS:');
    console.log('If emails are still not being sent during actual attendance marking:');
    console.log('1. Check server console for error messages');
    console.log('2. Verify the frontend is calling the correct endpoint');
    console.log('3. Ensure the session data is complete');
    console.log('4. Check if there are network/firewall issues');
    
  } catch (error) {
    console.error('❌ Error during debugging:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  }
}

// Run the debug
debugAttendanceEmailIssue().catch(console.error);
