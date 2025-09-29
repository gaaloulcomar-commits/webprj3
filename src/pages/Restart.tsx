) : (
              <>
                <RotateCcw size={20} className="mr-2" />
                Exécuter les scripts ({selectedServers.length})
              </>
            )}
          </button>
@@ -85,7 +85,7 @@
      {restartStatus && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">État de l'exécution</h3>
          <div className="flex items-center space-x-2">
            {restartStatus.status === 'completed' ? (
              <CheckCircle className="text-green-500" size={20} />
@@ -134,6 +134,7 @@
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Hôte : {server.hostname}</p>
                    <p>IP : {server.ipAddress}:{server.port}</p>
                    <p>Script : {server.scriptPath || 'reboot'}</p>
                    <p>Ordre : #{server.restartOrder}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
@@ -154,7 +155,7 @@
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <RotateCcw size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Aucun serveur actif</h3>
          <p className="text-gray-500">Ajoutez des serveurs pour commencer à gérer l'exécution des scripts</p>
        </div>
      )}
    </div>