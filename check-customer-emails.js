import mongoose from 'mongoose';
import User from './models/User.js';
import Session from './models/Session.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function checkCustomerEmails() {
  console.log('🔍 CHECKING CUSTOMER EMAIL ADDRESSES...\n');
  
  try {
    // Try to connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/cricketxpert');
    console.log('✅ Connected to MongoDB');
    
    // Find customers with email addresses
    console.log('\n👥 Checking customers with email addresses...');
    const customers = await User.find({ 
      role: 'customer',
      email: { $exists: true, $ne: null, $ne: '' }
    });
    
    console.log(`Found ${customers.length} customers with email addresses:`);
    
    if (customers.length === 0) {
      console.log('❌ NO CUSTOMERS WITH EMAIL ADDRESSES FOUND!');
      console.log('This is why you\'re not receiving emails.');
      console.log('');
      console.log('🔧 Solution: Add email addresses to your customers in the database');
      return;
    }
    
    customers.forEach((customer, index) => {
      console.log(`${index + 1}. ${customer.firstName || 'Unknown'} ${customer.lastName || ''}`);
      console.log(`   Email: ${customer.email}`);
      console.log(`   ID: ${customer._id}`);
      console.log('');
    });
    
    // Find sessions with participants
    console.log('📅 Checking sessions with participants...');
    const sessions = await Session.find()
      .populate('participants.user', 'firstName lastName email')
      .limit(5);
    
    console.log(`Found ${sessions.length} sessions:`);
    
    sessions.forEach((session, index) => {
      console.log(`\n${index + 1}. Session: ${session.title}`);
      console.log(`   ID: ${session._id}`);
      console.log(`   Participants: ${session.participants.length}`);
      
      if (session.participants.length > 0) {
        session.participants.forEach((participant, pIndex) => {
          console.log(`   ${pIndex + 1}. Participant ID: ${participant._id}`);
          console.log(`      User ID: ${participant.user?._id || 'N/A'}`);
          console.log(`      Name: ${participant.user?.firstName || 'Unknown'} ${participant.user?.lastName || ''}`);
          console.log(`      Email: ${participant.user?.email || '❌ NO EMAIL'}`);
          console.log(`      Role: ${participant.user?.role || 'Unknown'}`);
        });
      }
    });
    
    // Check if participant IDs match customer IDs
    console.log('\n🔗 Checking if participant IDs match customer IDs...');
    let matchFound = false;
    
    sessions.forEach(session => {
      session.participants.forEach(participant => {
        const customer = customers.find(c => c._id.toString() === participant.user?._id?.toString());
        if (customer) {
          console.log(`✅ Match found: ${customer.firstName} ${customer.lastName} (${customer.email})`);
          matchFound = true;
        }
      });
    });
    
    if (!matchFound) {
      console.log('❌ NO MATCHES FOUND between participants and customers with emails');
      console.log('This could be why emails are not being sent.');
    }
    
  } catch (error) {
    if (error.message.includes('ECONNREFUSED')) {
      console.log('❌ Database not running or connection refused');
      console.log('This is normal if your database is not running');
      console.log('');
      console.log('🔧 To fix this:');
      console.log('1. Start your MongoDB database');
      console.log('2. Or check your MONGODB_URI in .env file');
    } else {
      console.error('❌ Error:', error.message);
    }
  } finally {
    try {
      await mongoose.connection.close();
      console.log('\n🔌 Database connection closed');
    } catch (e) {
      // Ignore close errors
    }
  }
}

checkCustomerEmails();

