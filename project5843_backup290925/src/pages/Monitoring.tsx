import React, { useState, useEffect } from 'react';
import { useSocket } from '../contexts/SocketContext';
import { monitoringAPI } from '../services/api';
import { Activity, TrendingUp, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';

interface MonitorLog {
  id: number;
  serverId: number;
  pingStatus: boolean;
  telnetStatus: boolean;
  responseTime: number;
  createdAt: string;
  Server: {
    name: string;
    hostname: string;
  };
}

const Monitoring: React.FC = () => {
  const [logs, setLogs] = useState<MonitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedServer, setSelectedServer] = useState<number | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    loadMonitoringLogs();
  }, [selectedServer]);

  useEffect(() => {
    if (socket) {
      socket.on('server-status', (data) => {
        // Ajouter de nouvelles données de monitoring aux logs
        const newLog: MonitorLog = {
          id: Date.now(),
          serverId: data.serverId,
          pingStatus: data.pingStatus,
          telnetStatus: data.telnetStatus,
          responseTime: data.responseTime,
          createdAt: data.timestamp,
          Server: {
            name: `Serveur ${data.serverId}`,
            hostname: 'inconnu'
          }
        };
        
        setLogs(prev => [newLog, ...prev.slice(0, 49)]);
      });

      return () => {
        socket.off('server-status');
      };
    }
  }, [socket]);

  const loadMonitoringLogs = async () => {
    try {
      setLoading(true);
      const data = selectedServer 
        ? await monitoringAPI.getHistory(selectedServer, 50)
        : await monitoringAPI.getStatus();
      
      if (selectedServer) {
        setLogs(data);
      } else {
        // Transformer le statut serveur en format logs pour affichage
        const serverLogs = data.flatMap((server: any) => 
          server.MonitorLogs?.map((log: any) => ({
            ...log,
            Server: { name: server.name, hostname: server.hostname }
          })) || []
        );
        setLogs(serverLogs);
      }
    } catch (error) {
      toast.error('Échec du chargement des données de monitoring');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: boolean) => {
    return status ? 'text-green-500' : 'text-red-500';
  };

  const getStatusText = (status: boolean) => {
    return status ? 'Succès' : 'Échec';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Surveillance</h1>
          <p className="text-gray-400">Surveillance des serveurs en temps réel et historique</p>
        </div>
      </div>

      {/* Cartes d'état en temps réel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Moniteurs actifs</p>
              <p className="text-2xl font-bold text-blue-400">{logs.length}</p>
            </div>
            <Activity className="text-blue-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Temps de réponse moyen</p>
              <p className="text-2xl font-bold text-green-400">
                {logs.length > 0 
                  ? Math.round(logs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / logs.length)
                  : 0}ms
              </p>
            </div>
            <TrendingUp className="text-green-400" size={32} />
          </div>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Vérifications échouées</p>
              <p className="text-2xl font-bold text-red-400">
                {logs.filter(log => !log.pingStatus || !log.telnetStatus).length}
              </p>
            </div>
            <AlertTriangle className="text-red-400" size={32} />
          </div>
        </div>
      </div>

      {/* Tableau des logs de monitoring */}
      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <Activity className="mr-2" size={20} />
            Historique de surveillance
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Serveur</th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Statut Ping</th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Statut Telnet</th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Temps de réponse</th>
                  <th className="text-left py-3 px-6 text-gray-400 font-medium">Horodatage</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-gray-700 hover:bg-gray-750 transition-colors">
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-white font-medium">{log.Server?.name || 'Inconnu'}</div>
                        <div className="text-gray-400 text-sm">{log.Server?.hostname || 'N/A'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${getStatusColor(log.pingStatus)}`}>
                        {getStatusText(log.pingStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`font-medium ${getStatusColor(log.telnetStatus)}`}>
                        {getStatusText(log.telnetStatus)}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-300">
                      {log.responseTime ? `${log.responseTime}ms` : '-'}
                    </td>
                    <td className="py-4 px-6 text-gray-400 text-sm">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
                {logs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-8 px-6 text-center text-gray-400">
                      Aucune donnée de surveillance disponible
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Monitoring;