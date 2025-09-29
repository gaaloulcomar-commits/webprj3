import React, { useState, useEffect } from 'react';
import { Server, Activity, AlertTriangle, CheckCircle, Clock, Wifi, WifiOff } from 'lucide-react';

interface DashboardStats {
  totalServers: number;
  onlineServers: number;
  offlineServers: number;
  pendingTasks: number;
  recentActions: number;
  averageResponseTime: number;
}

interface RecentActivity {
  id: string;
  action: string;
  serverName: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
  user: string;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalServers: 0,
    onlineServers: 0,
    offlineServers: 0,
    pendingTasks: 0,
    recentActions: 0,
    averageResponseTime: 0,
  });
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000); // rafraîchissement toutes les 30 secondes
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [statsResponse, activityResponse] = await Promise.all([
        fetch('http://localhost:3001/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        }),
        fetch('http://localhost:3001/api/dashboard/activity', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        })
      ]);

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData);
      }
    } catch (error) {
      console.error('Échec du chargement des données du tableau de bord :', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'À l’instant';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600';
      case 'failed': return 'text-red-600';
      case 'pending': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Tableau de bord</h1>

      {/* Cartes statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Serveurs totaux</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalServers}</p>
            </div>
            <Server className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Serveurs en ligne</p>
              <p className="text-2xl font-bold text-green-600">{stats.onlineServers}</p>
              <p className="text-xs text-gray-500">
                {stats.totalServers > 0 ? Math.round((stats.onlineServers / stats.totalServers) * 100) : 0}% disponibilité
              </p>
            </div>
            <Wifi className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Serveurs hors ligne</p>
              <p className="text-2xl font-bold text-red-600">{stats.offlineServers}</p>
              {stats.offlineServers > 0 && (
                <p className="text-xs text-red-500">Action requise</p>
              )}
            </div>
            <WifiOff className="w-8 h-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches en attente</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingTasks}</p>
              <p className="text-xs text-gray-500">Tâches planifiées</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Statistiques supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Performance du système</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Temps de réponse moyen</span>
              <span className="font-medium">
                {stats.averageResponseTime > 0 ? `${stats.averageResponseTime}ms` : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Actions récentes (24h)</span>
              <span className="font-medium">{stats.recentActions}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">État du système</span>
              <span className={`font-medium ${
                stats.offlineServers === 0 ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {stats.offlineServers === 0 ? 'Tous les systèmes opérationnels' : 'Problèmes détectés'}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h3 className="text-lg font-semibold mb-4">Actions rapides</h3>
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100">
              Voir tous les serveurs
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-green-50 text-green-700 rounded-lg hover:bg-green-100">
              Planifier la maintenance
            </button>
            <button className="w-full text-left px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100">
              Voir les journaux système
            </button>
            {stats.offlineServers > 0 && (
              <button className="w-full text-left px-3 py-2 text-sm bg-red-50 text-red-700 rounded-lg hover:bg-red-100">
                Vérifier les serveurs hors ligne
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Activité récente */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold mb-4">Activité récente</h3>
        
        {recentActivity.length === 0 ? (
          <p className="text-gray-600 text-center py-4">Aucune activité récente</p>
        ) : (
          <div className="space-y-3">
            {recentActivity.slice(0, 10).map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.status === 'success' ? 'bg-green-500' :
                    activity.status === 'failed' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {activity.action} sur {activity.serverName}
                    </p>
                    <p className="text-xs text-gray-600">
                      par {activity.user} • {formatTimestamp(activity.timestamp)}
                    </p>
                  </div>
                </div>
                <span className={`text-xs font-medium ${getStatusColor(activity.status)}`}>
                  {activity.status === 'success' ? 'Réussi' : activity.status === 'failed' ? 'Échoué' : 'En attente'}
                </span>
              </div>
            ))}
            
            {recentActivity.length > 10 && (
              <div className="text-center pt-2">
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  Voir toute l’activité
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
