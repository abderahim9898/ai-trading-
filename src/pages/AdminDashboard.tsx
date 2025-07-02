import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getAllUsers, 
  getAllRecommendations, 
  updateUserPlanAdmin, 
  updateUserUsage, 
  deleteUser,
  getPlans,
  getSchools,
  createPlan,
  updatePlan,
  deletePlan,
  createSchool,
  updateSchool,
  deleteSchool,
  getAllFeaturedSignals,
  saveFeaturedSignal,
  updateFeaturedSignal,
  deleteFeaturedSignal
} from '../services/firestore';
import { User, Plan, School, Recommendation } from '../types';
import DailyResetManager from '../components/DailyResetManager';
import { 
  Shield, 
  Users, 
  BarChart3, 
  DollarSign, 
  Settings,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Crown,
  Zap,
  Activity,
  TrendingUp,
  Calendar,
  Clock,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Star,
  Target
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [featuredSignals, setFeaturedSignals] = useState<any[]>([]);
  
  // Edit states
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingPlan, setEditingPlan] = useState<string | null>(null);
  const [editingSchool, setEditingSchool] = useState<string | null>(null);
  const [newPlan, setNewPlan] = useState<Partial<Plan>>({});
  const [newSchool, setNewSchool] = useState<Partial<School>>({});

  useEffect(() => {
    if (user?.isAdmin) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [usersData, recsData, plansData, schoolsData, signalsData] = await Promise.all([
        getAllUsers(),
        getAllRecommendations(),
        getPlans(),
        getSchools(),
        getAllFeaturedSignals()
      ]);
      
      setUsers(usersData);
      setRecommendations(recsData);
      setPlans(plansData);
      setSchools(schoolsData);
      setFeaturedSignals(signalsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUserPlan = async (userId: string, planId: string) => {
    try {
      await updateUserPlanAdmin(userId, planId);
      await loadAllData();
    } catch (error) {
      console.error('Error updating user plan:', error);
    }
  };

  const handleUpdateUserUsage = async (userId: string, usedToday: number, limit: number) => {
    try {
      await updateUserUsage(userId, usedToday, limit);
      await loadAllData();
    } catch (error) {
      console.error('Error updating user usage:', error);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteUser(userId);
      await loadAllData();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.plan !== 'free').length;
    const totalRecommendations = recommendations.length;
    const revenueMonthly = users.reduce((sum, u) => {
      const plan = plans.find(p => p.id === u.plan);
      return sum + (plan?.price || 0);
    }, 0);

    return { totalUsers, activeSubscriptions, totalRecommendations, revenueMonthly };
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Shield className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'elite': return <Crown className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'text-gray-400 bg-gray-400/10';
      case 'pro': return 'text-blue-400 bg-blue-400/10';
      case 'elite': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-300">You don't have admin privileges.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'plans', label: 'Plans', icon: Crown },
    { id: 'schools', label: 'Schools', icon: Settings },
    { id: 'signals', label: 'Featured Signals', icon: Star },
    { id: 'reset', label: 'Daily Reset', icon: Clock }
  ];

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <Shield className="h-8 w-8 text-yellow-400" />
            <span>Admin Dashboard</span>
          </div>
          <p className="text-gray-300">Manage users, plans, and platform settings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
              </div>
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Signals</p>
                <p className="text-2xl font-bold text-white">{stats.totalRecommendations}</p>
              </div>
              <Activity className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.revenueMonthly}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 mb-8">
          <div className="flex flex-wrap border-b border-white/20">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-400 border-b-2 border-blue-400'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-4">Platform Overview</h3>
                
                {/* Recent Activity */}
                <div className="grid lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Users</h4>
                    <div className="space-y-3">
                      {users.slice(0, 5).map((user) => (
                        <div key={user.uid} className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                          <div>
                            <p className="text-white font-medium">{user.displayName || user.email}</p>
                            <p className="text-gray-400 text-sm">{user.email}</p>
                          </div>
                          <div className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(user.plan)}`}>
                            {user.plan}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Recent Signals</h4>
                    <div className="space-y-3">
                      {recommendations.slice(0, 5).map((rec) => (
                        <div key={rec.id} className="p-3 bg-black/20 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-white font-medium">{rec.school}</p>
                            <p className="text-gray-400 text-xs">
                              {rec.timestamp.toDate().toLocaleDateString()}
                            </p>
                          </div>
                          <p className="text-gray-300 text-sm line-clamp-2">
                            {rec.response.substring(0, 100)}...
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'users' && (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">User Management</h3>
                  <button
                    onClick={loadAllData}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                  >
                    <RefreshCw className="h-4 w-4" />
                    <span>Refresh</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/20">
                        <th className="text-left text-white font-semibold py-3">User</th>
                        <th className="text-left text-white font-semibold py-3">Plan</th>
                        <th className="text-left text-white font-semibold py-3">Usage</th>
                        <th className="text-left text-white font-semibold py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.uid} className="border-b border-white/10">
                          <td className="py-3">
                            <div>
                              <p className="text-white font-medium">{user.displayName || 'No name'}</p>
                              <p className="text-gray-400 text-xs">{user.email}</p>
                            </div>
                          </td>
                          <td className="py-3">
                            {editingUser === user.uid ? (
                              <select
                                value={user.plan}
                                onChange={(e) => handleUpdateUserPlan(user.uid, e.target.value)}
                                className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-xs"
                              >
                                {plans.map((plan) => (
                                  <option key={plan.id} value={plan.id} className="bg-gray-800">
                                    {plan.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <div className={`px-2 py-1 rounded text-xs font-medium ${getPlanColor(user.plan)} flex items-center space-x-1`}>
                                {getPlanIcon(user.plan)}
                                <span>{user.plan}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3">
                            <div className="text-xs">
                              <span className="text-white">{user.used_today}</span>
                              <span className="text-gray-400"> / {user.recommendation_limit}</span>
                            </div>
                          </td>
                          <td className="py-3">
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => setEditingUser(editingUser === user.uid ? null : user.uid)}
                                className="p-1 rounded bg-blue-600 hover:bg-blue-700 text-white"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(user.uid)}
                                className="p-1 rounded bg-red-600 hover:bg-red-700 text-white"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'reset' && (
              <div>
                <h3 className="text-xl font-semibold text-white mb-6">Daily Usage Reset Management</h3>
                <DailyResetManager />
              </div>
            )}

            {/* Other tabs would go here... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;