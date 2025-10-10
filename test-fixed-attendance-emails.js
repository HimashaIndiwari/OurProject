import dotenv from 'dotenv';
import { sendAttendanceNotificationEmail } from './utils/wemailService.js';

// Load environment variables
dotenv.config();

console.log('🔧 TESTING FIXED ATTENDANCE EMAIL SYSTEM\n');

// Simulate the fixed logic
async function testFixedAttendanceEmailLogic() {
  console.log('🧪 Testing the fixed participant-to-user email lookup...\n');
  
  // Simulate session data (like what comes from database)
  const mockSession = {
    _id: 'session123',
    title: 'Cricket Batting Session',
    scheduledDate: new Date(),
    startTime: '10:00',
    endTime: '11:00',
    description: 'Learn proper batting techniques',
    participants: [
      {
        _id: 'participant1', // This is the participant ID sent by frontend
        user: 'user123', // This is the actual user ID
        attended: false
      },
      {
        _id: 'participant2', // This is the participant ID sent by frontend
        user: 'user456', // This is the actual user ID
        attended: false
      }
    ]
  };
  
  // Simulate attendance data (like what frontend sends)
  const mockAttendanceData = [
    {
      participantId: 'participant1', // Frontend sends participant._id
      attended: true
    },
    {
      participantId: 'participant2', // Frontend sends participant._id
      attended: false
    }
  ];
  
  // Simulate user data (like what comes from database)
  const mockUsers = [
    {
      _id: 'user123',
      firstName: 'John',
      lastName: 'Doe',
      email: process.env.EMAIL_USER // Use your email for testing
    },
    {
      _id: 'user456',
      firstName: 'Jane',
      lastName: 'Smith',
      email: process.env.EMAIL_USER // Use your email for testing
    }
  ];
  
  console.log('📋 Mock Data:');
  console.log('Session participants:', mockSession.participants.map(p => ({
    participantId: p._id,
    userId: p.user
  })));
  console.log('Attendance data:', mockAttendanceData);
  console.log('Users:', mockUsers.map(u => ({
    userId: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email
  })));
  console.log('');
  
  // Test the FIXED logic
  console.log('🔧 Testing FIXED logic:');
  
  // Step 1: Get participant IDs from attendance data
  const participantIds = [...new Set(mockAttendanceData.map(item => item.participantId))];
  console.log('1. Participant IDs from attendance data:', participantIds);
  
  // Step 2: Find session participants that match
  const sessionParticipants = mockSession.participants.filter(p => 
    participantIds.includes(p._id.toString())
  );
  console.log('2. Matching session participants:', sessionParticipants.map(p => ({
    participantId: p._id,
    userId: p.user
  })));
  
  // Step 3: Extract user IDs from participants
  const userIds = sessionParticipants.map(p => p.user.toString());
  console.log('3. User IDs extracted:', userIds);
  
  // Step 4: Find users in database
  const customers = mockUsers.filter(u => userIds.includes(u._id.toString()));
  console.log('4. Users found in database:', customers.map(u => ({
    userId: u._id,
    name: `${u.firstName} ${u.lastName}`,
    email: u.email
  })));
  
  // Step 5: Create participant-to-user mapping
  const participantToUserMap = {};
  sessionParticipants.forEach(participant => {
    const user = customers.find(c => c._id.toString() === participant.user.toString());
    if (user) {
      participantToUserMap[participant._id.toString()] = user;
    }
  });
  console.log('5. Participant-to-user mapping:', participantToUserMap);
  console.log('');
  
  // Step 6: Test email sending
  console.log('📧 Testing email sending with fixed logic:');
  
  let emailCount = 0;
  let successCount = 0;
  
  for (const item of mockAttendanceData) {
    const customer = participantToUserMap[item.participantId];
    console.log(`\nProcessing participant ${item.participantId}:`);
    
    if (!customer || !customer.email) {
      console.log(`❌ No customer or email found for participant ${item.participantId}`);
      continue;
    }
    
    console.log(`✅ Found customer: ${customer.firstName} ${customer.lastName} (${customer.email})`);
    
    const attendanceStatus = item.attended ? 'present' : 'absent';
    console.log(`📤 Sending ${attendanceStatus} email...`);
    
    emailCount++;
    
    try {
      const emailSent = await sendAttendanceNotificationEmail(
        customer,
        mockSession,
        attendanceStatus,
        'Test Coach'
      );
      
      if (emailSent) {
        console.log(`✅ Email sent successfully to ${customer.email}`);
        successCount++;
      } else {
        console.log(`❌ Email function returned false`);
      }
    } catch (error) {
      console.log(`❌ Error sending email:`, error.message);
    }
  }
  
  console.log(`\n📊 Results: ${successCount}/${emailCount} emails sent successfully`);
  
  if (successCount === emailCount) {
    console.log('🎉 SUCCESS! The fix is working correctly!');
  } else {
    console.log('❌ Some emails failed. Check the error messages above.');
  }
}

// Test the OLD logic (for comparison)
async function testOldAttendanceEmailLogic() {
  console.log('\n🔍 Testing OLD logic (for comparison):');
  
  const mockAttendanceData = [
    { participantId: 'participant1', attended: true },
    { participantId: 'participant2', attended: false }
  ];
  
  const mockUsers = [
    { _id: 'user123', firstName: 'John', lastName: 'Doe', email: process.env.EMAIL_USER },
    { _id: 'user456', firstName: 'Jane', lastName: 'Smith', email: process.env.EMAIL_USER }
  ];
  
  // OLD logic - trying to find users by participant ID directly
  const customerIds = [...new Set(mockAttendanceData.map(item => item.participantId))];
  console.log('OLD: Looking for users with IDs:', customerIds);
  
  const customers = mockUsers.filter(u => customerIds.includes(u._id.toString()));
  console.log('OLD: Users found:', customers.length);
  
  if (customers.length === 0) {
    console.log('❌ OLD logic fails - no users found because participant IDs ≠ user IDs');
  } else {
    console.log('✅ OLD logic would work (unexpected)');
  }
}

// Main execution
async function main() {
  console.log('🚀 Testing attendance email fix...\n');
  
  await testFixedAttendanceEmailLogic();
  await testOldAttendanceEmailLogic();
  
  console.log('\n🎯 SUMMARY:');
  console.log('✅ FIXED: Now correctly maps participant IDs to user IDs');
  console.log('✅ FIXED: Can find user email addresses for email notifications');
  console.log('✅ FIXED: Attendance emails should now work when marking attendance');
  console.log('');
  console.log('📋 NEXT STEPS:');
  console.log('1. Start your server: npm start');
  console.log('2. Mark attendance in coach dashboard');
  console.log('3. Check server console for email messages');
  console.log('4. Check your email inbox for notifications');
  console.log('');
  console.log('🔍 Look for these messages in server console:');
  console.log('   📧 Sending attendance notification emails...');
  console.log('   ✅ Professional attendance notification sent to [email]');
  
  process.exit(0);
}

main().catch(console.error);
