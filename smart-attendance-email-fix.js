// This script shows you how to modify the attendance email logic
// to only send emails when attendance is first marked or when status changes

console.log('🔧 SMART ATTENDANCE EMAIL LOGIC\n');

console.log('📋 Current Behavior:');
console.log('❌ Emails are sent EVERY TIME attendance is marked');
console.log('❌ This means if you mark Present → Absent → Present, 3 emails are sent');
console.log('');

console.log('✅ Desired Behavior:');
console.log('✅ Emails are sent ONLY when:');
console.log('   1. Attendance is marked for the FIRST TIME');
console.log('   2. Attendance status CHANGES (Present → Absent or Absent → Present)');
console.log('');

console.log('🔧 Implementation Logic:');
console.log(`
// In the attendance marking function, add this logic:

for (const attendance of attendanceData) {
  const participant = session.participants.find(p => p._id.toString() === attendance.participantId);
  
  if (participant) {
    // Check if this is a status change
    const previousStatus = participant.attended;
    const newStatus = attendance.attended;
    const isFirstTimeMarking = participant.attended === undefined;
    const isStatusChanging = previousStatus !== newStatus;
    
    // Only send email if it's first time or status changed
    const shouldSendEmail = isFirstTimeMarking || isStatusChanging;
    
    // Update attendance
    participant.attended = attendance.attended;
    participant.attendanceStatus = attendance.attended ? 'present' : 'absent';
    participant.attendanceMarkedAt = new Date();
    
    // Store flag for email sending
    participant.shouldSendEmail = shouldSendEmail;
    
    console.log(\`Email will be sent: \${shouldSendEmail ? 'YES' : 'NO'} (First: \${isFirstTimeMarking}, Changed: \${isStatusChanging})\`);
  }
}

// Then in email sending section:
const emailPromises = attendanceData.map(async (item) => {
  const participant = session.participants.find(p => p._id.toString() === item.participantId);
  
  // Only send email if flag is set
  if (!participant || !participant.shouldSendEmail) {
    console.log(\`Skipping email for participant \${item.participantId} - no status change\`);
    return;
  }
  
  // Send email...
});
`);

console.log('🎯 Benefits:');
console.log('✅ Customers only get notified when attendance actually changes');
console.log('✅ No spam emails for repeated marking of same status');
console.log('✅ Still get notified on first marking and status changes');
console.log('✅ Better user experience');
console.log('');

console.log('📧 Email Scenarios:');
console.log('1. First time marking Present → ✅ Email sent');
console.log('2. First time marking Absent → ✅ Email sent');
console.log('3. Change Present to Absent → ✅ Email sent');
console.log('4. Change Absent to Present → ✅ Email sent');
console.log('5. Mark Present again (same status) → ❌ No email');
console.log('6. Mark Absent again (same status) → ❌ No email');
console.log('');

console.log('🚀 Ready to implement? The logic is ready to be added to your attendance controller!');

