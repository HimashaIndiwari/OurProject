import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testBasicEmail() {
  console.log('🧪 Testing Basic Email Functionality...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log(`EMAIL_USER: ${process.env.EMAIL_USER ? '✅ Set' : '❌ Not set'}`);
  console.log(`EMAIL_PASS: ${process.env.EMAIL_PASS ? '✅ Set' : '❌ Not set'}`);
  console.log('');
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email credentials not configured!');
    console.error('Please set EMAIL_USER and EMAIL_PASS in your .env file');
    return;
  }
  
  try {
    // Create transporter
    console.log('📧 Creating email transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    
    // Verify connection
    console.log('🔍 Verifying email connection...');
    await transporter.verify();
    console.log('✅ Email connection verified successfully!');
    
    // Send test email
    console.log('📤 Sending test email...');
    const testEmail = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: testEmail,
      subject: '🧪 Test Email - CricketExpert Attendance System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #42ADF5;">🧪 Email Test - CricketExpert</h2>
          <p>This is a test email to verify that the email system is working correctly.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Test Details</h3>
            <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
            <p><strong>From:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>To:</strong> ${testEmail}</p>
            <p><strong>Purpose:</strong> Testing attendance email system</p>
          </div>
          
          <div style="background-color: #d4edda; border: 1px solid #c3e6cb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #155724;">✅ Email System Working!</h3>
            <p style="color: #155724; margin: 0;">If you received this email, the basic email functionality is working correctly.</p>
          </div>
          
          <p>This test confirms that:</p>
          <ul>
            <li>✅ Gmail SMTP connection is working</li>
            <li>✅ Email credentials are correct</li>
            <li>✅ HTML emails can be sent</li>
            <li>✅ Email delivery is functional</li>
          </ul>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is a test email from CricketExpert Email System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✅ Test email sent successfully!');
    console.log(`📧 Message ID: ${result.messageId}`);
    console.log(`📬 Sent to: ${testEmail}`);
    
    console.log('\n🎉 Basic email test completed successfully!');
    console.log('\n📋 What to check:');
    console.log('1. Check your email inbox for the test email');
    console.log('2. Check spam/junk folder if not in inbox');
    console.log('3. If you received the email, the system is working!');
    
  } catch (error) {
    console.error('❌ Error during basic email test:', error.message);
    
    if (error.code === 'EAUTH') {
      console.error('\n🔐 Authentication Error:');
      console.error('- Check that EMAIL_USER is your Gmail address');
      console.error('- Check that EMAIL_PASS is your Gmail App Password (not regular password)');
      console.error('- Make sure 2-factor authentication is enabled on your Gmail account');
      console.error('- Generate a new App Password if needed');
    } else if (error.code === 'ECONNECTION') {
      console.error('\n🌐 Connection Error:');
      console.error('- Check your internet connection');
      console.error('- Check if Gmail SMTP is accessible');
    } else {
      console.error('\n❓ Other Error:');
      console.error('- Check the error message above for details');
      console.error('- Verify all environment variables are set correctly');
    }
  }
}

// Run the test
testBasicEmail();
