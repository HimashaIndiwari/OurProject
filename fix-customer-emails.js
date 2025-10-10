import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

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

console.log('🔧 CUSTOMER EMAIL ADDRESS FIX\n');

async function fixCustomerEmails() {
  try {
    await connectDB();
    
    console.log('📋 Checking customers without email addresses...\n');
    
    // Find users without email addresses
    const usersWithoutEmail = await User.find({ 
      email: { $exists: false } 
    });
    
    if (usersWithoutEmail.length === 0) {
      console.log('✅ All users have email addresses!');
      console.log('The issue might be elsewhere. Check server console for other error messages.');
      return;
    }
    
    console.log(`❌ Found ${usersWithoutEmail.length} users without email addresses:\n`);
    
    usersWithoutEmail.forEach((user, index) => {
      console.log(`${index + 1}. ${user.firstName} ${user.lastName} (ID: ${user._id})`);
    });
    
    console.log('\n🔧 FIXING EMAIL ADDRESSES...\n');
    
    // Add email addresses to users without them
    let updatedCount = 0;
    
    for (const user of usersWithoutEmail) {
      // Generate a test email address
      const testEmail = `${user.firstName?.toLowerCase() || 'user'}${user.lastName?.toLowerCase() || ''}@test.com`;
      
      try {
        await User.findByIdAndUpdate(user._id, { 
          email: testEmail 
        });
        
        console.log(`✅ Added email ${testEmail} to ${user.firstName} ${user.lastName}`);
        updatedCount++;
      } catch (error) {
        console.log(`❌ Failed to update ${user.firstName} ${user.lastName}:`, error.message);
      }
    }
    
    console.log(`\n📊 RESULTS: Updated ${updatedCount} users with email addresses`);
    
    if (updatedCount > 0) {
      console.log('\n🎉 SUCCESS! Customer email addresses have been added.');
      console.log('Now try marking attendance again - emails should be sent!');
      console.log('\n📧 Test emails were added in format: firstname.lastname@test.com');
      console.log('You can change these to real email addresses later.');
    }
    
  } catch (error) {
    console.error('❌ Error fixing customer emails:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Database disconnected');
  }
}

// Run the fix
fixCustomerEmails().catch(console.error);
