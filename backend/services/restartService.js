const executeSSHReboot = (server) => {
  return new Promise((resolve, reject) => {
    // Utiliser le script personnalisé si défini, sinon utiliser reboot
    const command = server.scriptPath ? server.scriptPath : 'reboot';
    
    const ssh = spawn('ssh', [
      '-o', 'StrictHostKeyChecking=no',
      '-o', 'ConnectTimeout=10',
      '-o', 'HostKeyAlgorithms=+ssh-rsa',
      `root@${server.hostname}`,
      command
    ]);

        io.emit('restart-status', {
          logId: restartLog.id,
          serverId: server.id,
          status: 'error',
          message: `Failed to execute script on ${server.name}: ${error.message}`
        });