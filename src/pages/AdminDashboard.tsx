import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getAllUsers, 
  getAllRecommendations, 
  getPlans, 
  getSchools,
  updateUserPlanAdmin,
  updateUserUsage,
  deleteUser,
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
import { 
  Users, 
  BarChart3, 
  DollarSign, 
  TrendingUp,
  Shield,
  Settings,
  Trash2,
  Edit,
  Plus,
  Save,
  X,
  Crown,
  Zap,
  Calendar,
  Mail,
  Activity,
  AlertCircle,
  CheckCircle,
  Loader,
  Eye,
  Star,
  Target,
  Clock,
  UserCheck,
  UserX,
  Database,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [featuredSignals, setFeaturedSignals] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Modal states
  const [showUserModal, setShowUserModal] = useState(false);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showSchoolModal, setShowSchoolModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);

  // Form states
  const [userForm, setUserForm] = useState({
    plan: 'free',
    used_today: 0,
    recommendation_limit: 1
  });

  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    recommendations_per_day: 1,
    features: [''],
    paypal_plan_id: '',
    popular: false
  });

  const [schoolForm, setSchoolForm] = useState({
    name: '',
    prompt: '',
    active: true
  });

  useEffect(() => {
    if (user?.isAdmin) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [usersData, plansData, schoolsData, recsData, featuredData] = await Promise.all([
        getAllUsers(),
        getPlans(),
        getSchools(),
        getAllRecommendations(20),
        getAllFeaturedSignals()
      ]);

      setUsers(usersData);
      setPlans(plansData);
      setSchools(schoolsData);
      setRecommendations(recsData);
      setFeaturedSignals(featuredData);
    } catch (error: any) {
      setError(error.message || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      const result = await deleteUser(userId);
      
      if (result.success) {
        setSuccess(`User deleted successfully. ${result.message}`);
        await loadAllData(); // Refresh data
      }
    } catch (error: any) {
      setError(error.message || 'Failed to delete user');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserPlanAdmin(editingUser.uid, userForm.plan);
      await updateUserUsage(editingUser.uid, userForm.used_today, userForm.recommendation_limit);
      
      setSuccess('User updated successfully');
      setShowUserModal(false);
      setEditingUser(null);
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
    }
  };

  const handleCreatePlan = async () => {
    try {
      const planData = {
        ...planForm,
        features: planForm.features.filter(f => f.trim() !== '')
      };
      
      await createPlan(planData);
      setSuccess('Plan created successfully');
      setShowPlanModal(false);
      resetPlanForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to create plan');
    }
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      const planData = {
        ...planForm,
        features: planForm.features.filter(f => f.trim() !== '')
      };
      
      await updatePlan(editingPlan.id, planData);
      setSuccess('Plan updated successfully');
      setShowPlanModal(false);
      setEditingPlan(null);
      resetPlanForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to update plan');
    }
  };

  const handleDeletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;

    try {
      await deletePlan(planId);
      setSuccess('Plan deleted successfully');
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete plan');
    }
  };

  const handleCreateSchool = async () => {
    try {
      await createSchool(schoolForm);
      setSuccess('School created successfully');
      setShowSchoolModal(false);
      resetSchoolForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to create school');
    }
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;

    try {
      await updateSchool(editingSchool.id, schoolForm);
      setSuccess('School updated successfully');
      setShowSchoolModal(false);
      setEditingSchool(null);
      resetSchoolForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to update school');
    }
  };

  const handleDeleteSchool = async (schoolId: string) => {
    if (!confirm('Are you sure you want to delete this school?')) return;

    try {
      await deleteSchool(schoolId);
      setSuccess('School deleted successfully');
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete school');
    }
  };

  const openUserModal = (user: User) => {
    setEditingUser(user);
    setUserForm({
      plan: user.plan,
      used_today: user.used_today,
      recommendation_limit: user.recommendation_limit
    });
    setShowUserModal(true);
  };

  const openPlanModal = (plan?: Plan) => {
    if (plan) {
      setEditingPlan(plan);
      setPlanForm({
        name: plan.name,
        price: plan.price,
        recommendations_per_day: plan.recommendations_per_day,
        features: [...plan.features],
        paypal_plan_id: plan.paypal_plan_id || '',
        popular: plan.popular || false
      });
    } else {
      setEditingPlan(null);
      resetPlanForm();
    }
    setShowPlanModal(true);
  };

  const openSchoolModal = (school?: School) => {
    if (school) {
      setEditingSchool(school);
      setSchoolForm({
        name: school.name,
        prompt: school.prompt,
        active: school.active
      });
    } else {
      setEditingSchool(null);
      resetSchoolForm();
    }
    setShowSchoolModal(true);
  };

  const resetPlanForm = () => {
    setPlanForm({
      name: '',
      price: 0,
      recommendations_per_day: 1,
      features: [''],
      paypal_plan_id: '',
      popular: false
    });
  };

  const resetSchoolForm = () => {
    setSchoolForm({
      name: '',
      prompt: '',
      active: true
    });
  };

  const addFeature = () => {
    setPlanForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const updateFeature = (index: number, value: string) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.map((f, i) => i === index ? value : f)
    }));
  };

  const removeFeature = (index: number) => {
    setPlanForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'free': return <Shield className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'elite': return <Crown className="h-4 w-4" />;
      default: return <Shield className="h-4 w-4" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400 bg-gray-400/10';
      case 'pro': return 'text-blue-400 bg-blue-400/10';
      case 'elite': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const formatJoinDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown';
    
    try {
      // Handle Firestore timestamp
      if (timestamp.seconds) {
        return format(new Date(timestamp.seconds * 1000), 'MMM d, yyyy');
      }
      // Handle regular date string
      return format(new Date(timestamp), 'MMM d, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const getStats = () => {
    const totalUsers = users.length;
    const activeSubscriptions = users.filter(u => u.plan !== 'free').length;
    const totalRecommendations = recommendations.length;
    const monthlyRevenue = users.reduce((sum, u) => {
      const plan = plans.find(p => p.id === u.plan);
      return sum + (plan?.price || 0);
    }, 0);

    return { totalUsers, activeSubscriptions, totalRecommendations, monthlyRevenue };
  };

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">You don't have admin privileges</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const stats = getStats();

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                <Shield className="h-8 w-8 text-yellow-400" />
                <span>Admin Dashboard</span>
              </h1>
              <p className="text-gray-300">Manage users, plans, and platform settings</p>
            </div>
            <button
              onClick={loadAllData}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-300">×</button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl flex items-center space-x-3">
            <CheckCircle className="h-5 w-5" />
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="ml-auto text-green-400 hover:text-green-300">×</button>
          </div>
        )}

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
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue}</p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'users', label: 'Users', icon: Users },
                { id: 'plans', label: 'Plans', icon: Crown },
                { id: 'schools', label: 'Schools', icon: Settings },
                { id: 'signals', label: 'Signals', icon: TrendingUp }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">User Management</h2>
              <div className="text-sm text-gray-400">
                Total: {users.length} users
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/20">
                    <th className="text-left text-white font-semibold py-3">User</th>
                    <th className="text-left text-white font-semibold py-3">Plan</th>
                    <th className="text-left text-white font-semibold py-3">Usage</th>
                    <th className="text-left text-white font-semibold py-3">Joined</th>
                    <th className="text-left text-white font-semibold py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.uid} className="border-b border-white/10">
                      <td className="py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                            <span className="text-white text-xs font-bold">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div>
                            <div className="text-white font-medium">
                              {user.displayName || 'No Name'}
                            </div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                            {user.isAdmin && (
                              <div className="flex items-center space-x-1 mt-1">
                                <Shield className="h-3 w-3 text-yellow-400" />
                                <span className="text-yellow-400 text-xs">Admin</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getPlanColor(user.plan)}`}>
                          {getPlanIcon(user.plan)}
                          <span className="font-medium capitalize">{user.plan}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="text-white">
                          {user.used_today} / {user.recommendation_limit}
                        </div>
                        <div className="w-20 bg-gray-700 rounded-full h-1 mt-1">
                          <div
                            className="bg-blue-500 h-1 rounded-full"
                            style={{ width: `${(user.used_today / user.recommendation_limit) * 100}%` }}
                          ></div>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2 text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{formatJoinDate(user.createdAt)}</span>
                        </div>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => openUserModal(user)}
                            className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.uid)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                            title="Delete User"
                          >
                            <Trash2 className="h-4 w-4" />
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

        {activeTab === 'plans' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Plan Management</h2>
              <button
                onClick={() => openPlanModal()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add Plan</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openPlanModal(plan)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePlan(plan.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Price:</span>
                      <span className="text-white font-semibold">${plan.price}/month</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Signals:</span>
                      <span className="text-white">{plan.recommendations_per_day}/day</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">PayPal ID:</span>
                      <span className="text-white text-xs font-mono">
                        {plan.paypal_plan_id || 'Not Set'}
                      </span>
                    </div>
                    {plan.popular && (
                      <div className="flex items-center space-x-2">
                        <Star className="h-4 w-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm">Popular Plan</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* User Edit Modal */}
        {showUserModal && editingUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Edit User</h3>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    User: {editingUser.email}
                  </label>
                  <p className="text-xs text-gray-400">
                    Joined: {formatJoinDate(editingUser.createdAt)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plan</label>
                  <select
                    value={userForm.plan}
                    onChange={(e) => setUserForm(prev => ({ ...prev, plan: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="free" className="bg-gray-800">Free</option>
                    <option value="pro" className="bg-gray-800">Pro</option>
                    <option value="elite" className="bg-gray-800">Elite</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Used Today</label>
                  <input
                    type="number"
                    value={userForm.used_today}
                    onChange={(e) => setUserForm(prev => ({ ...prev, used_today: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Daily Limit</label>
                  <input
                    type="number"
                    value={userForm.recommendation_limit}
                    onChange={(e) => setUserForm(prev => ({ ...prev, recommendation_limit: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={handleUpdateUser}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => setShowUserModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Plan Modal */}
        {showPlanModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingPlan ? 'Edit Plan' : 'Create Plan'}
                </h3>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Plan Name</label>
                  <input
                    type="text"
                    value={planForm.name}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., Pro Plan"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Document ID will be: {planForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={planForm.price}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Signals per Day</label>
                    <input
                      type="number"
                      value={planForm.recommendations_per_day}
                      onChange={(e) => setPlanForm(prev => ({ ...prev, recommendations_per_day: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">PayPal Plan ID</label>
                  <input
                    type="text"
                    value={planForm.paypal_plan_id}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, paypal_plan_id: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="P-XXXXXXXXXXXXXXXXX"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Features</label>
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => updateFeature(index, e.target.value)}
                        className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                        placeholder="Feature description"
                      />
                      <button
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addFeature}
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    + Add Feature
                  </button>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm(prev => ({ ...prev, popular: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                  />
                  <label htmlFor="popular" className="text-sm text-gray-300">
                    Mark as popular plan
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingPlan ? handleUpdatePlan : handleCreatePlan}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
                </button>
                <button
                  onClick={() => setShowPlanModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;