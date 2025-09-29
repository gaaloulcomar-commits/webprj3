const logger = require('../utils/logger');

const SMS_API_URL = 'http://197.5.145.178:7080/dsms-api/rest/campagnetemplate/sendregistersms';
const SMS_SOURCE = 'COMAR';

const sendSMS = async (phoneNumber, messageText) => {
  try {
    // Valider le message (max 150 caractères, seulement lettres et chiffres)
    const cleanMessage = messageText.replace(/[^a-zA-Z0-9\s]/g, '').substring(0, 150);
    
    const smsData = {
      messageText: cleanMessage,
      phoneNumber: phoneNumber,
      source: SMS_SOURCE
    };

    const response = await fetch(SMS_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(smsData)
    });

    if (!response.ok) {
      throw new Error(`SMS API error: ${response.status}`);
    }

    const result = await response.json();
    logger.info(`SMS sent successfully to ${phoneNumber}`);
    return result;

  } catch (error) {
    logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
    throw error;
  }
};

const sendScheduledTaskSMS = async (task, phoneNumbers) => {
  const message = `Tache planifiee ${task.name} executee avec succes`;
  
  for (const phoneNumber of phoneNumbers) {
    if (phoneNumber && phoneNumber.trim()) {
      try {
        await sendSMS(phoneNumber.trim(), message);
      } catch (error) {
        logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      }
    }
  }
};

module.exports = { sendSMS, sendScheduledTaskSMS };