require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

async function test() {
  console.log('Testing SMTP Configuration...');
  console.log('Host:', process.env.SMTP_HOST);
  console.log('Port:', process.env.SMTP_PORT);
  console.log('User:', process.env.SMTP_EMAIL);
  console.log('Pass:', process.env.SMTP_PASSWORD ? '*** (provided)' : 'Missing');
  console.log('From:', `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>`);
  
  try {
    await sendEmail({
      email: 'sawarnatul@gmail.com', // User's email from screenshot
      subject: 'Test Email Configuration',
      message: 'This is a test email to verify SMTP configuration.',
    });
    console.log('✅ Success! The test email was accepted by the SMTP server.');
  } catch (error) {
    console.error('\n❌ FAILED TO SEND EMAIL');
    console.error('Error Code:', error.code);
    console.error('Error Message:', error.message);
    if (error.response) {
      console.error('SMTP Response:', error.response);
    }
  }
}

test();
