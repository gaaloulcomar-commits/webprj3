import React, { useState, useEffect } from 'react';
import { usersAPI, authAPI } from '../services/api';
import { Users as UsersIcon, Plus, Edit, Shield } from 'lucide-react';
import toast from 'react-hot-toast';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  permissions: {
    canMonitor: boolean;
    canRestart: boolean;
    canViewLogs: boolean;
    canManageServers: boolean;
    canManageUsers: boolean;
    canScheduleTasks: boolean;
  };
  isActive: boolean;
  lastLogin?: string;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user',
    permissions: {
      canMonitor: true,
      canRestart: false,
      canViewLogs: true,
      canManageServers: false,
      canManageUsers: false,
      canScheduleTasks: false
    },
    isActive: true
  });

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error('Échec du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingUser) {
        await usersAPI.update(editingUser.id, formData);
        toast.success('Utilisateur mis à jour avec succès');
      } else {
        await authAPI.register(formData);
        toast.success('Utilisateur créé avec succès');
      }
      
      loadUsers();
      resetForm();
    } catch (error) {
      toast.error('Échec de l\'enregistrement de l\'utilisateur');
    }
  };

  const resetForm = () => {
    setShowModal(false);
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'user',
      permissions: {
        canMonitor: true,
        canRestart: false,
        canViewLogs: true,
        canManageServers: false,
        canManageUsers: false,
        canScheduleTasks: false
      },
      isActive: true
    });
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      permissions: user.permissions,
      isActive: user.isActive
    });
    setShowModal(true);
  };

  const updatePermission = (permission: keyof typeof formData.permissions) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const permissionLabels = {
    canMonitor: 'Surveiller les serveurs',
    canRestart: 'Redémarrer les serveurs',
    canViewLogs: 'Voir les journaux',
    canManageServers: 'Gérer les serveurs',
    canManageUsers: 'Gérer les utilisateurs',
    canScheduleTasks: 'Planifier des tâches'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Gestion des utilisateurs</h1>
          <p className="text-gray-400">Gérez les utilisateurs et leurs permissions</p>
        </div>
        <button
          onClick={() => { setEditingUser(null); setShowModal(true); }}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} className="mr-2" />
          Ajouter un utilisateur
        </button>
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700">
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white flex items-center">
            <UsersIcon className="mr-2" size={20} />
            Utilisateurs ({users.length})
          </h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Utilisateur</th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Rôle</th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Permissions</th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Statut</th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Dernière connexion</th>
                <th className="text-left py-3 px-6 text-gray-400 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors">
                  <td className="py-4 px-6">
                    <div>
                      <div className="text-white font-medium">{user.username}</div>
                      <div className="text-gray-400 text-sm">{user.email}</div>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center">
                      <Shield size={16} className={`mr-2 ${user.role === 'admin' ? 'text-yellow-400' : 'text-blue-400'}`} />
                      <span className={`capitalize font-medium ${user.role === 'admin' ? 'text-yellow-400' : 'text-blue-400'}`}>
                        {user.role}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(user.permissions)
                        .filter(([_, value]) => value)
                        .map(([key, _]) => (
                          <span key={key} className="px-2 py-1 bg-blue-900/20 text-blue-400 text-xs rounded">
                            {permissionLabels[key as keyof typeof permissionLabels]}
                          </span>
                        ))}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-900/20 text-green-400' : 'bg-red-900/20 text-red-400'}`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-gray-400 text-sm">
                    {user.lastLogin && !isNaN(new Date(user.lastLogin).getTime())
                      ? new Date(user.lastLogin).toLocaleString()
                      : 'Jamais'}
                  </td>
                  <td className="py-4 px-6">
                    <button
                      onClick={() => startEdit(user)}
                      className="p-2 text-blue-400 hover:text-blue-300 hover:bg-gray-700 rounded transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">
              {editingUser ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Nom d'utilisateur
                </label>
                <input
                  type="text"
                  required
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Mot de passe {editingUser && '(laisser vide pour conserver le mot de passe actuel)'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-1">
                  Rôle
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Permissions
                </label>
                <div className="space-y-2">
                  {(Object.keys(permissionLabels) as Array<keyof typeof formData.permissions>).map((key) => (
                    <label key={key} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.permissions[key]}
                        onChange={() => updatePermission(key)}
                        className="mr-2"
                      />
                      <span className="text-gray-300">{permissionLabels[key]}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="mr-2"
                />
                <label htmlFor="isActive" className="text-gray-300">
                  Actif
                </label>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingUser ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
