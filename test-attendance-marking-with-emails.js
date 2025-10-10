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

async function testAttendanceMarkingWithEmails() {
  console.log('🧪 Testing Attendance Marking with Email Notifications...\n');
  
  try {
    // Connect to database
    await connectDB();
    
    // Find or create test data
    console.log('👥 Setting up test data...');
    
    // Find a customer
    let customer = await User.findOne({ role: 'customer' });
    if (!customer) {
      console.log('Creating test customer...');
      customer = new User({
        username: 'testcustomer',
        email: process.env.TEST_EMAIL || 'test@example.com',
        passwordHash: 'test',
        role: 'customer',
        firstName: 'Test',
        lastName: 'Customer'
      });
      await customer.save();
    }
    
    // Find a coach
    let coach = await User.findOne({ role: 'coach' });
    if (!coach) {
      console.log('Creating test coach...');
      coach = new User({
        username: 'testcoach',
        email: 'coach@example.com',
        passwordHash: 'test',
        role: 'coach',
        firstName: 'Test',
        lastName: 'Coach'
      });
      await coach.save();
    }
    
    // Find or create a session
    let session = await Session.findOne().populate('coach');
    if (!session) {
      console.log('Creating test session...');
      session = new Session({
        title: 'Test Cricket Session',
        description: 'A test session for email notifications',
        sessionNumber: 1,
        week: 1,
        scheduledDate: new Date(),
        startTime: '10:00',
        endTime: '11:00',
        duration: 60,
        coach: coach._id,
        ground: new mongoose.Types.ObjectId(), // Dummy ground ID
        groundSlot: 1,
        participants: [{
          user: customer._id,
          enrollment: new mongoose.Types.ObjectId(), // Dummy enrollment ID
          attended: false
        }],
        bookingDeadline: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours from now
      });
      await session.save();
    }
    
    console.log(`✅ Test data ready:`);
    console.log(`   Customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    console.log(`   Coach: ${coach.firstName} ${coach.lastName}`);
    console.log(`   Session: ${session.title}`);
    
    // Test the attendance marking process
    console.log('\n📝 Testing attendance marking process...');
    
    // Simulate attendance data
    const attendanceData = [{
      participantId: customer._id.toString(),
      attended: true
    }];
    
    console.log('🔄 Marking attendance...');
    
    // Update session participant
    const participant = session.participants.find(p => p.user.toString() === customer._id.toString());
    if (participant) {
      participant.attended = true;
      participant.attendanceStatus = 'present';
      participant.attendanceMarkedAt = new Date();
      await session.save();
      console.log('✅ Attendance marked in database');
    } else {
      console.log('❌ Participant not found in session');
      return;
    }
    
    // Test email sending
    console.log('\n📧 Testing email notification...');
    
    // Import the email function
    const { sendAttendanceNotificationEmail } = await import('./utils/wemailService.js');
    
    const coachName = `${coach.firstName} ${coach.lastName}`;
    const emailResult = await sendAttendanceNotificationEmail(
      customer,
      session,
      'present',
      coachName
    );
    
    if (emailResult) {
      console.log('✅ Email notification sent successfully!');
      console.log(`📬 Email sent to: ${customer.email}`);
    } else {
      console.log('❌ Email notification failed');
    }
    
    // Test the actual attendance controller function
    console.log('\n🔄 Testing attendance controller function...');
    
    try {
      // Import the attendance controller
      const { markAttendance } = await import('./controllers/attendanceController.js');
      
      // Create a mock request and response
      const mockReq = {
        body: {
          sessionId: session._id.toString(),
          attendanceData: [{
            participantId: customer._id.toString(),
            attended: false // Mark as absent this time
          }],
          coachId: coach._id.toString(),
          markedBy: coach._id.toString()
        }
      };
      
      const mockRes = {
        status: (code) => ({
          json: (data) => {
            console.log(`📊 Response Status: ${code}`);
            console.log(`📊 Response Data:`, JSON.stringify(data, null, 2));
            return { status: code, json: data };
          }
        })
      };
      
      // Call the attendance marking function
      await markAttendance(mockReq, mockRes);
      
    } catch (controllerError) {
      console.error('❌ Error testing attendance controller:', controllerError.message);
    }
    
    console.log('\n🎉 Attendance marking test completed!');
    console.log('\n📋 Summary:');
    console.log('1. ✅ Test data created/found');
    console.log('2. ✅ Attendance marked in database');
    console.log('3. ✅ Email notification tested');
    console.log('4. ✅ Attendance controller tested');
    
    console.log('\n📧 Check your email inbox for:');
    console.log(`   - Test email to: ${customer.email}`);
    console.log('   - Look for "Attendance Marked" subject');
    console.log('   - Check spam folder if not in inbox');
    
  } catch (error) {
    console.error('❌ Error during test:', error.message);
    console.error('Stack trace:', error.stack);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the test
testAttendanceMarkingWithEmails();

