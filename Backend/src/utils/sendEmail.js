const { Resend } = require('resend');

const sendEmail = async (options) => {
  // If SMTP config is missing, throw an error instead of silently failing
  if (!process.env.SMTP_PASSWORD) {
    const errorMsg = 'Resend API Key (SMTP_PASSWORD) is missing in .env. Cannot send email.';
    console.error(`❌ ${errorMsg}`);
    throw new Error(errorMsg);
  }

  // Initialize Resend SDK with the API key
  const resend = new Resend(process.env.SMTP_PASSWORD);

  const from = `${process.env.FROM_NAME || 'IntellMeet'} <${process.env.FROM_EMAIL || process.env.SMTP_EMAIL}>`;

  try {
    const { data, error } = await resend.emails.send({
      from: from,
      to: options.email,
      subject: options.subject,
      text: options.message,
      // html: options.htmlMessage, // Optional
    });

    if (error) {
      console.error(`❌ Resend API Error sending to ${options.email}:`, error);
      throw new Error(error.message);
    }

    console.log(`✅ Email sent successfully to ${options.email}. ID: ${data.id}`);
  } catch (error) {
    console.error(`❌ Failed to send email to ${options.email}:`, error.message);
    throw error; // Re-throw so controller can handle/log it
  }
};

module.exports = sendEmail;
