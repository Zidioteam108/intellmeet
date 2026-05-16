const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // If SMTP config is missing, log to console for development/testing
  if (!process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_EMAIL || !process.env.SMTP_PASSWORD) {
    console.log('---------------------------------------------------------');
    console.log('✉️  EMAIL SIMULATION (SMTP not configured in .env)');
    console.log(`To: ${options.email}`);
    console.log(`Subject: ${options.subject}`);
    console.log(`Message: \n${options.message}`);
    console.log('---------------------------------------------------------');
    return;
  }

  // Create transporter with real SMTP settings
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const message = {
    from: `${process.env.FROM_NAME || 'IntellMeet'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html: options.htmlMessage, // Optional
  };

  try {
    const info = await transporter.sendMail(message);
    console.log(`✅ Email sent successfully to ${options.email}. ID: ${info.messageId}`);
  } catch (error) {
    console.error(`❌ SMTP Error sending to ${options.email}:`, error.message);
    throw error; // Re-throw so controller can handle/log it
  }
};

module.exports = sendEmail;
