// test-mail.js
const { sendAlertEmail, sendScheduledRestartNotification } = require('./emailService');

(async () => {
  try {
    // === Test sendAlertEmail ===
    const fakeServer = {
      name: "TestServer",
      hostname: "test.local",
      ipAddress: "127.0.0.1"
    };
    await sendAlertEmail(fakeServer, "�� Server is offline (TEST)");

    // === Test sendScheduledRestartNotification ===
    const fakeTask = {
      name: "Nightly Restart",
      scheduledTime: new Date(),
      serverIds: [1, 2, 3]
    };
    await sendScheduledRestartNotification(fakeTask, [
      "medsalah.gaaloul@comar.tn"
    ]);

    console.log("✅ Les tests d'envoi d'email ont été exécutés avec succès");
  } catch (err) {
    console.error("❌ Erreur pendant les tests :", err);
  }
})();
