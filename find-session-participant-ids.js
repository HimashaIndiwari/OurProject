import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import dotenv from 'dotenv';

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

async function findSessionAndParticipantIds() {
  console.log('🔍 Finding Session and Participant IDs for Testing...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Find sessions with participants
    console.log('📅 Finding sessions with participants...');
    const sessions = await Session.find()
      .populate('participants.user', 'firstName lastName email')
      .populate('coach', 'firstName lastName')
      .limit(10);
    
    if (sessions.length === 0) {
      console.log('❌ No sessions found in database');
      return;
    }
    
    console.log(`✅ Found ${sessions.length} sessions\n`);
    
    // Display sessions with participants
    sessions.forEach((session, index) => {
      console.log(`📋 Session ${index + 1}:`);
      console.log(`   ID: ${session._id}`);
      console.log(`   Title: ${session.title}`);
      console.log(`   Date: ${new Date(session.scheduledDate).toLocaleDateString()}`);
      console.log(`   Coach: ${session.coach?.firstName || 'Unknown'} ${session.coach?.lastName || ''}`);
      console.log(`   Participants: ${session.participants.length}`);
      
      if (session.participants.length > 0) {
        console.log('   📝 Participants:');
        session.participants.forEach((participant, pIndex) => {
          console.log(`      ${pIndex + 1}. ID: ${participant._id}`);
          console.log(`         User ID: ${participant.user?._id || 'N/A'}`);
          console.log(`         Name: ${participant.user?.firstName || 'Unknown'} ${participant.user?.lastName || ''}`);
          console.log(`         Email: ${participant.user?.email || 'No email'}`);
          console.log(`         Attended: ${participant.attended !== undefined ? participant.attended : 'Not marked'}`);
          console.log('');
        });
      } else {
        console.log('   ❌ No participants in this session\n');
      }
      
      console.log('---\n');
    });
    
    // Find customers with email addresses
    console.log('👥 Finding customers with email addresses...');
    const customers = await User.find({ 
      role: 'customer',
      email: { $exists: true, $ne: null }
    }).limit(10);
    
    if (customers.length > 0) {
      console.log(`✅ Found ${customers.length} customers with emails:\n`);
      customers.forEach((customer, index) => {
        console.log(`👤 Customer ${index + 1}:`);
        console.log(`   ID: ${customer._id}`);
        console.log(`   Name: ${customer.firstName || 'Unknown'} ${customer.lastName || ''}`);
        console.log(`   Email: ${customer.email}`);
        console.log(`   Username: ${customer.username}`);
        console.log('');
      });
    } else {
      console.log('❌ No customers with email addresses found');
    }
    
    // Provide test data template
    console.log('🧪 Test Data Template:');
    console.log('Copy and paste this into test-real-attendance-marking.js:');
    console.log('');
    
    if (sessions.length > 0 && sessions[0].participants.length > 0) {
      const firstSession = sessions[0];
      const firstParticipant = firstSession.participants[0];
      
      console.log('const testData = {');
      console.log(`  sessionId: '${firstSession._id}',`);
      console.log('  attendanceData: [');
      console.log('    {');
      console.log(`      participantId: '${firstParticipant._id}',`);
      console.log('      attended: true');
      console.log('    }');
      console.log('  ]');
      console.log('};');
      console.log('');
      
      console.log('📧 Expected Email Recipient:');
      console.log(`   ${firstParticipant.user?.email || 'No email found for this participant'}`);
    }
    
  } catch (error) {
    console.error('❌ Error during search:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the search
findSessionAndParticipantIds();

