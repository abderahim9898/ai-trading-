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
  deleteFeaturedSignal,
  resetAllUsersDaily
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
  RefreshCw,
  TrendingDown,
  Minus,
  PieChart,
  LineChart,
  ArrowUp,
  ArrowDown,
  Percent,
  BookOpen,
  FileText,
  MessageSquare
} from 'lucide-react';
import { format, subDays, differenceInDays } from 'date-fns';

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
  const [showSignalModal, setShowSignalModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [editingSignal, setEditingSignal] = useState<any | null>(null);
  const [viewingRecommendation, setViewingRecommendation] = useState<Recommendation | null>(null);

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

  const [signalForm, setSignalForm] = useState({
    pair: '',
    type: 'buy',
    entry: 0,
    stopLoss: 0,
    takeProfit1: 0,
    takeProfit2: 0,
    probability: 85,
    result: 'profit',
    profitPips: 0,
    date: new Date().toISOString().split('T')[0],
    school: '',
    featured: true
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
        getAllRecommendations(50),
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

  const handleResetAllUsersDaily = async () => {
    if (!confirm('Are you sure you want to reset daily usage for ALL users?')) {
      return;
    }

    try {
      setLoading(true);
      await resetAllUsersDaily();
      setSuccess('Daily usage reset for all users');
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to reset daily usage');
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

  const handleCreateFeaturedSignal = async () => {
    try {
      await saveFeaturedSignal(signalForm);
      setSuccess('Featured signal created successfully');
      setShowSignalModal(false);
      resetSignalForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to create featured signal');
    }
  };

  const handleUpdateFeaturedSignal = async () => {
    if (!editingSignal) return;

    try {
      await updateFeaturedSignal(editingSignal.id, signalForm);
      setSuccess('Featured signal updated successfully');
      setShowSignalModal(false);
      setEditingSignal(null);
      resetSignalForm();
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to update featured signal');
    }
  };

  const handleDeleteFeaturedSignal = async (signalId: string) => {
    if (!confirm('Are you sure you want to delete this featured signal?')) return;

    try {
      await deleteFeaturedSignal(signalId);
      setSuccess('Featured signal deleted successfully');
      await loadAllData();
    } catch (error: any) {
      setError(error.message || 'Failed to delete featured signal');
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

  const openSignalModal = (signal?: any) => {
    if (signal) {
      setEditingSignal(signal);
      setSignalForm({
        pair: signal.pair,
        type: signal.type,
        entry: signal.entry,
        stopLoss: signal.stopLoss || 0,
        takeProfit1: signal.takeProfit1 || 0,
        takeProfit2: signal.takeProfit2 || 0,
        probability: signal.probability || 85,
        result: signal.result || 'profit',
        profitPips: signal.profitPips || 0,
        date: signal.date || new Date().toISOString().split('T')[0],
        school: signal.school || '',
        featured: signal.featured || true
      });
    } else {
      setEditingSignal(null);
      resetSignalForm();
    }
    setShowSignalModal(true);
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

  const resetSignalForm = () => {
    setSignalForm({
      pair: '',
      type: 'buy',
      entry: 0,
      stopLoss: 0,
      takeProfit1: 0,
      takeProfit2: 0,
      probability: 85,
      result: 'profit',
      profitPips: 0,
      date: new Date().toISOString().split('T')[0],
      school: '',
      featured: true
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

  const getSignalTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-4 w-4 text-green-400" />;
      case 'sell': return <TrendingDown className="h-4 w-4 text-red-400" />;
      case 'hold': return <Minus className="h-4 w-4 text-yellow-400" />;
      default: return <Target className="h-4 w-4 text-blue-400" />;
    }
  };

  const getSignalTypeColor = (type: string) => {
    switch (type) {
      case 'buy': return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'sell': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'hold': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
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

    // Calculate new users in the last 7 days
    const newUsers = users.filter(u => {
      if (!u.createdAt) return false;
      const joinDate = u.createdAt.seconds 
        ? new Date(u.createdAt.seconds * 1000) 
        : new Date(u.createdAt);
      return differenceInDays(new Date(), joinDate) <= 7;
    }).length;

    // Calculate signal types distribution
    const buySignals = recommendations.filter(r => r.signal?.type === 'buy').length;
    const sellSignals = recommendations.filter(r => r.signal?.type === 'sell').length;
    const holdSignals = recommendations.filter(r => r.signal?.type === 'hold').length;

    // Calculate plan distribution
    const freePlans = users.filter(u => u.plan === 'free').length;
    const proPlans = users.filter(u => u.plan === 'pro').length;
    const elitePlans = users.filter(u => u.plan === 'elite').length;

    return { 
      totalUsers, 
      activeSubscriptions, 
      totalRecommendations, 
      monthlyRevenue,
      newUsers,
      buySignals,
      sellSignals,
      holdSignals,
      freePlans,
      proPlans,
      elitePlans
    };
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
                <Shield className="h-8 w-8 text-yellow-400" />
                <span>Admin Dashboard</span>
              </h1>
              <p className="text-gray-300">Manage users, plans, and platform settings</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleResetAllUsersDaily}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset All Daily Usage</span>
              </button>
              <button
                onClick={loadAllData}
                disabled={loading}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all disabled:opacity-50"
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh Data</span>
              </button>
            </div>
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
                <div className="flex items-center space-x-1 mt-1 text-xs">
                  <ArrowUp className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">+{stats.newUsers}</span>
                  <span className="text-gray-400">last 7 days</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-blue-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Active Subscriptions</p>
                <p className="text-2xl font-bold text-white">{stats.activeSubscriptions}</p>
                <div className="flex items-center space-x-1 mt-1 text-xs">
                  <Percent className="h-3 w-3 text-blue-400" />
                  <span className="text-blue-400">
                    {stats.totalUsers > 0 ? Math.round((stats.activeSubscriptions / stats.totalUsers) * 100) : 0}%
                  </span>
                  <span className="text-gray-400">conversion rate</span>
                </div>
              </div>
              <Crown className="h-8 w-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Total Signals</p>
                <p className="text-2xl font-bold text-white">{stats.totalRecommendations}</p>
                <div className="flex items-center space-x-1 mt-1 text-xs">
                  <Activity className="h-3 w-3 text-green-400" />
                  <span className="text-green-400">
                    {stats.totalUsers > 0 ? Math.round(stats.totalRecommendations / stats.totalUsers) : 0}
                  </span>
                  <span className="text-gray-400">per user avg</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-green-400" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Monthly Revenue</p>
                <p className="text-2xl font-bold text-white">${stats.monthlyRevenue}</p>
                <div className="flex items-center space-x-1 mt-1 text-xs">
                  <DollarSign className="h-3 w-3 text-yellow-400" />
                  <span className="text-yellow-400">
                    ${stats.activeSubscriptions > 0 ? Math.round(stats.monthlyRevenue / stats.activeSubscriptions) : 0}
                  </span>
                  <span className="text-gray-400">per subscription</span>
                </div>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-white/20">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
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
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Overview Dashboard */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* User Distribution */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-400" />
                  <span>User Plan Distribution</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <span className="text-white">Free Plan</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.freePlans}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalUsers > 0 ? Math.round((stats.freePlans / stats.totalUsers) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-gray-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalUsers > 0 ? (stats.freePlans / stats.totalUsers) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-5 w-5 text-blue-400" />
                      <span className="text-white">Pro Plan</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.proPlans}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalUsers > 0 ? Math.round((stats.proPlans / stats.totalUsers) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-blue-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalUsers > 0 ? (stats.proPlans / stats.totalUsers) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="h-5 w-5 text-purple-400" />
                      <span className="text-white">Elite Plan</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.elitePlans}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalUsers > 0 ? Math.round((stats.elitePlans / stats.totalUsers) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-purple-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalUsers > 0 ? (stats.elitePlans / stats.totalUsers) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              {/* Signal Distribution */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-green-400" />
                  <span>Signal Type Distribution</span>
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-green-400" />
                      <span className="text-white">Buy Signals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.buySignals}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalRecommendations > 0 ? Math.round((stats.buySignals / stats.totalRecommendations) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-green-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalRecommendations > 0 ? (stats.buySignals / stats.totalRecommendations) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <TrendingDown className="h-5 w-5 text-red-400" />
                      <span className="text-white">Sell Signals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.sellSignals}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalRecommendations > 0 ? Math.round((stats.sellSignals / stats.totalRecommendations) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-red-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalRecommendations > 0 ? (stats.sellSignals / stats.totalRecommendations) * 100 : 0}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Minus className="h-5 w-5 text-yellow-400" />
                      <span className="text-white">Hold Signals</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-white font-semibold">{stats.holdSignals}</div>
                      <div className="text-gray-400 text-sm">
                        {stats.totalRecommendations > 0 ? Math.round((stats.holdSignals / stats.totalRecommendations) * 100) : 0}%
                      </div>
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-yellow-400 h-2.5 rounded-full" 
                      style={{ width: `${stats.totalRecommendations > 0 ? (stats.holdSignals / stats.totalRecommendations) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <h2 className="text-xl font-bold text-white mb-6 flex items-center space-x-2">
                <Clock className="h-5 w-5 text-blue-400" />
                <span>Recent Activity</span>
              </h2>
              
              <div className="space-y-4">
                {/* New Users */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <UserCheck className="h-4 w-4 text-green-400" />
                    <span>New Users</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white font-semibold py-3">User</th>
                          <th className="text-left text-white font-semibold py-3">Joined</th>
                          <th className="text-left text-white font-semibold py-3">Plan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users
                          .filter(u => {
                            if (!u.createdAt) return false;
                            const joinDate = u.createdAt.seconds 
                              ? new Date(u.createdAt.seconds * 1000) 
                              : new Date(u.createdAt);
                            return differenceInDays(new Date(), joinDate) <= 7;
                          })
                          .slice(0, 5)
                          .map(user => (
                            <tr key={user.uid} className="border-b border-white/10">
                              <td className="py-3">
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
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 text-gray-300">
                                {formatJoinDate(user.createdAt)}
                              </td>
                              <td className="py-3">
                                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getPlanColor(user.plan)}`}>
                                  {getPlanIcon(user.plan)}
                                  <span className="font-medium capitalize">{user.plan}</span>
                                </div>
                              </td>
                            </tr>
                          ))}
                        
                        {users.filter(u => {
                          if (!u.createdAt) return false;
                          const joinDate = u.createdAt.seconds 
                            ? new Date(u.createdAt.seconds * 1000) 
                            : new Date(u.createdAt);
                          return differenceInDays(new Date(), joinDate) <= 7;
                        }).length === 0 && (
                          <tr>
                            <td colSpan={3} className="py-4 text-center text-gray-400">
                              No new users in the last 7 days
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                
                {/* Recent Signals */}
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                    <Activity className="h-4 w-4 text-blue-400" />
                    <span>Recent Signals</span>
                  </h3>
                  
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-white/20">
                          <th className="text-left text-white font-semibold py-3">Pair</th>
                          <th className="text-left text-white font-semibold py-3">Type</th>
                          <th className="text-left text-white font-semibold py-3">School</th>
                          <th className="text-left text-white font-semibold py-3">Generated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recommendations
                          .filter(rec => rec.signal)
                          .slice(0, 5)
                          .map(rec => (
                            <tr key={rec.id} className="border-b border-white/10">
                              <td className="py-3 text-white font-medium">
                                {rec.signal?.pair || 'Unknown'}
                              </td>
                              <td className="py-3">
                                {rec.signal?.type && (
                                  <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getSignalTypeColor(rec.signal.type)}`}>
                                    {getSignalTypeIcon(rec.signal.type)}
                                    <span className="font-medium uppercase">{rec.signal.type}</span>
                                  </div>
                                )}
                              </td>
                              <td className="py-3 text-gray-300">
                                {rec.school}
                              </td>
                              <td className="py-3 text-gray-300">
                                {rec.timestamp ? format(rec.timestamp.toDate(), 'MMM d, h:mm a') : 'Unknown'}
                              </td>
                            </tr>
                          ))}
                        
                        {recommendations.filter(rec => rec.signal).length === 0 && (
                          <tr>
                            <td colSpan={4} className="py-4 text-center text-gray-400">
                              No signals generated yet
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

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

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-white font-medium mb-2">Features:</h4>
                    <ul className="space-y-1">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center space-x-2 text-gray-300 text-sm">
                          <CheckCircle className="h-3 w-3 text-green-400 flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-4 pt-4 border-t border-white/10">
                    <h4 className="text-white font-medium mb-2">Users on this plan:</h4>
                    <div className="text-2xl font-bold text-white">
                      {users.filter(u => u.plan === plan.id).length}
                    </div>
                    <div className="text-sm text-gray-400">
                      {users.length > 0 ? Math.round((users.filter(u => u.plan === plan.id).length / users.length) * 100) : 0}% of total users
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Trading Schools</h2>
              <button
                onClick={() => openSchoolModal()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
              >
                <Plus className="h-4 w-4" />
                <span>Add School</span>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {schools.map((school) => (
                <div key={school.id} className="bg-black/20 rounded-lg p-6 border border-white/10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-500/20 rounded-lg">
                        <BookOpen className="h-5 w-5 text-blue-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white">{school.name}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openSchoolModal(school)}
                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchool(school.id)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2 mb-4">
                    <div className={`px-3 py-1 rounded-full text-xs ${school.active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {school.active ? 'Active' : 'Inactive'}
                    </div>
                    
                    <div className="text-gray-400 text-sm">
                      {recommendations.filter(r => r.school === school.name).length} signals generated
                    </div>
                  </div>
                  
                  <div className="bg-black/30 rounded-lg p-4 mb-4">
                    <h4 className="text-white font-medium mb-2 flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-blue-400" />
                      <span>Prompt Template:</span>
                    </h4>
                    <div className="text-gray-300 text-sm max-h-24 overflow-y-auto">
                      {school.prompt.length > 150 
                        ? school.prompt.substring(0, 150) + '...' 
                        : school.prompt}
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <h4 className="text-white font-medium mb-2">Signal Distribution:</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-green-500/10 rounded-lg p-2 text-center">
                        <div className="text-green-400 flex items-center justify-center space-x-1">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-xs font-medium">Buy</span>
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {recommendations.filter(r => r.school === school.name && r.signal?.type === 'buy').length}
                        </div>
                      </div>
                      
                      <div className="bg-red-500/10 rounded-lg p-2 text-center">
                        <div className="text-red-400 flex items-center justify-center space-x-1">
                          <TrendingDown className="h-3 w-3" />
                          <span className="text-xs font-medium">Sell</span>
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {recommendations.filter(r => r.school === school.name && r.signal?.type === 'sell').length}
                        </div>
                      </div>
                      
                      <div className="bg-yellow-500/10 rounded-lg p-2 text-center">
                        <div className="text-yellow-400 flex items-center justify-center space-x-1">
                          <Minus className="h-3 w-3" />
                          <span className="text-xs font-medium">Hold</span>
                        </div>
                        <div className="text-white font-semibold mt-1">
                          {recommendations.filter(r => r.school === school.name && r.signal?.type === 'hold').length}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'signals' && (
          <div className="space-y-8">
            {/* Featured Signals */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Featured Signals</h2>
                <button
                  onClick={() => openSignalModal()}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Featured Signal</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">Pair</th>
                      <th className="text-left text-white font-semibold py-3">Type</th>
                      <th className="text-left text-white font-semibold py-3">Entry</th>
                      <th className="text-left text-white font-semibold py-3">Result</th>
                      <th className="text-left text-white font-semibold py-3">Date</th>
                      <th className="text-left text-white font-semibold py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {featuredSignals.map((signal) => (
                      <tr key={signal.id} className="border-b border-white/10">
                        <td className="py-3 text-white font-medium">{signal.pair}</td>
                        <td className="py-3">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getSignalTypeColor(signal.type)}`}>
                            {getSignalTypeIcon(signal.type)}
                            <span className="font-medium uppercase">{signal.type}</span>
                          </div>
                        </td>
                        <td className="py-3 text-white">{signal.entry}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${
                              signal.result === 'profit' ? 'bg-green-400' : 
                              signal.result === 'loss' ? 'bg-red-400' : 'bg-yellow-400'
                            }`}></div>
                            <span className={
                              signal.result === 'profit' ? 'text-green-400' : 
                              signal.result === 'loss' ? 'text-red-400' : 'text-yellow-400'
                            }>
                              {signal.result === 'profit' ? `+${signal.profitPips || 0} pips` : 
                               signal.result === 'loss' ? `-${signal.profitPips || 0} pips` : 'Pending'}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 text-gray-300">{signal.date}</td>
                        <td className="py-3">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => openSignalModal(signal)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                              title="Edit Signal"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFeaturedSignal(signal.id)}
                              className="p-2 text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-all"
                              title="Delete Signal"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    
                    {featuredSignals.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-400">
                          No featured signals yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Recent Recommendations */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent User Signals</h2>
                <div className="text-sm text-gray-400">
                  Total: {recommendations.length} signals
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-white/20">
                      <th className="text-left text-white font-semibold py-3">User</th>
                      <th className="text-left text-white font-semibold py-3">Pair</th>
                      <th className="text-left text-white font-semibold py-3">Type</th>
                      <th className="text-left text-white font-semibold py-3">School</th>
                      <th className="text-left text-white font-semibold py-3">Date</th>
                      <th className="text-left text-white font-semibold py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recommendations
                      .filter(rec => rec.signal)
                      .slice(0, 10)
                      .map(rec => (
                        <tr key={rec.id} className="border-b border-white/10">
                          <td className="py-3 text-gray-300">{rec.userId.substring(0, 8)}...</td>
                          <td className="py-3 text-white font-medium">{rec.signal?.pair || 'Unknown'}</td>
                          <td className="py-3">
                            {rec.signal?.type && (
                              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full w-fit ${getSignalTypeColor(rec.signal.type)}`}>
                                {getSignalTypeIcon(rec.signal.type)}
                                <span className="font-medium uppercase">{rec.signal.type}</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 text-gray-300">{rec.school}</td>
                          <td className="py-3 text-gray-300">
                            {rec.timestamp ? format(rec.timestamp.toDate(), 'MMM d, h:mm a') : 'Unknown'}
                          </td>
                          <td className="py-3">
                            <button
                              onClick={() => setViewingRecommendation(rec)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded-lg transition-all"
                              title="View Analysis"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    
                    {recommendations.filter(rec => rec.signal).length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-400">
                          No signals generated yet
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
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

        {/* School Modal */}
        {showSchoolModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingSchool ? 'Edit School' : 'Create School'}
                </h3>
                <button
                  onClick={() => setShowSchoolModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">School Name</label>
                  <input
                    type="text"
                    value={schoolForm.name}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    placeholder="e.g., Technical Analysis"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Document ID will be: {schoolForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Prompt Template</label>
                  <textarea
                    value={schoolForm.prompt}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, prompt: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white h-40"
                    placeholder="Enter the AI prompt template for this trading school..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    This prompt will be used to guide the AI in generating signals using this school's methodology.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={schoolForm.active}
                    onChange={(e) => setSchoolForm(prev => ({ ...prev, active: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                  />
                  <label htmlFor="active" className="text-sm text-gray-300">
                    School is active and available to users
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingSchool ? handleUpdateSchool : handleCreateSchool}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  {editingSchool ? 'Update School' : 'Create School'}
                </button>
                <button
                  onClick={() => setShowSchoolModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Signal Modal */}
        {showSignalModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">
                  {editingSignal ? 'Edit Featured Signal' : 'Create Featured Signal'}
                </h3>
                <button
                  onClick={() => setShowSignalModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Trading Pair</label>
                    <input
                      type="text"
                      value={signalForm.pair}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, pair: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                      placeholder="e.g., XAUUSD"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Signal Type</label>
                    <select
                      value={signalForm.type}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, type: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="buy" className="bg-gray-800">Buy</option>
                      <option value="sell" className="bg-gray-800">Sell</option>
                      <option value="hold" className="bg-gray-800">Hold</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Entry Price</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.entry}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, entry: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Stop Loss</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.stopLoss}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, stopLoss: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit 1</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.takeProfit1}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, takeProfit1: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Take Profit 2</label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.takeProfit2}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, takeProfit2: parseFloat(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Probability (%)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={signalForm.probability}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, probability: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Result</label>
                    <select
                      value={signalForm.result}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, result: e.target.value as any }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    >
                      <option value="profit" className="bg-gray-800">Profit</option>
                      <option value="loss" className="bg-gray-800">Loss</option>
                      <option value="pending" className="bg-gray-800">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Profit/Loss (pips)</label>
                    <input
                      type="number"
                      value={signalForm.profitPips}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, profitPips: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Date</label>
                    <input
                      type="date"
                      value={signalForm.date}
                      onChange={(e) => setSignalForm(prev => ({ ...prev, date: e.target.value }))}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Trading School</label>
                  <select
                    value={signalForm.school}
                    onChange={(e) => setSignalForm(prev => ({ ...prev, school: e.target.value }))}
                    className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white"
                  >
                    <option value="" className="bg-gray-800">Select a school</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.name} className="bg-gray-800">
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={signalForm.featured}
                    onChange={(e) => setSignalForm(prev => ({ ...prev, featured: e.target.checked }))}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded"
                  />
                  <label htmlFor="featured" className="text-sm text-gray-300">
                    Featured on homepage
                  </label>
                </div>
              </div>

              <div className="flex space-x-3 mt-6">
                <button
                  onClick={editingSignal ? handleUpdateFeaturedSignal : handleCreateFeaturedSignal}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  {editingSignal ? 'Update Signal' : 'Create Signal'}
                </button>
                <button
                  onClick={() => setShowSignalModal(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* View Recommendation Modal */}
        {viewingRecommendation && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-blue-400" />
                  <span>Signal Details</span>
                </h3>
                <button
                  onClick={() => setViewingRecommendation(null)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-6">
                {/* Signal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    {viewingRecommendation.signal?.type && (
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-2 ${getSignalTypeColor(viewingRecommendation.signal.type)}`}>
                        {getSignalTypeIcon(viewingRecommendation.signal.type)}
                        <span className="uppercase">{viewingRecommendation.signal.type}</span>
                      </div>
                    )}
                    <div>
                      <h4 className="text-xl font-bold text-white">
                        {viewingRecommendation.signal?.pair || 'Unknown Pair'}
                      </h4>
                      <div className="text-sm text-gray-400">
                        {viewingRecommendation.school} • {viewingRecommendation.timestamp ? format(viewingRecommendation.timestamp.toDate(), 'MMM d, yyyy h:mm a') : 'Unknown date'}
                      </div>
                    </div>
                  </div>
                  
                  {viewingRecommendation.signal?.probability && (
                    <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                      {viewingRecommendation.signal.probability}% Confidence
                    </div>
                  )}
                </div>

                {/* Signal Details */}
                {viewingRecommendation.signal && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {viewingRecommendation.signal.entry && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Entry</p>
                        <p className="text-white font-bold">{viewingRecommendation.signal.entry}</p>
                      </div>
                    )}
                    
                    {viewingRecommendation.signal.stopLoss && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Stop Loss</p>
                        <p className="text-red-400 font-bold">{viewingRecommendation.signal.stopLoss}</p>
                      </div>
                    )}
                    
                    {viewingRecommendation.signal.takeProfit1 && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">TP1</p>
                        <p className="text-green-400 font-bold">{viewingRecommendation.signal.takeProfit1}</p>
                      </div>
                    )}
                    
                    {viewingRecommendation.signal.takeProfit2 && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">TP2</p>
                        <p className="text-green-400 font-bold">{viewingRecommendation.signal.takeProfit2}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Analysis Content */}
                <div>
                  <h4 className="text-white font-semibold mb-2">Analysis:</h4>
                  <div className="bg-black/20 rounded-lg p-4 whitespace-pre-wrap text-gray-300 text-sm">
                    {viewingRecommendation.response}
                  </div>
                </div>

                {/* Promote to Featured */}
                <div className="flex justify-end">
                  <button
                    onClick={() => {
                      openSignalModal({
                        pair: viewingRecommendation.signal?.pair || '',
                        type: viewingRecommendation.signal?.type || 'buy',
                        entry: viewingRecommendation.signal?.entry || 0,
                        stopLoss: viewingRecommendation.signal?.stopLoss || 0,
                        takeProfit1: viewingRecommendation.signal?.takeProfit1 || 0,
                        takeProfit2: viewingRecommendation.signal?.takeProfit2 || 0,
                        probability: viewingRecommendation.signal?.probability || 85,
                        result: 'profit',
                        profitPips: 0,
                        date: new Date().toISOString().split('T')[0],
                        school: viewingRecommendation.school,
                        featured: true
                      });
                      setViewingRecommendation(null);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Star className="h-4 w-4" />
                    <span>Promote to Featured</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;