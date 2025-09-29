// Send notification email if enabled
if (task.emailNotification && task.notificationEmails.length > 0) {
  await sendScheduledRestartNotification(task, task.notificationEmails);
}

// Send SMS notifications if phone numbers are provided
if (task.smsNotification && task.notificationPhones && task.notificationPhones.length > 0) {
  await sendScheduledTaskSMS(task, task.notificationPhones);
}