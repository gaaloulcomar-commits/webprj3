const nodemailer = require('nodemailer');
const logger = require('../utils/logger');

// === CrÃ©ation du transporteur SMTP avec debug/log ===
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10),
  secure: process.env.SMTP_SECURE === 'true', // false pour STARTTLS sur 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  },
  logger: true, // logs dÃ©taillÃ©s Nodemailer
  debug: true   // debug SMTP
});

// === Fonction pour envoyer un email d'alerte ===
const sendAlertEmail = async (server, message) => {
  try {
    const adminEmails = process.env.ADMIN_EMAILS
      ? process.env.ADMIN_EMAILS.split(',')
      : ['medsalah.gaaloul@comar.tn'];

    // === Logs internes ===
    logger.info(`sendAlertEmail called for server: ${server.name}`);
    logger.debug(`Status: ${message}`);
    logger.debug(`Admin emails: ${adminEmails.join(',')}`);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: adminEmails.join(','),
      subject: `í ½íº¨ Server Alert: ${server.name}`,
      html: `
        <h2>Server Alert</h2>
        <p><strong>Server:</strong> ${server.name} (${server.hostname})</p>
        <p><strong>IP Address:</strong> ${server.ipAddress}</p>
        <p><strong>Status:</strong> ${message}</p>
        <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
        <p>Please check the server monitoring dashboard for more details.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Alert email successfully sent for server ${server.name}. Response: ${info.response}`);
  } catch (error) {
    logger.error('Failed to send alert email:', error);
  }
};

// === Fonction pour envoyer notification de redÃ©marrage planifiÃ© ===
const sendScheduledRestartNotification = async (task, emails) => {
  try {
    logger.info(`sendScheduledRestartNotification called for task: ${task.name}`);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: emails.join(','),
      subject: `Scheduled Server Restart: ${task.name}`,
      html: `
        <h2>Scheduled Server Restart</h2>
        <p><strong>Task:</strong> ${task.name}</p>
        <p><strong>Scheduled Time:</strong> ${new Date(task.scheduledTime).toLocaleString()}</p>
        <p><strong>Servers:</strong> ${task.serverIds.length} server(s)</p>
        <p>The scheduled server restart has been initiated.</p>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info(`Scheduled restart notification sent for task ${task.name}. Response: ${info.response}`);
  } catch (error) {
    logger.error('Failed to send scheduled restart notification:', error);
  }
};

// === Exports des fonctions ===
module.exports = { sendAlertEmail, sendScheduledRestartNotification };
