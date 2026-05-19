let client = null;
let twilioReady = false;

// Only initialize Twilio if credentials are present and valid format
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER) {
  if (process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioReady = true;
    console.log('✅ Twilio SMS service ready');
  } else {
    console.warn('⚠️ TWILIO_ACCOUNT_SID does not start with AC – SMS disabled');
  }
} else {
  console.warn('⚠️ Twilio credentials missing – SMS notifications disabled');
}

async function sendSMS(to, ticketNumber, firstName) {
  if (!twilioReady) {
    console.log(`[SMS disabled] Would send to ${to}: Ticket ${ticketNumber} for ${firstName}`);
    return null;
  }
  try {
    const message = await client.messages.create({
      body: `Welcome ${firstName}! Your visitor ticket number is ${ticketNumber}. Please present this number at reception.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: to
    });
    return message;
  } catch (error) {
    console.error('SMS error:', error.message);
    return null;
  }
}

module.exports = sendSMS;