import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { serversAPI, restartAPI } from '../services/api';
import { RotateCcw, Play, Square, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface Server {
  id: number;
  name: string;
  hostname: string;
  ipAddress: string;
  port: number;
  status: string;
  group: string;
  restartOrder: number;
}

const Restart: React.FC = () => {
  const [servers, setServers] = useState<Server[]>([]);
  const [selectedServers, setSelectedServers] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [restarting, setRestarting] = useState(false);
  const [restartStatus, setRestartStatus] = useState<any>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadServers();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on('restart-status', (data) => {
        setRestartStatus(data);
        
        if (data.status === 'completed' || data.status === 'failed') {
          setRestarting(false);
          toast.success(`Processus de redémarrage ${data.status === 'completed' ? 'terminé' : 'échoué'}`);
        }
      });

      return () => {
        socket.off('restart-status');
      };
    }
  }, [socket]);

  const loadServers = async () => {
    try {
      const data = await serversAPI.getAll();
      setServers(data.filter((s: Server) => s.isActive));
    } catch (error) {
      toast.error('Échec du chargement des serveurs');
    } finally {
      setLoading(false);
    }
  };

  const handleServerToggle = (serverId: number) => {
    setSelectedServers(prev => 
      prev.includes(serverId)
        ? prev.filter(id => id !== serverId)
        : [...prev, serverId]
    );
  };

  const handleSelectAll = () => {
    setSelectedServers(
      selectedServers.length === servers.length 
        ? [] 
        : servers.map(s => s.id)
    );
  };

  const handleRestart = async () => {
    if (selectedServers.length === 0) {
      toast.error('Veuillez sélectionner au moins un serveur');
      return;
    }

    if (!confirm(`Êtes-vous sûr de vouloir redémarrer ${selectedServers.length} serveur(s) ?`)) {
      return;
    }

    try {
      setRestarting(true);
      setRestartStatus(null);
      await restartAPI.execute(selectedServers);
      toast.success('Processus de redémarrage lancé');
    } catch (error) {
      toast.error('Échec du lancement du processus de redémarrage');
      setRestarting(false);
    }
  };

  const getServersByGroup = () => {
    const groups: { [key: string]: Server[] } = {};
    servers.forEach(server => {
      if (!groups[server.group]) {
        groups[server.group] = [];
      }
      groups[server.group].push(server);
    });
    
    // Trier les serveurs dans chaque groupe selon l'ordre de redémarrage
    Object.keys(groups).forEach(group => {
      groups[group].sort((a, b) => a.restartOrder - b.restartOrder);
    });
    
    return groups;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const serverGroups = getServersByGroup();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Redémarrage des serveurs</h1>
          <p className="text-gray-400">Sélectionnez et redémarrez les serveurs individuellement ou par groupe</p>
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={handleSelectAll}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {selectedServers.length === servers.length ? 'Tout désélectionner' : 'Tout sélectionner'}
          </button>
          
          <button
            onClick={handleRestart}
            disabled={restarting || selectedServers.length === 0}
            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {restarting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Redémarrage...
              </>
            ) : (
              <>
                <RotateCcw size={20} className="mr-2" />
                Redémarrer la sélection ({selectedServers.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* État du redémarrage */}
      {restartStatus && (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-2">État du redémarrage</h3>
          <div className="flex items-center space-x-2">
            {restartStatus.status === 'completed' ? (
              <CheckCircle className="text-green-500" size={20} />
            ) : restartStatus.status === 'failed' ? (
              <AlertCircle className="text-red-500" size={20} />
            ) : (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
            )}
            <span className="text-gray-300">{restartStatus.message}</span>
          </div>
        </div>
      )}

      {/* Groupes de serveurs */}
      {Object.entries(serverGroups).map(([groupName, groupServers]) => (
        <div key={groupName} className="bg-gray-800 rounded-lg border border-gray-700">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <RotateCcw className="mr-2" size={20} />
              Groupe {groupName.charAt(0).toUpperCase() + groupName.slice(1)} ({groupServers.length})
            </h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupServers.map((server) => (
                <div
                  key={server.id}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedServers.includes(server.id)
                      ? 'border-blue-500 bg-blue-900/20'
                      : 'border-gray-600 hover:border-gray-500'
                  }`}
                  onClick={() => handleServerToggle(server.id)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-white font-medium">{server.name}</h3>
                    <input
                      type="checkbox"
                      checked={selectedServers.includes(server.id)}
                      onChange={() => handleServerToggle(server.id)}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-400">
                    <p>Hôte : {server.hostname}</p>
                    <p>IP : {server.ipAddress}:{server.port}</p>
                    <p>Ordre : #{server.restartOrder}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div className={`w-2 h-2 rounded-full ${
                        server.status === 'online' ? 'bg-green-500' : 
                        server.status === 'offline' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}></div>
                      <span className="capitalize">{server.status || 'inconnu'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {servers.length === 0 && (
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-12 text-center">
          <RotateCcw size={48} className="mx-auto text-gray-600 mb-4" />
          <h3 className="text-xl font-medium text-gray-400 mb-2">Aucun serveur actif</h3>
          <p className="text-gray-500">Ajoutez des serveurs pour commencer à gérer les redémarrages</p>
        </div>
      )}
    </div>
  );
};

export default Restart;
