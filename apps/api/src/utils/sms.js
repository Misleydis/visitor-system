let client = null;
let twilioReady = false;

if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
  try {
    const twilio = require('twilio');
    client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    twilioReady = true;
    console.log('✅ Twilio SMS service ready');
  } catch (err) {
    console.warn('⚠️ Twilio init failed:', err.message);
  }
} else {
  console.warn('⚠️ Twilio credentials missing – SMS disabled');
}

async function sendSMS(to, ticketNumber, firstName) {
  if (!twilioReady || !client) {
    console.log(`[SMS disabled] Would send to ${to}: ticket ${ticketNumber} for ${firstName}`);
    return null;
  }
  try {
    // Ensure phone number is in E.164 format (add + if missing)
    let formattedNumber = to.trim();
    if (!formattedNumber.startsWith('+')) {
      formattedNumber = '+' + formattedNumber;
    }
    const message = await client.messages.create({
      body: `Welcome ${firstName}! Your visitor ticket number is ${ticketNumber}. Please present this number at reception.`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedNumber,
    });
    console.log(`✅ SMS sent to ${formattedNumber}, SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error('❌ Twilio error:', error.message, error.code);
    return null;
  }
}

module.exports = sendSMS;