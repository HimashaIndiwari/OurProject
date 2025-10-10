// This script will help you apply the smart email logic to your attendance controller
// It shows exactly what changes to make

console.log('🔧 APPLYING SMART EMAIL LOGIC TO ATTENDANCE CONTROLLER\n');

console.log('📋 What this does:');
console.log('✅ Only sends emails when attendance is FIRST marked');
console.log('✅ Only sends emails when attendance status CHANGES');
console.log('❌ Does NOT send emails when marking the same status again');
console.log('');

console.log('🎯 Email Scenarios:');
console.log('1. Mark Present (first time) → ✅ Email sent');
console.log('2. Mark Absent (first time) → ✅ Email sent');
console.log('3. Change Present → Absent → ✅ Email sent');
console.log('4. Change Absent → Present → ✅ Email sent');
console.log('5. Mark Present again (same status) → ❌ No email');
console.log('6. Mark Absent again (same status) → ❌ No email');
console.log('');

console.log('🔧 Changes to make in controllers/coachController.js:');
console.log('');

console.log('1. In the attendance update loop (around line 2601), replace:');
console.log(`
   // OLD CODE:
   participant.attended = attendance.attended;
   participant.attendanceStatus = attendance.attended ? 'present' : 'absent';
   participant.attendanceMarkedAt = new Date();
   
   // NEW CODE:
   // Check if attendance status is changing
   const previousStatus = participant.attended;
   const newStatus = attendance.attended;
   const isFirstTimeMarking = participant.attended === undefined;
   const isStatusChanging = previousStatus !== newStatus;
   
   // Update session participant data
   participant.attended = attendance.attended;
   participant.attendanceStatus = attendance.attended ? 'present' : 'absent';
   participant.attendanceMarkedAt = new Date();
   
   // Store email sending flag for later use
   participant.shouldSendEmail = isFirstTimeMarking || isStatusChanging;
   
   console.log(\`Email will be sent: \${participant.shouldSendEmail ? 'YES' : 'NO'} (First time: \${isFirstTimeMarking}, Status changed: \${isStatusChanging})\`);
`);

console.log('2. In the email sending section (around line 2732), replace:');
console.log(`
   // OLD CODE:
   const emailPromises = attendanceData.map(async (item) => {
     const customer = customerMap[item.participantId];
     if (!customer || !customer.email) {
       console.log(\`Skipping email for participant \${item.participantId} - no email found\`);
       return;
     }
   
   // NEW CODE:
   const emailPromises = attendanceData.map(async (item) => {
     const customer = customerMap[item.participantId];
     if (!customer || !customer.email) {
       console.log(\`Skipping email for participant \${item.participantId} - no email found\`);
       return;
     }
   
     // Find the participant to check if email should be sent
     const participant = session.participants.find(p => 
       p._id.toString() === item.participantId || 
       p.user && p.user.toString() === item.participantId
     );
     
     if (!participant || !participant.shouldSendEmail) {
       console.log(\`Skipping email for participant \${item.participantId} - no status change or already notified\`);
       return;
     }
`);

console.log('🚀 After making these changes:');
console.log('1. Restart your server');
console.log('2. Test by marking attendance multiple times');
console.log('3. Check server logs to see "Email will be sent: YES/NO" messages');
console.log('4. Only first marking and status changes will send emails');
console.log('');

console.log('📧 Expected server log messages:');
console.log('✅ "Email will be sent: YES (First time: true, Status changed: false)"');
console.log('✅ "Email will be sent: YES (First time: false, Status changed: true)"');
console.log('❌ "Email will be sent: NO (First time: false, Status changed: false)"');
console.log('❌ "Skipping email for participant [ID] - no status change or already notified"');
console.log('');

console.log('🎉 This will give you smart email notifications that only send when needed!');

