import nodemailer from 'nodemailer';

// --- Main Configuration ---
// Create transporter function that works like the basic email test
const createTransporter = () => {
  return nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

// Note: Transporter is created fresh for each email to avoid connection issues

// --- Function 1: Welcome Email ---
const sendWelcomeEmail = async (email, username) => {
  try {
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER, // Send from your main email
      to: email,
      subject: 'Welcome to CricketExpert!',
      html: `<h1>Hi ${username},</h1><p>Welcome to the team! We're glad to have you on board.</p>`,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`Welcome email sent to ${email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send welcome email:', error);
    return false;
  }
};

// --- Function 2: New User Notification for Manager ---
// This function sends an alert to the service manager
const sendNewUserNotification = async (newUser) => {
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: process.env.SERVICE_MANAGER_EMAIL, // Sends to the manager's email
        subject: 'New User Registration',
        html: `
            <h2>A new user has registered on CricketExpert:</h2>
            <ul>
                <li><strong>Username:</strong> ${newUser.username}</li>
                <li><strong>Email:</strong> ${newUser.email}</li>
                <li><strong>First Name:</strong> ${newUser.firstName}</li>
                <li><strong>Last Name:</strong> ${newUser.lastName}</li>
                <li><strong>Registered At:</strong> ${new Date(newUser.createdAt).toLocaleString()}</li>
            </ul>
        `,
    };
    const info = await transporter.sendMail(mailOptions);
    console.log(`New user notification sent to service manager: ${info.response}`);
};


// --- Function 3: Password Reset Code Email ---
const sendPasswordResetCodeEmail = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your Password Reset Code',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Use the following code to reset your password:</p>
      <h3><strong>${code}</strong></h3>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Password reset code sent to ${email}`);
};

// --- Function 4: Email Verification Code ---
const sendEmailVerificationCode = async (email, code) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Email Verification Code',
    html: `
      <h2>Email Verification</h2>
      <p>Thank you for signing up! Please verify your email address using the following code:</p>
      <h3><strong>${code}</strong></h3>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not create an account, please ignore this email.</p>
    `,
  };
  await transporter.sendMail(mailOptions);
  console.log(`Email verification code sent to ${email}`);
};

// --- Function 5: Low Stock Alert Email ---
const sendLowStockAlert = async (product) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: process.env.SERVICE_MANAGER_EMAIL, // Send to admin/manager
    subject: `🚨 LOW STOCK ALERT: ${product.name}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #dc3545;">⚠️ Low Stock Alert</h2>
        <p>Dear Admin,</p>
        <p>The following product is running low on stock:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #072679; margin-top: 0;">${product.name}</h3>
          <p><strong>Product ID:</strong> ${product.productId}</p>
          <p><strong>Category:</strong> ${product.category}</p>
          <p><strong>Brand:</strong> ${product.brand}</p>
          <p><strong>Current Stock:</strong> <span style="color: #dc3545; font-weight: bold;">${product.stock_quantity}</span></p>
          <p><strong>Price:</strong> LKR ${product.price}</p>
        </div>
        
        <p style="color: #dc3545; font-weight: bold;">⚠️ Action Required: Please restock this item immediately!</p>
        
        <p>This alert was triggered when stock fell to ${product.stock_quantity} units or below.</p>
        
        <hr style="margin: 30px 0;">
        <p style="color: #6c757d; font-size: 12px;">
          This is an automated alert from CricketExpert Inventory Management System.<br>
          Generated on: ${new Date().toLocaleString()}
        </p>
      </div>
    `,
  };
  
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Low stock alert email sent to admin for ${product.name}: ${info.response}`);
  } catch (error) {
    console.error('❌ Failed to send low stock alert email:', error);
  }
};

// --- Function 6: Order Confirmation Email to Customer ---
const sendOrderConfirmationEmail = async (order, customer) => {
  try {
    console.log('📧 Starting to send order confirmation email to customer...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: `🎉 Order Confirmation - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #42ADF5;">🎉 Order Confirmation - CricketExpert</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p><strong>Your order was successful. Thank you for shopping with us!</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date || order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> LKR ${order.amount || 0}.00</p>
            <p><strong>Delivery Address:</strong> ${order.address || 'N/A'}</p>
          </div>

          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Order Items</h3>
            ${order.items && order.items.length > 0 ? 
              order.items.map(item => `
                <div style="border-bottom: 1px solid #dee2e6; padding: 10px 0;">
                  <p style="margin: 5px 0;"><strong>${item.productId?.name || 'Unknown Product'}</strong></p>
                  <p style="margin: 5px 0; color: #6c757d;">Quantity: ${item.quantity} × LKR ${item.priceAtOrder || 0} = LKR ${(item.quantity * (item.priceAtOrder || 0)).toFixed(2)}</p>
                </div>
              `).join('') : 
              '<p>No items found</p>'
            }
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c5460;">What's Next?</h3>
            <p style="color: #0c5460; margin: 0;">Your order is being processed and will be delivered to your address soon. You will receive updates on your order status.</p>
          </div>
          
          <p>If you have any questions about your order, please don't hesitate to contact us.</p>
          <p>Thank you for choosing CricketExpert!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated confirmation from CricketExpert Order Management System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Order confirmation email sent to customer ${customer.email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order confirmation email to customer:', error);
    return false;
  }
};

