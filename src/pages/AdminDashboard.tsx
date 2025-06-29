import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { 
  getAllUsers, 
  getPlans, 
  getSchools, 
  createSchool, 
  updateSchool, 
  deleteSchool, 
  createPlan, 
  updatePlan, 
  deletePlan,
  getAllFeaturedSignals,
  saveFeaturedSignal,
  updateFeaturedSignal,
  deleteFeaturedSignal,
  getAllRecommendations,
  promoteToFeaturedSignal,
  updateUserPlanAdmin,
  updateUserUsage,
  deleteUser
} from '../services/firestore';
import { User, Plan, School, Recommendation } from '../types';
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Settings, 
  Shield,
  Crown,
  Zap,
  BarChart3,
  Calendar,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Eye,
  EyeOff,
  CreditCard,
  Star,
  Package,
  Activity,
  Clock,
  Target,
  Percent,
  ArrowUp,
  ArrowDown,
  TrendingDown,
  PieChart,
  LineChart,
  Minus,
  CheckCircle,
  XCircle,
  Award,
  Sparkles,
  Filter,
  Search,
  RefreshCw,
  UserX,
  UserCheck,
  ChevronDown,
  ExternalLink,
  Loader
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [featuredSignals, setFeaturedSignals] = useState<any[]>([]);
  const [allRecommendations, setAllRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Featured Signals Management
  const [showAddSignal, setShowAddSignal] = useState(false);
  const [editingSignal, setEditingSignal] = useState<any>(null);
  const [signalForm, setSignalForm] = useState({
    pair: 'XAUUSD',
    type: 'buy' as 'buy' | 'sell' | 'hold',
    entry: 0,
    stopLoss: 0,
    takeProfit1: 0,
    takeProfit2: 0,
    probability: 85,
    result: 'profit' as 'profit' | 'loss' | 'pending',
    profitPips: 0,
    date: new Date().toISOString().split('T')[0],
    school: 'Technical Analysis',
    featured: true,
    analysis: ''
  });

  // User Management
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [userFilterPlan, setUserFilterPlan] = useState('all');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    plan: 'free',
    used_today: 0,
    recommendation_limit: 1
  });

  // Recommendations Management
  const [recSearchTerm, setRecSearchTerm] = useState('');
  const [recFilterSchool, setRecFilterSchool] = useState('all');

  // School management states
  const [showAddSchool, setShowAddSchool] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [schoolForm, setSchoolForm] = useState({
    name: '',
    prompt: '',
    active: true
  });
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

  // Plan management states
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [planForm, setPlanForm] = useState({
    name: '',
    price: 0,
    recommendations_per_day: 1,
    features: [''],
    popular: false
  });

  useEffect(() => {
    if (user?.isAdmin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [usersData, plansData, schoolsData, featuredData, recommendationsData] = await Promise.all([
        getAllUsers(),
        getPlans(),
        getSchools(),
        getAllFeaturedSignals(),
        getAllRecommendations(50)
      ]);
      
      setUsers(usersData);
      setPlans(plansData);
      setSchools(schoolsData);
      setFeaturedSignals(featuredData);
      setAllRecommendations(recommendationsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Featured Signals Functions
  const handleAddSignal = async () => {
    try {
      if (!signalForm.pair || signalForm.entry <= 0) {
        alert('Please fill in all required fields');
        return;
      }

      await saveFeaturedSignal(signalForm);
      const updatedSignals = await getAllFeaturedSignals();
      setFeaturedSignals(updatedSignals);
      
      setSignalForm({
        pair: 'XAUUSD',
        type: 'buy',
        entry: 0,
        stopLoss: 0,
        takeProfit1: 0,
        takeProfit2: 0,
        probability: 85,
        result: 'profit',
        profitPips: 0,
        date: new Date().toISOString().split('T')[0],
        school: 'Technical Analysis',
        featured: true,
        analysis: ''
      });
      setShowAddSignal(false);
      
      alert('Featured signal added successfully!');
    } catch (error) {
      console.error('Error adding signal:', error);
      alert('Failed to add signal. Please try again.');
    }
  };

  const handleEditSignal = (signal: any) => {
    setEditingSignal(signal);
    setSignalForm({
      pair: signal.pair || 'XAUUSD',
      type: signal.type || 'buy',
      entry: signal.entry || 0,
      stopLoss: signal.stopLoss || 0,
      takeProfit1: signal.takeProfit1 || 0,
      takeProfit2: signal.takeProfit2 || 0,
      probability: signal.probability || 85,
      result: signal.result || 'profit',
      profitPips: signal.profitPips || 0,
      date: signal.date || new Date().toISOString().split('T')[0],
      school: signal.school || 'Technical Analysis',
      featured: signal.featured !== false,
      analysis: signal.analysis || ''
    });
  };

  const handleUpdateSignal = async () => {
    if (!editingSignal) return;

    try {
      await updateFeaturedSignal(editingSignal.id, signalForm);
      const updatedSignals = await getAllFeaturedSignals();
      setFeaturedSignals(updatedSignals);
      
      setEditingSignal(null);
      setSignalForm({
        pair: 'XAUUSD',
        type: 'buy',
        entry: 0,
        stopLoss: 0,
        takeProfit1: 0,
        takeProfit2: 0,
        probability: 85,
        result: 'profit',
        profitPips: 0,
        date: new Date().toISOString().split('T')[0],
        school: 'Technical Analysis',
        featured: true,
        analysis: ''
      });
      
      alert('Featured signal updated successfully!');
    } catch (error) {
      console.error('Error updating signal:', error);
      alert('Failed to update signal. Please try again.');
    }
  };

  const handleDeleteSignal = async (signalId: string) => {
    if (!confirm('Are you sure you want to delete this featured signal?')) {
      return;
    }

    try {
      await deleteFeaturedSignal(signalId);
      const updatedSignals = await getAllFeaturedSignals();
      setFeaturedSignals(updatedSignals);
      
      alert('Featured signal deleted successfully!');
    } catch (error) {
      console.error('Error deleting signal:', error);
      alert('Failed to delete signal. Please try again.');
    }
  };

  const handlePromoteRecommendation = async (recommendation: Recommendation) => {
    if (!recommendation.signal) {
      alert('This recommendation does not have structured signal data and cannot be promoted.');
      return;
    }

    try {
      await promoteToFeaturedSignal(recommendation, recommendation.signal);
      const updatedSignals = await getAllFeaturedSignals();
      setFeaturedSignals(updatedSignals);
      
      alert('Recommendation promoted to featured signal successfully!');
    } catch (error) {
      console.error('Error promoting recommendation:', error);
      alert('Failed to promote recommendation. Please try again.');
    }
  };

  // User Management Functions
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      plan: user.plan,
      used_today: user.used_today,
      recommendation_limit: user.recommendation_limit
    });
  };

  const handleUpdateUser = async () => {
    if (!editingUser) return;

    try {
      await updateUserPlanAdmin(editingUser.uid, userForm.plan);
      await updateUserUsage(editingUser.uid, userForm.used_today, userForm.recommendation_limit);
      
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      setEditingUser(null);
      alert('User updated successfully!');
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string, userEmail: string) => {
    if (!confirm(`Are you sure you want to delete user "${userEmail}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteUser(userId);
      const updatedUsers = await getAllUsers();
      setUsers(updatedUsers);
      
      alert('User deleted successfully!');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    }
  };

  // School management functions
  const handleAddSchool = async () => {
    try {
      if (!schoolForm.name.trim() || !schoolForm.prompt.trim()) {
        alert('Please fill in all fields');
        return;
      }

      await createSchool({
        name: schoolForm.name.trim(),
        prompt: schoolForm.prompt.trim(),
        active: schoolForm.active
      });

      const schoolsData = await getSchools();
      setSchools(schoolsData);

      setSchoolForm({ name: '', prompt: '', active: true });
      setShowAddSchool(false);
      
      alert('School added successfully!');
    } catch (error) {
      console.error('Error adding school:', error);
      alert('Failed to add school. Please try again.');
    }
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setSchoolForm({
      name: school.name,
      prompt: school.prompt,
      active: school.active
    });
  };

  const handleUpdateSchool = async () => {
    if (!editingSchool) return;

    try {
      if (!schoolForm.name.trim() || !schoolForm.prompt.trim()) {
        alert('Please fill in all fields');
        return;
      }

      await updateSchool(editingSchool.id, {
        name: schoolForm.name.trim(),
        prompt: schoolForm.prompt.trim(),
        active: schoolForm.active
      });

      const schoolsData = await getSchools();
      setSchools(schoolsData);

      setEditingSchool(null);
      setSchoolForm({ name: '', prompt: '', active: true });
      
      alert('School updated successfully!');
    } catch (error) {
      console.error('Error updating school:', error);
      alert('Failed to update school. Please try again.');
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (!confirm(`Are you sure you want to delete "${schoolName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSchool(schoolId);
      const schoolsData = await getSchools();
      setSchools(schoolsData);
      
      alert('School deleted successfully!');
    } catch (error) {
      console.error('Error deleting school:', error);
      alert('Failed to delete school. Please try again.');
    }
  };

  // Plan management functions
  const handleAddPlan = async () => {
    try {
      if (!planForm.name.trim() || planForm.features.some(f => !f.trim())) {
        alert('Please fill in all fields and ensure all features are complete');
        return;
      }

      await createPlan({
        name: planForm.name.trim(),
        price: planForm.price,
        recommendations_per_day: planForm.recommendations_per_day,
        features: planForm.features.filter(f => f.trim()).map(f => f.trim()),
        popular: planForm.popular
      });

      const plansData = await getPlans();
      setPlans(plansData);

      setPlanForm({
        name: '',
        price: 0,
        recommendations_per_day: 1,
        features: [''],
        popular: false
      });
      setShowAddPlan(false);
      
      alert('Plan added successfully!');
    } catch (error) {
      console.error('Error adding plan:', error);
      alert('Failed to add plan. Please try again.');
    }
  };

  const handleEditPlan = (plan: Plan) => {
    setEditingPlan(plan);
    setPlanForm({
      name: plan.name,
      price: plan.price,
      recommendations_per_day: plan.recommendations_per_day,
      features: [...plan.features, ''],
      popular: plan.popular || false
    });
  };

  const handleUpdatePlan = async () => {
    if (!editingPlan) return;

    try {
      if (!planForm.name.trim() || planForm.features.some(f => !f.trim())) {
        alert('Please fill in all fields and ensure all features are complete');
        return;
      }

      await updatePlan(editingPlan.id, {
        name: planForm.name.trim(),
        price: planForm.price,
        recommendations_per_day: planForm.recommendations_per_day,
        features: planForm.features.filter(f => f.trim()).map(f => f.trim()),
        popular: planForm.popular
      });

      const plansData = await getPlans();
      setPlans(plansData);

      setEditingPlan(null);
      setPlanForm({
        name: '',
        price: 0,
        recommendations_per_day: 1,
        features: [''],
        popular: false
      });
      
      alert('Plan updated successfully!');
    } catch (error) {
      console.error('Error updating plan:', error);
      alert('Failed to update plan. Please try again.');
    }
  };

  const handleDeletePlan = async (planId: string, planName: string) => {
    if (!confirm(`Are you sure you want to delete "${planName}"? This action cannot be undone and may affect existing subscribers.`)) {
      return;
    }

    try {
      await deletePlan(planId);
      const plansData = await getPlans();
      setPlans(plansData);
      
      alert('Plan deleted successfully!');
    } catch (error) {
      console.error('Error deleting plan:', error);
      alert('Failed to delete plan. Please try again.');
    }
  };

  const addFeatureField = () => {
    setPlanForm({
      ...planForm,
      features: [...planForm.features, '']
    });
  };

  const removeFeatureField = (index: number) => {
    const newFeatures = planForm.features.filter((_, i) => i !== index);
    setPlanForm({
      ...planForm,
      features: newFeatures.length > 0 ? newFeatures : ['']
    });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...planForm.features];
    newFeatures[index] = value;
    setPlanForm({
      ...planForm,
      features: newFeatures
    });
  };

  const togglePromptExpansion = (schoolId: string) => {
    const newExpanded = new Set(expandedPrompts);
    if (newExpanded.has(schoolId)) {
      newExpanded.delete(schoolId);
    } else {
      newExpanded.add(schoolId);
    }
    setExpandedPrompts(newExpanded);
  };

  const cancelEdit = () => {
    setEditingSchool(null);
    setShowAddSchool(false);
    setEditingPlan(null);
    setShowAddPlan(false);
    setEditingSignal(null);
    setShowAddSignal(false);
    setEditingUser(null);
    setSchoolForm({ name: '', prompt: '', active: true });
    setPlanForm({
      name: '',
      price: 0,
      recommendations_per_day: 1,
      features: [''],
      popular: false
    });
    setSignalForm({
      pair: 'XAUUSD',
      type: 'buy',
      entry: 0,
      stopLoss: 0,
      takeProfit1: 0,
      takeProfit2: 0,
      probability: 85,
      result: 'profit',
      profitPips: 0,
      date: new Date().toISOString().split('T')[0],
      school: 'Technical Analysis',
      featured: true,
      analysis: ''
    });
  };

  const getStats = () => {
    const totalUsers = users.length;
    const paidUsers = users.filter(u => u.plan !== 'free').length;
    const totalRevenue = users.reduce((sum, u) => {
      const plan = plans.find(p => p.id === u.plan);
      return sum + (plan?.price || 0);
    }, 0);

    const freeUsers = totalUsers - paidUsers;
    const conversionRate = totalUsers > 0 ? (paidUsers / totalUsers) * 100 : 0;
    const avgRevenuePerUser = paidUsers > 0 ? totalRevenue / paidUsers : 0;

    const userGrowth = 12.5;
    const revenueGrowth = 8.3;

    return {
      totalUsers,
      paidUsers,
      freeUsers,
      totalRevenue,
      conversionRate,
      avgRevenuePerUser,
      userGrowth,
      revenueGrowth,
      featuredSignalsCount: featuredSignals.length,
      totalRecommendations: allRecommendations.length
    };
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Shield className="h-4 w-4" />;
      case 'pro': return <Zap className="h-4 w-4" />;
      case 'elite': return <Crown className="h-4 w-4" />;
      default: return <Package className="h-4 w-4" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case 'free': return 'text-gray-400 bg-gray-400/10';
      case 'pro': return 'text-blue-400 bg-blue-400/10';
      case 'elite': return 'text-purple-400 bg-purple-400/10';
      default: return 'text-green-400 bg-green-400/10';
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

  const getResultColor = (result: string) => {
    switch (result) {
      case 'profit': return 'text-green-400 bg-green-400/10';
      case 'loss': return 'text-red-400 bg-red-400/10';
      case 'pending': return 'text-yellow-400 bg-yellow-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  // Filter functions
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
                         (user.displayName && user.displayName.toLowerCase().includes(userSearchTerm.toLowerCase()));
    const matchesPlan = userFilterPlan === 'all' || user.plan === userFilterPlan;
    return matchesSearch && matchesPlan;
  });

  const filteredRecommendations = allRecommendations.filter(rec => {
    const matchesSearch = rec.signal?.pair?.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
                         rec.school.toLowerCase().includes(recSearchTerm.toLowerCase()) ||
                         rec.response.toLowerCase().includes(recSearchTerm.toLowerCase());
    const matchesSchool = recFilterSchool === 'all' || rec.school === recFilterSchool;
    return matchesSearch && matchesSchool;
  });

  if (!user?.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-8 py-6 rounded-xl flex items-center space-x-3">
          <AlertCircle className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">Access Denied</h3>
            <p>You don't have admin privileges to access this page.</p>
          </div>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center space-x-3">
            <Shield className="h-8 w-8 text-yellow-400" />
            <span>Admin Dashboard</span>
          </h1>
          <p className="text-gray-300">
            Comprehensive analytics and system management
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            {[
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'featured-signals', label: 'Featured Signals', icon: Star },
              { id: 'users', label: 'Users', icon: Users },
              { id: 'all-signals', label: 'All Signals', icon: Activity },
              { id: 'plans', label: 'Plans', icon: CreditCard },
              { id: 'schools', label: 'Schools', icon: TrendingUp }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Users</p>
                    <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <ArrowUp className="h-3 w-3 text-green-400" />
                      <span className="text-green-400 text-xs">+{stats.userGrowth}%</span>
                    </div>
                  </div>
                  <Users className="h-8 w-8 text-blue-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-white">${stats.totalRevenue}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <ArrowUp className="h-3 w-3 text-green-400" />
                      <span className="text-green-400 text-xs">+{stats.revenueGrowth}%</span>
                    </div>
                  </div>
                  <DollarSign className="h-8 w-8 text-green-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Featured Signals</p>
                    <p className="text-2xl font-bold text-white">{stats.featuredSignalsCount}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Star className="h-3 w-3 text-yellow-400" />
                      <span className="text-yellow-400 text-xs">Homepage</span>
                    </div>
                  </div>
                  <Award className="h-8 w-8 text-yellow-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Total Signals</p>
                    <p className="text-2xl font-bold text-white">{stats.totalRecommendations}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Activity className="h-3 w-3 text-purple-400" />
                      <span className="text-purple-400 text-xs">Generated</span>
                    </div>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </div>

            {/* Additional Analytics */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">System Health</h3>
                  <Activity className="h-5 w-5 text-green-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">API Status</span>
                    <span className="text-green-400 font-semibold">Operational</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Database</span>
                    <span className="text-green-400 font-semibold">Healthy</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Uptime</span>
                    <span className="text-green-400 font-semibold">99.9%</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Top Performing</h3>
                  <Star className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-300">Best Plan</span>
                    <span className="text-blue-400 font-semibold">Pro</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Top School</span>
                    <span className="text-purple-400 font-semibold">Technical</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">Peak Hour</span>
                    <span className="text-orange-400 font-semibold">2-4 PM</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Quick Actions</h3>
                  <Settings className="h-5 w-5 text-gray-400" />
                </div>
                <div className="space-y-3">
                  <button 
                    onClick={() => setActiveTab('featured-signals')}
                    className="w-full text-left text-blue-400 hover:text-blue-300 text-sm"
                  >
                    Manage Featured Signals
                  </button>
                  <button 
                    onClick={() => setActiveTab('users')}
                    className="w-full text-left text-green-400 hover:text-green-300 text-sm"
                  >
                    Manage Users
                  </button>
                  <button 
                    onClick={loadAdminData}
                    className="w-full text-left text-purple-400 hover:text-purple-300 text-sm"
                  >
                    Refresh Data
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'featured-signals' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Featured Signals Management</h3>
              <button
                onClick={() => setShowAddSignal(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Featured Signal</span>
              </button>
            </div>

            {/* Add/Edit Signal Form */}
            {(showAddSignal || editingSignal) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">
                  {editingSignal ? 'Edit Featured Signal' : 'Add New Featured Signal'}
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trading Pair
                    </label>
                    <select
                      value={signalForm.pair}
                      onChange={(e) => setSignalForm({ ...signalForm, pair: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="XAUUSD" className="bg-gray-800">XAUUSD (Gold)</option>
                      <option value="EURUSD" className="bg-gray-800">EURUSD</option>
                      <option value="GBPUSD" className="bg-gray-800">GBPUSD</option>
                      <option value="USDJPY" className="bg-gray-800">USDJPY</option>
                      <option value="BTCUSD" className="bg-gray-800">BTCUSD</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Signal Type
                    </label>
                    <select
                      value={signalForm.type}
                      onChange={(e) => setSignalForm({ ...signalForm, type: e.target.value as 'buy' | 'sell' | 'hold' })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="buy" className="bg-gray-800">Buy</option>
                      <option value="sell" className="bg-gray-800">Sell</option>
                      <option value="hold" className="bg-gray-800">Hold</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Entry Price
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.entry}
                      onChange={(e) => setSignalForm({ ...signalForm, entry: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2045.50"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Stop Loss
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.stopLoss}
                      onChange={(e) => setSignalForm({ ...signalForm, stopLoss: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2035.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Take Profit 1
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.takeProfit1}
                      onChange={(e) => setSignalForm({ ...signalForm, takeProfit1: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2055.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Take Profit 2
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={signalForm.takeProfit2}
                      onChange={(e) => setSignalForm({ ...signalForm, takeProfit2: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2065.00"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Probability (%)
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={signalForm.probability}
                      onChange={(e) => setSignalForm({ ...signalForm, probability: parseInt(e.target.value) || 85 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="85"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Result
                    </label>
                    <select
                      value={signalForm.result}
                      onChange={(e) => setSignalForm({ ...signalForm, result: e.target.value as 'profit' | 'loss' | 'pending' })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="profit" className="bg-gray-800">Profit</option>
                      <option value="loss" className="bg-gray-800">Loss</option>
                      <option value="pending" className="bg-gray-800">Pending</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Profit/Loss (Pips)
                    </label>
                    <input
                      type="number"
                      value={signalForm.profitPips}
                      onChange={(e) => setSignalForm({ ...signalForm, profitPips: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="950"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={signalForm.date}
                      onChange={(e) => setSignalForm({ ...signalForm, date: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Trading School
                    </label>
                    <select
                      value={signalForm.school}
                      onChange={(e) => setSignalForm({ ...signalForm, school: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {schools.map(school => (
                        <option key={school.id} value={school.name} className="bg-gray-800">
                          {school.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Analysis (Optional)
                    </label>
                    <textarea
                      value={signalForm.analysis}
                      onChange={(e) => setSignalForm({ ...signalForm, analysis: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Optional analysis text for this signal..."
                    />
                  </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="featured"
                    checked={signalForm.featured}
                    onChange={(e) => setSignalForm({ ...signalForm, featured: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="featured" className="text-gray-300 flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Show on Homepage</span>
                  </label>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={editingSignal ? handleUpdateSignal : handleAddSignal}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingSignal ? 'Update Signal' : 'Add Signal'}</span>
                  </button>
                  
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Featured Signals List */}
            <div className="space-y-4">
              {featuredSignals.map((signal) => (
                <div key={signal.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium border flex items-center space-x-1 ${getSignalTypeColor(signal.type)}`}>
                        {getSignalTypeIcon(signal.type)}
                        <span>{signal.type?.toUpperCase()}</span>
                      </div>
                      
                      <div>
                        <h4 className="text-lg font-semibold text-white">{signal.pair}</h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{signal.date}</span>
                          <span>•</span>
                          <span>{signal.school}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div className={`px-3 py-1 rounded-full text-sm font-medium ${getResultColor(signal.result)}`}>
                        {signal.result?.toUpperCase()}
                        {signal.profitPips && signal.result === 'profit' && (
                          <span className="ml-1">+{signal.profitPips} pips</span>
                        )}
                      </div>
                      
                      <button
                        onClick={() => handleEditSignal(signal)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Edit signal"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSignal(signal.id)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Delete signal"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {signal.entry && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Entry</p>
                        <p className="text-white font-bold">{signal.entry}</p>
                      </div>
                    )}
                    
                    {signal.stopLoss && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Stop Loss</p>
                        <p className="text-red-400 font-bold">{signal.stopLoss}</p>
                      </div>
                    )}
                    
                    {signal.takeProfit1 && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">TP1</p>
                        <p className="text-green-400 font-bold">{signal.takeProfit1}</p>
                      </div>
                    )}
                    
                    {signal.takeProfit2 && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">TP2</p>
                        <p className="text-green-400 font-bold">{signal.takeProfit2}</p>
                      </div>
                    )}
                    
                    {signal.probability && (
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Probability</p>
                        <p className="text-blue-400 font-bold">{signal.probability}%</p>
                      </div>
                    )}
                    
                    <div className="bg-black/20 rounded-lg p-3">
                      <p className="text-gray-400 text-xs">Featured</p>
                      <p className={`font-bold ${signal.featured ? 'text-green-400' : 'text-gray-400'}`}>
                        {signal.featured ? 'Yes' : 'No'}
                      </p>
                    </div>
                  </div>

                  {signal.analysis && (
                    <div className="mt-4 bg-black/20 rounded-lg p-4">
                      <h5 className="text-sm font-medium text-gray-300 mb-2">Analysis:</h5>
                      <p className="text-gray-100 text-sm">{signal.analysis}</p>
                    </div>
                  )}
                </div>
              ))}

              {featuredSignals.length === 0 && (
                <div className="text-center py-12">
                  <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Featured Signals</h3>
                  <p className="text-gray-300 mb-6">
                    Create your first featured signal to showcase on the homepage
                  </p>
                  <button
                    onClick={() => setShowAddSignal(true)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Signal</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <h3 className="text-2xl font-bold text-white">User Management</h3>
              <div className="mt-4 lg:mt-0 flex items-center space-x-3">
                <button
                  onClick={loadAdminData}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Users
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={userSearchTerm}
                      onChange={(e) => setUserSearchTerm(e.target.value)}
                      placeholder="Search by email or name..."
                      className="pl-10 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter by Plan
                  </label>
                  <select
                    value={userFilterPlan}
                    onChange={(e) => setUserFilterPlan(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">All Plans</option>
                    <option value="free" className="bg-gray-800">Free</option>
                    <option value="pro" className="bg-gray-800">Pro</option>
                    <option value="elite" className="bg-gray-800">Elite</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Edit User Modal */}
            {editingUser && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">
                  Edit User: {editingUser.email}
                </h4>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan
                    </label>
                    <select
                      value={userForm.plan}
                      onChange={(e) => setUserForm({ ...userForm, plan: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="free" className="bg-gray-800">Free</option>
                      <option value="pro" className="bg-gray-800">Pro</option>
                      <option value="elite" className="bg-gray-800">Elite</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Used Today
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={userForm.used_today}
                      onChange={(e) => setUserForm({ ...userForm, used_today: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Daily Limit
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={userForm.recommendation_limit}
                      onChange={(e) => setUserForm({ ...userForm, recommendation_limit: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleUpdateUser}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Update User</span>
                  </button>
                  
                  <button
                    onClick={() => setEditingUser(null)}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Users Table */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/5">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        User
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Plan
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Usage
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {filteredUsers.map((user) => (
                      <tr key={user.uid} className="hover:bg-white/5">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            {user.photoURL ? (
                              <img
                                src={user.photoURL}
                                alt={user.displayName || user.email}
                                className="h-8 w-8 rounded-full"
                              />
                            ) : (
                              <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                                <Users className="h-4 w-4 text-white" />
                              </div>
                            )}
                            <div>
                              <div className="text-white font-medium">{user.email}</div>
                              {user.displayName && (
                                <div className="text-gray-400 text-sm">{user.displayName}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getPlanColor(user.plan)}`}>
                            {getPlanIcon(user.plan)}
                            <span className="capitalize">{user.plan}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-white">
                          {user.used_today} / {user.recommendation_limit}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEditUser(user)}
                              className="text-blue-400 hover:text-blue-300 p-1 rounded transition-colors"
                              title="Edit user"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(user.uid, user.email)}
                              className="text-red-400 hover:text-red-300 p-1 rounded transition-colors"
                              title="Delete user"
                            >
                              <UserX className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Users Found</h3>
                <p className="text-gray-300">
                  {userSearchTerm || userFilterPlan !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'No users have registered yet'
                  }
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'all-signals' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">All User Recommendations</h3>
              <button
                onClick={loadAdminData}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Search Recommendations
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={recSearchTerm}
                      onChange={(e) => setRecSearchTerm(e.target.value)}
                      placeholder="Search by pair, school, or content..."
                      className="pl-10 w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Filter by School
                  </label>
                  <select
                    value={recFilterSchool}
                    onChange={(e) => setRecFilterSchool(e.target.value)}
                    className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all" className="bg-gray-800">All Schools</option>
                    {schools.map(school => (
                      <option key={school.id} value={school.name} className="bg-gray-800">
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Recommendations List */}
            <div className="space-y-4">
              {filteredRecommendations.map((rec) => (
                <div key={rec.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="bg-blue-500/20 p-3 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">
                          {rec.signal?.pair || 'Unknown Pair'} - {rec.school}
                        </h4>
                        <div className="flex items-center space-x-2 text-sm text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {rec.timestamp?.toDate ? 
                              rec.timestamp.toDate().toLocaleDateString() : 
                              'Unknown Date'
                            }
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {rec.signal && (
                        <button
                          onClick={() => handlePromoteRecommendation(rec)}
                          className="bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                        >
                          <Star className="h-4 w-4" />
                          <span>Promote to Featured</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {rec.signal && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Type</p>
                        <p className={`font-bold uppercase text-sm ${
                          rec.signal.type === 'buy' ? 'text-green-400' : 
                          rec.signal.type === 'sell' ? 'text-red-400' : 'text-yellow-400'
                        }`}>
                          {rec.signal.type}
                        </p>
                      </div>
                      
                      {rec.signal.entry && (
                        <div className="bg-black/20 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">Entry</p>
                          <p className="text-white font-bold text-sm">{rec.signal.entry}</p>
                        </div>
                      )}
                      
                      {rec.signal.probability && (
                        <div className="bg-black/20 rounded-lg p-3">
                          <p className="text-gray-400 text-xs">Probability</p>
                          <p className="text-blue-400 font-bold text-sm">{rec.signal.probability}%</p>
                        </div>
                      )}
                      
                      <div className="bg-black/20 rounded-lg p-3">
                        <p className="text-gray-400 text-xs">Status</p>
                        <p className="text-green-400 font-bold text-sm">Can Promote</p>
                      </div>
                    </div>
                  )}

                  <div className="bg-black/20 rounded-lg p-4">
                    <h5 className="text-sm font-medium text-gray-300 mb-2">
                      AI Analysis:
                    </h5>
                    <div className="text-gray-100 text-sm line-clamp-3">
                      {rec.response}
                    </div>
                  </div>
                </div>
              ))}

              {filteredRecommendations.length === 0 && (
                <div className="text-center py-12">
                  <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Recommendations Found</h3>
                  <p className="text-gray-300">
                    {recSearchTerm || recFilterSchool !== 'all' 
                      ? 'Try adjusting your search or filter criteria'
                      : 'No user recommendations available yet'
                    }
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'plans' && (
          <div className="space-y-6">
            {/* Add Plan Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Subscription Plans Management</h3>
              <button
                onClick={() => setShowAddPlan(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add Plan</span>
              </button>
            </div>

            {/* Add/Edit Plan Form */}
            {(showAddPlan || editingPlan) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">
                  {editingPlan ? 'Edit Plan' : 'Add New Plan'}
                </h4>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Plan Name
                    </label>
                    <input
                      type="text"
                      value={planForm.name}
                      onChange={(e) => setPlanForm({ ...planForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Pro Plan"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Price (USD/month)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={planForm.price}
                      onChange={(e) => setPlanForm({ ...planForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="29.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Signals Per Day
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={planForm.recommendations_per_day}
                      onChange={(e) => setPlanForm({ ...planForm, recommendations_per_day: parseInt(e.target.value) || 1 })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="5"
                    />
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Features
                  </label>
                  <div className="space-y-3">
                    {planForm.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Enter feature description"
                        />
                        {planForm.features.length > 1 && (
                          <button
                            onClick={() => removeFeatureField(index)}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addFeatureField}
                      className="text-blue-400 hover:text-blue-300 text-sm flex items-center space-x-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Feature</span>
                    </button>
                  </div>
                </div>

                <div className="mt-6 flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="popular"
                    checked={planForm.popular}
                    onChange={(e) => setPlanForm({ ...planForm, popular: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="popular" className="text-gray-300 flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-400" />
                    <span>Mark as Popular Plan</span>
                  </label>
                </div>

                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={editingPlan ? handleUpdatePlan : handleAddPlan}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>{editingPlan ? 'Update Plan' : 'Add Plan'}</span>
                  </button>
                  
                  <button
                    onClick={cancelEdit}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                  >
                    <X className="h-4 w-4" />
                    <span>Cancel</span>
                  </button>
                </div>
              </div>
            )}

            {/* Plans List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {plans.map((plan) => (
                <div key={plan.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getPlanColor(plan.id)}`}>
                        {getPlanIcon(plan.id)}
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                        {plan.popular && (
                          <div className="flex items-center space-x-1 text-yellow-400 text-xs">
                            <Star className="h-3 w-3" />
                            <span>Popular</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleEditPlan(plan)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Edit plan"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeletePlan(plan.id, plan.name)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Delete plan"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-2xl font-bold text-white">${plan.price}/month</div>
                    <div className="text-gray-300 text-sm">{plan.recommendations_per_day} signals/day</div>
                  </div>

                  <ul className="space-y-2 mb-4">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="text-gray-300 text-sm flex items-center space-x-2">
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full flex-shrink-0"></div>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {plans.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Plans Found</h3>
                <p className="text-gray-300 mb-6">
                  Create your first subscription plan to get started
                </p>
                <button
                  onClick={() => setShowAddPlan(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First Plan</span>
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'schools' && (
          <div className="space-y-6">
            {/* Add School Button */}
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-bold text-white">Trading Schools Management</h3>
              <button
                onClick={() => setShowAddSchool(true)}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Add School</span>
              </button>
            </div>

            {/* Add School Form */}
            {(showAddSchool || editingSchool) && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <h4 className="text-xl font-semibold text-white mb-4">
                  {editingSchool ? 'Edit School' : 'Add New School'}
                </h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      School Name
                    </label>
                    <input
                      type="text"
                      value={schoolForm.name}
                      onChange={(e) => setSchoolForm({ ...schoolForm, name: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Technical Analysis"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      AI Prompt
                    </label>
                    <textarea
                      value={schoolForm.prompt}
                      onChange={(e) => setSchoolForm({ ...schoolForm, prompt: e.target.value })}
                      rows={6}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-vertical"
                      placeholder="Enter the AI prompt that will be used for this trading school..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={schoolForm.active}
                      onChange={(e) => setSchoolForm({ ...schoolForm, active: e.target.checked })}
                      className="w-4 h-4 text-blue-600 bg-white/10 border-white/20 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-gray-300">
                      Active (available for users)
                    </label>
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={editingSchool ? handleUpdateSchool : handleAddSchool}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <Save className="h-4 w-4" />
                      <span>{editingSchool ? 'Update School' : 'Add School'}</span>
                    </button>
                    
                    <button
                      onClick={cancelEdit}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-all flex items-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Schools List */}
            <div className="space-y-4">
              {schools.map((school) => (
                <div key={school.id} className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-xl font-semibold text-white">{school.name}</h4>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        school.active 
                          ? 'text-green-400 bg-green-400/10' 
                          : 'text-red-400 bg-red-400/10'
                      }`}>
                        {school.active ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => togglePromptExpansion(school.id)}
                        className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10 transition-all"
                        title={expandedPrompts.has(school.id) ? 'Collapse prompt' : 'Expand prompt'}
                      >
                        {expandedPrompts.has(school.id) ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      
                      <button
                        onClick={() => handleEditSchool(school)}
                        className="text-blue-400 hover:text-blue-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Edit school"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDeleteSchool(school.id, school.name)}
                        className="text-red-400 hover:text-red-300 p-2 rounded-lg hover:bg-white/10 transition-all"
                        title="Delete school"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="bg-black/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="text-sm font-medium text-gray-300">AI Prompt:</h5>
                      <span className="text-xs text-gray-400">
                        {school.prompt.length} characters
                      </span>
                    </div>
                    
                    <div className={`text-gray-100 text-sm ${
                      expandedPrompts.has(school.id) ? '' : 'line-clamp-3'
                    }`}>
                      {expandedPrompts.has(school.id) ? (
                        <pre className="whitespace-pre-wrap font-mono text-xs leading-relaxed">
                          {school.prompt}
                        </pre>
                      ) : (
                        <p className="line-clamp-3">
                          {school.prompt}
                        </p>
                      )}
                    </div>
                    
                    {!expandedPrompts.has(school.id) && school.prompt.length > 150 && (
                      <button
                        onClick={() => togglePromptExpansion(school.id)}
                        className="text-blue-400 hover:text-blue-300 text-xs mt-2 flex items-center space-x-1"
                      >
                        <span>Show more</span>
                        <Eye className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {schools.length === 0 && (
              <div className="text-center py-12">
                <TrendingUp className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No Schools Found</h3>
                <p className="text-gray-300 mb-6">
                  Create your first trading school to get started
                </p>
                <button
                  onClick={() => setShowAddSchool(true)}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center space-x-2 mx-auto"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add First School</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;