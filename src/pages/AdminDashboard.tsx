import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getAllUsers, getPlans, getSchools, createSchool, updateSchool, deleteSchool, createPlan, updatePlan, deletePlan } from '../services/firestore';
import { User, Plan, School } from '../types';
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
  LineChart
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('analytics');
  
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
    paypal_plan_id: '',
    popular: false
  });

  useEffect(() => {
    if (user?.isAdmin) {
      loadAdminData();
    }
  }, [user]);

  const loadAdminData = async () => {
    try {
      const [usersData, plansData, schoolsData] = await Promise.all([
        getAllUsers(),
        getPlans(),
        getSchools()
      ]);
      
      setUsers(usersData);
      setPlans(plansData);
      setSchools(schoolsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
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
        paypal_plan_id: planForm.paypal_plan_id.trim(),
        popular: planForm.popular
      });

      const plansData = await getPlans();
      setPlans(plansData);

      setPlanForm({
        name: '',
        price: 0,
        recommendations_per_day: 1,
        features: [''],
        paypal_plan_id: '',
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
      features: [...plan.features, ''], // Add empty string for new feature input
      paypal_plan_id: plan.paypal_plan_id,
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
        paypal_plan_id: planForm.paypal_plan_id.trim(),
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
        paypal_plan_id: '',
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
    setSchoolForm({ name: '', prompt: '', active: true });
    setPlanForm({
      name: '',
      price: 0,
      recommendations_per_day: 1,
      features: [''],
      paypal_plan_id: '',
      popular: false
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

    // Calculate growth (mock data for demo)
    const userGrowth = 12.5; // +12.5%
    const revenueGrowth = 8.3; // +8.3%

    return {
      totalUsers,
      paidUsers,
      freeUsers,
      totalRevenue,
      conversionRate,
      avgRevenuePerUser,
      userGrowth,
      revenueGrowth
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

  const getAnalyticsData = () => {
    const planDistribution = plans.map(plan => ({
      name: plan.name,
      count: users.filter(u => u.plan === plan.id).length,
      color: plan.id === 'free' ? '#6B7280' : plan.id === 'pro' ? '#3B82F6' : '#8B5CF6'
    }));

    // Mock usage data for the last 7 days
    const usageData = [
      { day: 'Mon', signals: 45, users: 12 },
      { day: 'Tue', signals: 52, users: 15 },
      { day: 'Wed', signals: 38, users: 11 },
      { day: 'Thu', signals: 61, users: 18 },
      { day: 'Fri', signals: 55, users: 16 },
      { day: 'Sat', signals: 42, users: 13 },
      { day: 'Sun', signals: 48, users: 14 }
    ];

    return { planDistribution, usageData };
  };

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
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = getStats();
  const { planDistribution, usageData } = getAnalyticsData();

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
              { id: 'users', label: 'Users', icon: Users },
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
                    <p className="text-gray-300 text-sm">Conversion Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.conversionRate.toFixed(1)}%</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <Percent className="h-3 w-3 text-purple-400" />
                      <span className="text-purple-400 text-xs">Free to Paid</span>
                    </div>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-300 text-sm">Avg Revenue/User</p>
                    <p className="text-2xl font-bold text-white">${stats.avgRevenuePerUser.toFixed(0)}</p>
                    <div className="flex items-center space-x-1 mt-1">
                      <DollarSign className="h-3 w-3 text-orange-400" />
                      <span className="text-orange-400 text-xs">ARPU</span>
                    </div>
                  </div>
                  <Crown className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>

            {/* Charts Row */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Plan Distribution */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Plan Distribution</h3>
                  <PieChart className="h-5 w-5 text-blue-400" />
                </div>
                
                <div className="space-y-4">
                  {planDistribution.map((plan, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: plan.color }}
                        ></div>
                        <span className="text-gray-300">{plan.name}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-semibold">{plan.count}</span>
                        <span className="text-gray-400 text-sm">
                          ({stats.totalUsers > 0 ? ((plan.count / stats.totalUsers) * 100).toFixed(1) : 0}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Total Users</span>
                    <span className="text-white font-semibold">{stats.totalUsers}</span>
                  </div>
                </div>
              </div>

              {/* Usage Trends */}
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-white">Weekly Activity</h3>
                  <LineChart className="h-5 w-5 text-green-400" />
                </div>
                
                <div className="space-y-4">
                  {usageData.map((day, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-300 w-12">{day.day}</span>
                      <div className="flex-1 mx-4">
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full"
                              style={{ width: `${(day.signals / 70) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium w-8">{day.signals}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-400 text-sm">
                        <Users className="h-3 w-3" />
                        <span>{day.users}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-300">Total Signals</span>
                      <p className="text-white font-semibold">
                        {usageData.reduce((sum, day) => sum + day.signals, 0)}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-300">Active Users</span>
                      <p className="text-white font-semibold">
                        {Math.max(...usageData.map(day => day.users))}
                      </p>
                    </div>
                  </div>
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
                  <button className="w-full text-left text-blue-400 hover:text-blue-300 text-sm">
                    Export User Data
                  </button>
                  <button className="w-full text-left text-green-400 hover:text-green-300 text-sm">
                    Generate Report
                  </button>
                  <button className="w-full text-left text-purple-400 hover:text-purple-300 text-sm">
                    System Backup
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden">
            <div className="p-6 border-b border-white/20">
              <h3 className="text-xl font-semibold text-white">User Management</h3>
            </div>
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
                      Usage Today
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {users.map((user) => (
                    <tr key={user.uid} className="hover:bg-white/5">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{user.email}</div>
                        <div className="text-gray-400 text-sm">{user.uid}</div>
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
                    </tr>
                  ))}
                </tbody>
              </table>
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

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      PayPal Plan ID
                    </label>
                    <input
                      type="text"
                      value={planForm.paypal_plan_id}
                      onChange={(e) => setPlanForm({ ...planForm, paypal_plan_id: e.target.value })}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="P-YOUR-PAYPAL-PLAN-ID"
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

                  {plan.paypal_plan_id && (
                    <div className="text-xs text-gray-400 bg-black/20 rounded p-2">
                      PayPal ID: {plan.paypal_plan_id}
                    </div>
                  )}
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