// --- Function 7: Order Notification Email to Manager ---
const sendOrderManagerNotificationEmail = async (order, customer) => {
  try {
    console.log('📧 Starting to send order notification email to manager...');
    
    const serviceManagerEmail = process.env.SERVICE_MANAGER_EMAIL;
    if (!serviceManagerEmail) {
      console.error('❌ Service manager email not configured');
      throw new Error('Service manager email not configured');
    }
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: serviceManagerEmail,
      subject: `📦 New Order Received - ${order._id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">📦 New Order Received</h2>
          <p>Dear Order Manager,</p>
          <p>A new order has been placed and requires your attention.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Order Information</h3>
            <p><strong>Order ID:</strong> ${order._id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.date || order.createdAt).toLocaleDateString()}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Total Amount:</strong> LKR ${order.amount || 0}.00</p>
            <p><strong>Payment ID:</strong> ${order.paymentId || 'N/A'}</p>
          </div>

          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${customer.firstName || ''} ${customer.lastName || ''}</p>
            <p><strong>Email:</strong> ${customer.email || 'N/A'}</p>
            <p><strong>Phone:</strong> ${customer.phone || 'N/A'}</p>
            <p><strong>Delivery Address:</strong> ${order.address || 'N/A'}</p>
          </div>

          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #856404; margin-top: 0;">Order Items</h3>
            ${order.items && order.items.length > 0 ? 
              order.items.map(item => `
                <div style="border-bottom: 1px solid #ffeaa7; padding: 10px 0;">
                  <p style="margin: 5px 0;"><strong>${item.productId?.name || 'Unknown Product'}</strong></p>
                  <p style="margin: 5px 0; color: #856404;">Quantity: ${item.quantity} × LKR ${item.priceAtOrder || 0} = LKR ${(item.quantity * (item.priceAtOrder || 0)).toFixed(2)}</p>
                </div>
              `).join('') : 
              '<p>No items found</p>'
            }
          </div>
          
          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c5460;">Action Required</h3>
            <ol style="color: #0c5460;">
              <li>Review the order details</li>
              <li>Prepare the items for packaging</li>
              <li>Update order status to "Processing"</li>
              <li>Arrange for delivery</li>
            </ol>
          </div>
          
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated notification from CricketExpert Order Management System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Order notification email sent to manager ${serviceManagerEmail}: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send order notification email to manager:', error);
    return false;
  }
};


// --- Function 8: Supplier Order Email ---
const sendSupplierOrderEmail = async (product, quantity, supplierEmail) => {
  try {
    console.log('📧 Starting to send supplier order email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: supplierEmail,
      subject: `📦 Stock Reorder Request - ${product.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">📦 Stock Reorder Request</h2>
          <p>Dear Supplier,</p>
          <p>We need to place an urgent reorder for the following product due to low stock levels.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Product Information</h3>
            <p><strong>Product Name:</strong> ${product.name}</p>
            <p><strong>Product Code:</strong> ${product.productId}</p>
            <p><strong>Category:</strong> ${product.category}</p>
            <p><strong>Brand:</strong> ${product.brand || 'N/A'}</p>
            <p><strong>Current Stock:</strong> ${product.stock_quantity} units</p>
            <p><strong>Requested Quantity:</strong> ${quantity} units</p>
            <p><strong>Unit Price:</strong> LKR ${product.price}.00</p>
            <p><strong>Total Estimated Cost:</strong> LKR ${(product.price * quantity).toLocaleString()}.00</p>
          </div>

          <div style="background-color: ${product.stock_quantity < 10 ? '#f8d7da' : '#fff3cd'}; border: 1px solid ${product.stock_quantity < 10 ? '#f5c6cb' : '#ffeaa7'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: ${product.stock_quantity < 10 ? '#721c24' : '#856404'}; margin-top: 0;">
              ${product.stock_quantity < 10 ? '🚨 URGENT - Critical Stock Level' : '⚠️ Low Stock Alert'}
            </h3>
            <p>This product is currently at a ${product.stock_quantity < 10 ? 'critical' : 'low'} stock level and requires immediate attention.</p>
          </div>

          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Next Steps</h3>
            <p>Please confirm:</p>
            <ul>
              <li>Availability of ${quantity} units</li>
              <li>Current pricing and any bulk discounts</li>
              <li>Estimated delivery timeline</li>
              <li>Payment terms and methods</li>
            </ul>
          </div>

          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #0c5460; margin-top: 0;">Contact Information</h3>
            <p><strong>Company:</strong> CricketExpert</p>
            <p><strong>Email:</strong> ${process.env.EMAIL_USER}</p>
            <p><strong>Request Date:</strong> ${new Date().toLocaleDateString()}</p>
          </div>

          <p style="margin-top: 30px;">Thank you for your prompt attention to this matter. We look forward to your response.</p>
          
          <p>Best regards,<br>
          <strong>CricketExpert Inventory Management Team</strong></p>
        </div>
      `,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`✅ Supplier order email sent successfully to: ${supplierEmail}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send supplier order email:', error);
    return false;

      }
};

// --- Function 9: Certificate Email ---
const sendCertificateEmail = async (email, fullName, programTitle, certificateNumber) => {
  try {
    console.log('📧 Starting to send certificate email...');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `🎓 Certificate of Completion - ${programTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #28a745;">🎓 Certificate of Completion</h2>
          <p>Dear ${fullName},</p>
          <p><strong>Congratulations! You have successfully completed the ${programTitle} program.</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Certificate Details</h3>
            <p><strong>Program:</strong> ${programTitle}</p>
            <p><strong>Certificate Number:</strong> ${certificateNumber}</p>
            <p><strong>Issue Date:</strong> ${new Date().toLocaleDateString()}</p>
            <p><strong>Recipient:</strong> ${fullName}</p>
          </div>

          <div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #0c5460;">What's Next?</h3>
            <p style="color: #0c5460; margin: 0;">You can download your certificate from your dashboard or use the certificate number to verify your completion.</p>
          </div>
          
          <p>We are proud of your achievement and wish you continued success in your cricket journey!</p>
          <p>Thank you for being part of CricketExpert!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated certificate notification from CricketExpert Certificate System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Certificate email sent to ${email}: ${info.response}`);
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send certificate email:', error);
    return { success: false, error: error.message };
  }
};

// --- Function 10: Attendance Notification Email ---
const sendAttendanceNotificationEmail = async (customer, session, attendanceStatus, coachName) => {
  try {
    console.log('📧 Starting to send attendance notification email...');
    
    if (!customer.email) {
      console.log('⚠️ Customer email not found, skipping attendance notification email');
      return false;
    }

    const statusEmoji = attendanceStatus === 'present' ? '✅' : '❌';
    const statusColor = attendanceStatus === 'present' ? '#28a745' : '#dc3545';
    const statusText = attendanceStatus === 'present' ? 'Present' : 'Absent';
    
    const transporter = createTransporter();
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: customer.email,
      subject: `${statusEmoji} Attendance Marked - ${session.title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #42ADF5;">${statusEmoji} Attendance Update - CricketExpert</h2>
          <p>Dear ${customer.firstName || 'Customer'},</p>
          <p><strong>Your attendance has been marked for the coaching session.</strong></p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Session Details</h3>
            <p><strong>Session:</strong> ${session.title}</p>
            <p><strong>Date:</strong> ${new Date(session.scheduledDate).toLocaleDateString()}</p>
            <p><strong>Time:</strong> ${session.startTime} - ${session.endTime}</p>
            <p><strong>Coach:</strong> ${coachName || 'Your Coach'}</p>
            ${session.description ? `<p><strong>Description:</strong> ${session.description}</p>` : ''}
          </div>

          <div style="background-color: ${attendanceStatus === 'present' ? '#d4edda' : '#f8d7da'}; border: 1px solid ${attendanceStatus === 'present' ? '#c3e6cb' : '#f5c6cb'}; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: ${statusColor};">Attendance Status: ${statusText}</h3>
            <p style="color: ${statusColor}; margin: 0; font-size: 18px; font-weight: bold;">
              ${attendanceStatus === 'present' ? 
                'Great job! You were marked as present for this session.' : 
                'You were marked as absent for this session. Please contact your coach if this is incorrect.'
              }
            </p>
          </div>

          ${attendanceStatus === 'present' ? 
            `<div style="background-color: #d1ecf1; border: 1px solid #bee5eb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #0c5460;">Keep Up the Great Work!</h3>
              <p style="color: #0c5460; margin: 0;">Your consistent attendance is helping you improve your cricket skills. Continue attending sessions to maximize your progress!</p>
            </div>` :
            `<div style="background-color: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #856404;">Missed Session</h3>
              <p style="color: #856404; margin: 0;">If you missed this session due to an emergency or scheduling conflict, please contact your coach to discuss make-up options or rescheduling.</p>
            </div>`
          }
          
          <div style="background-color: #e2e3e5; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #072679; margin-top: 0;">Next Steps</h3>
            <ul style="color: #072679;">
              <li>Check your dashboard for session updates and materials</li>
              <li>Review any homework or practice assignments</li>
              <li>Prepare for your next coaching session</li>
              ${attendanceStatus === 'absent' ? '<li>Contact your coach if you need to reschedule or have questions</li>' : ''}
            </ul>
          </div>
          
          <p>If you have any questions about your attendance or the session, please don't hesitate to contact your coach or our support team.</p>
          <p>Thank you for being part of CricketExpert!</p>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6c757d; font-size: 12px;">
            This is an automated attendance notification from CricketExpert Coaching System.<br>
            Generated on: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log(`📧 Attendance notification email sent to customer ${customer.email}: ${info.response}`);
    return true;
  } catch (error) {
    console.error('❌ Failed to send attendance notification email:', error);
    return false;
  }
};

export {
  sendWelcomeEmail,
  sendNewUserNotification,
  sendPasswordResetCodeEmail,
  sendEmailVerificationCode,
  sendLowStockAlert,
  sendOrderConfirmationEmail,
  sendOrderManagerNotificationEmail,
  sendSupplierOrderEmail,
  sendCertificateEmail,
  sendAttendanceNotificationEmail
}