import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getPlans, updateUserPlan } from '../services/firestore';
import { 
  validatePayComConfig, 
  hasValidPayComPlan, 
  getPayComSetupInstructions,
  debugPayComConfig,
  testPayComConnection,
  PAYCOM_PLANS
} from '../services/paycom';
import { Plan } from '../types';
import PayComButton from '../components/PayComButton';
import { 
  CheckCircle, 
  Crown, 
  Zap, 
  Shield, 
  Star,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  Headphones,
  Database,
  Smartphone,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Info,
  Loader,
  ExternalLink,
  CreditCard,
  Settings,
  Wrench,
  RefreshCw,
  CheckSquare,
  XSquare,
  ChevronDown
} from 'lucide-react';

const Plans: React.FC = () => {
  const { user } = useAuth();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState<string>('');
  const [paymentSuccess, setPaymentSuccess] = useState<string>('');
  const [payComReady, setPayComReady] = useState(false);
  const [showSetupInstructions, setShowSetupInstructions] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [configStatus, setConfigStatus] = useState<{
    validPlans: string[];
    errors: string[];
    lastCheck: Date | null;
  }>({
    validPlans: [],
    errors: [],
    lastCheck: null
  });

  useEffect(() => {
    loadPlans();
    initializePayCom();
  }, []);

  const initializePayCom = async () => {
    try {
      console.log('🔄 Initializing Pay.com configuration...');
      
      // Run debug check
      debugPayComConfig();
      
      // Test connection
      const connectionTest = await testPayComConnection();
      
      if (connectionTest) {
        validatePayComConfig();
        setPayComReady(true);
        setConfigStatus({
          validPlans: Object.keys(PAYCOM_PLANS),
          errors: [],
          lastCheck: new Date()
        });
        console.log('✅ Pay.com initialization successful!');
        setPaymentError('');
      } else {
        throw new Error('Failed to connect to Pay.com API');
      }
      
    } catch (error: any) {
      console.error('❌ Pay.com initialization failed:', error);
      setPaymentError(`Pay.com Configuration Error: ${error.message}`);
      setShowSetupInstructions(true);
      setPayComReady(false);
      setConfigStatus({
        validPlans: [],
        errors: [error.message],
        lastCheck: new Date()
      });
    }
  };

  const loadPlans = async () => {
    try {
      const plansData = await getPlans();
      setPlans(plansData);
      console.log('📊 Loaded plans:', plansData.map(p => ({ 
        id: p.id, 
        name: p.name, 
        price: p.price,
        paycom_supported: hasValidPayComPlan(p.id)
      })));
    } catch (error) {
      console.error('Error loading plans:', error);
      setPaymentError('Failed to load subscription plans. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (paymentData: any) => {
    if (!user || !selectedPlan) {
      setPaymentError('User session expired. Please log in again.');
      return;
    }

    setPaymentLoading(true);
    setPaymentError('');

    try {
      console.log('🎉 Pay.com Payment Success:', paymentData);
      
      // Update user subscription in Firestore
      await updateUserPlan(user.uid, selectedPlan.id, paymentData.subscriptionId || paymentData.id);
      
      setPaymentSuccess(`🎉 Welcome to ${selectedPlan.name}! Your subscription is now active.`);
      setSelectedPlan(null);
      
      // Redirect to dashboard after success
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 3000);
      
    } catch (error: any) {
      console.error('Error processing subscription:', error);
      setPaymentError(`Subscription activation failed: ${error.message}. Please contact support.`);
    } finally {
      setPaymentLoading(false);
    }
  };

  const handlePaymentError = (error: string) => {
    console.error('Pay.com Payment Error:', error);
    setPaymentError(error);
    setPaymentLoading(false);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free': return <Shield className="h-8 w-8" />;
      case 'pro': return <Zap className="h-8 w-8" />;
      case 'elite': return <Crown className="h-8 w-8" />;
      default: return <Shield className="h-8 w-8" />;
    }
  };

  const getPlanGradient = (planId: string) => {
    switch (planId) {
      case 'free': return 'from-gray-500 to-gray-600';
      case 'pro': return 'from-blue-500 to-purple-600';
      case 'elite': return 'from-purple-600 to-pink-600';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getPlanBadge = (plan: Plan) => {
    if (plan.popular) return { text: 'Most Popular', color: 'bg-blue-500' };
    if (plan.id === 'elite') return { text: 'Best Value', color: 'bg-purple-500' };
    return null;
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('signal')) return <TrendingUp className="h-4 w-4" />;
    if (feature.includes('analysis')) return <BarChart3 className="h-4 w-4" />;
    if (feature.includes('support')) return <Headphones className="h-4 w-4" />;
    if (feature.includes('data') || feature.includes('Historical')) return <Database className="h-4 w-4" />;
    if (feature.includes('API')) return <Smartphone className="h-4 w-4" />;
    return <CheckCircle className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const setupInstructions = getPayComSetupInstructions();

  return (
    <div className="min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="h-4 w-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">AI-Powered Trading</span>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              {' '}Trading Plan
            </span>
          </h1>
          
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-8">
            Unlock the power of AI-driven trading insights with our comprehensive plans designed for traders at every level
          </p>

          <div className="flex flex-wrap justify-center gap-8 text-sm text-gray-400">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Secure Pay.com payments</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span>24/7 support</span>
            </div>
          </div>
        </div>

        {/* Configuration Status Panel */}
        {process.env.NODE_ENV === 'development' && (
          <div className="max-w-4xl mx-auto mb-8">
            <button
              onClick={() => setDebugMode(!debugMode)}
              className="flex items-center space-x-2 text-gray-400 hover:text-white text-sm"
            >
              <Settings className="h-4 w-4" />
              <span>Pay.com Configuration Status</span>
              <ChevronDown className={`h-4 w-4 transition-transform ${debugMode ? 'rotate-180' : ''}`} />
            </button>
            
            {debugMode && (
              <div className="mt-4 bg-black/40 border border-gray-600 rounded-lg p-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-green-400 font-semibold mb-3">✅ Configuration Status</h3>
                    <div className="space-y-2 text-sm">
                      <p>Pay.com Ready: {payComReady ? '✅ YES' : '❌ NO'}</p>
                      <p>Plans Loaded: {plans.length}</p>
                      <p>Supported Plans: {configStatus.validPlans.length}/{plans.length}</p>
                      {configStatus.lastCheck && (
                        <p>Last Check: {configStatus.lastCheck.toLocaleTimeString()}</p>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-blue-400 font-semibold mb-3">📊 Plan Support</h3>
                    <div className="space-y-2 text-sm">
                      {plans.map(plan => {
                        const isSupported = hasValidPayComPlan(plan.id);
                        return (
                          <div key={plan.id} className="flex items-center space-x-2">
                            {isSupported ? (
                              <CheckSquare className="h-4 w-4 text-green-400" />
                            ) : (
                              <XSquare className="h-4 w-4 text-red-400" />
                            )}
                            <span className={isSupported ? 'text-green-400' : 'text-red-400'}>
                              {plan.name}: {isSupported ? 'Supported' : 'Not Supported'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {configStatus.errors.length > 0 && (
                  <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <h4 className="text-red-400 font-semibold mb-2">⚠️ Configuration Issues:</h4>
                    <ul className="text-red-300 text-sm space-y-1">
                      {configStatus.errors.map((error, index) => (
                        <li key={index}>• {error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="mt-4 flex space-x-3">
                  <button
                    onClick={initializePayCom}
                    className="text-blue-400 hover:text-blue-300 flex items-center space-x-1 text-sm"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Refresh Configuration</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Global Success Message */}
        {paymentSuccess && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-4 rounded-xl flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium">{paymentSuccess}</p>
                <p className="text-sm text-green-300 mt-1">Redirecting to dashboard in a few seconds...</p>
              </div>
            </div>
          </div>
        )}

        {/* Global Error Message */}
        {paymentError && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-xl flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="font-medium mb-2">Payment Issue</p>
                <p className="text-sm">{paymentError}</p>
              </div>
              <button
                onClick={() => setPaymentError('')}
                className="text-red-400 hover:text-red-300 text-xl leading-none"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Pay.com Setup Instructions */}
        {showSetupInstructions && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-6">
              <div className="flex items-start space-x-3">
                <Info className="h-6 w-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <h3 className="text-blue-400 font-semibold mb-3">{setupInstructions.title}</h3>
                  <div className="space-y-1 text-sm text-gray-300">
                    {setupInstructions.steps.map((step, index) => (
                      <p key={index} className="leading-relaxed">{step}</p>
                    ))}
                  </div>
                  <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <p className="text-green-400 text-sm">
                      <strong>Note:</strong> {setupInstructions.note}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSetupInstructions(false)}
                  className="text-blue-400 hover:text-blue-300 text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Pay.com Status Banner */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm ${
            payComReady 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
          }`}>
            {payComReady ? (
              <>
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Pay.com Payment System Ready</span>
                <span className="text-xs">• Secure payments enabled</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Pay.com Configuration Required</span>
                <button
                  onClick={initializePayCom}
                  className="ml-auto text-xs hover:underline"
                >
                  Retry Setup
                </button>
              </>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-20">
          {plans.map((plan, index) => {
            const badge = getPlanBadge(plan);
            const isCurrentPlan = user?.plan === plan.id;
            const isSupported = hasValidPayComPlan(plan.id);
            
            return (
              <div
                key={plan.id}
                className={`relative bg-white/5 backdrop-blur-sm rounded-2xl border transition-all duration-300 hover:scale-105 hover:bg-white/10 ${
                  plan.popular 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/10 hover:border-white/20'
                } ${index === 1 ? 'lg:scale-110' : ''}`}
              >
                {badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`${badge.color} text-white px-6 py-2 rounded-full text-sm font-semibold flex items-center space-x-1`}>
                      <Star className="h-3 w-3" />
                      <span>{badge.text}</span>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {/* Plan Header */}
                  <div className="text-center mb-8">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${getPlanGradient(plan.id)} mb-4`}>
                      <div className="text-white">
                        {getPlanIcon(plan.id)}
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {plan.name}
                    </h3>
                    
                    <div className="mb-4">
                      <div className="flex items-baseline justify-center">
                        <span className="text-5xl font-bold text-white">
                          ${plan.price}
                        </span>
                        <span className="text-gray-400 ml-2">/month</span>
                      </div>
                      {plan.price > 0 && (
                        <p className="text-gray-400 text-sm mt-1">
                          Billed monthly via Pay.com
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-center space-x-2 text-gray-300">
                      <Clock className="h-4 w-4" />
                      <span className="font-medium">
                        {plan.recommendations_per_day} signal{plan.recommendations_per_day !== 1 ? 's' : ''} per day
                      </span>
                    </div>
                  </div>

                  {/* Features List */}
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center mt-0.5">
                          <div className="text-green-400">
                            {getFeatureIcon(feature)}
                          </div>
                        </div>
                        <span className="text-gray-300 leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  {isCurrentPlan ? (
                    <div className="text-center">
                      <div className="w-full py-4 px-6 rounded-xl font-semibold bg-green-500/20 text-green-400 border border-green-500/30 flex items-center justify-center space-x-2">
                        <CheckCircle className="h-5 w-5" />
                        <span>Current Plan</span>
                      </div>
                    </div>
                  ) : plan.id === 'free' ? (
                    <button
                      className="w-full py-4 px-6 rounded-xl font-semibold bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-all"
                      disabled
                    >
                      Free Forever
                    </button>
                  ) : (
                    <>
                      {!selectedPlan || selectedPlan.id !== plan.id ? (
                        <button
                          onClick={() => {
                            if (!user) {
                              window.location.href = '/login';
                              return;
                            }
                            if (!isSupported || !payComReady) {
                              setShowSetupInstructions(true);
                              return;
                            }
                            setSelectedPlan(plan);
                            setPaymentError('');
                            setPaymentSuccess('');
                          }}
                          disabled={!isSupported || !payComReady}
                          className={`w-full py-4 px-6 rounded-xl font-semibold transition-all flex items-center justify-center space-x-2 ${
                            !isSupported || !payComReady
                              ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                              : plan.popular
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                              : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                          }`}
                        >
                          {!user ? (
                            <>
                              <span>Sign In to Subscribe</span>
                              <ExternalLink className="h-4 w-4" />
                            </>
                          ) : !isSupported || !payComReady ? (
                            <>
                              <Settings className="h-4 w-4" />
                              <span>Setup Required</span>
                            </>
                          ) : (
                            <>
                              <span>Get Started</span>
                              <ArrowRight className="h-4 w-4" />
                            </>
                          )}
                        </button>
                      ) : (
                        <div className="space-y-4">
                          {paymentLoading && (
                            <div className="bg-blue-500/10 border border-blue-500/20 text-blue-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                              <Loader className="h-4 w-4 animate-spin" />
                              <span>Processing subscription...</span>
                            </div>
                          )}

                          {isSupported && payComReady && user ? (
                            <PayComButton
                              planId={plan.id}
                              planName={plan.name}
                              price={plan.price}
                              userEmail={user.email}
                              userId={user.uid}
                              onSuccess={handlePaymentSuccess}
                              onError={handlePaymentError}
                              disabled={paymentLoading}
                            />
                          ) : (
                            <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-center space-x-2">
                              <AlertCircle className="h-4 w-4" />
                              <span>Pay.com setup required</span>
                            </div>
                          )}
                          
                          <button
                            onClick={() => {
                              setSelectedPlan(null);
                              setPaymentError('');
                              setPaymentSuccess('');
                            }}
                            disabled={paymentLoading}
                            className="w-full py-2 px-4 rounded-lg text-sm text-gray-400 hover:text-white border border-gray-600 hover:border-gray-400 transition-colors disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Debug Info for Development */}
                  {process.env.NODE_ENV === 'development' && (
                    <div className="mt-4 text-xs text-gray-500 text-center bg-black/20 rounded p-2">
                      Plan: {plan.id}
                      <br />
                      Pay.com Support: {isSupported ? '✅' : '❌'}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Comparison */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 mb-20">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Why Choose AI Trader?
          </h3>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Advanced AI Analysis
              </h4>
              <p className="text-gray-300">
                Powered by GPT-4 and cutting-edge machine learning algorithms for precise market predictions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Secure Payments
              </h4>
              <p className="text-gray-300">
                Pay.com integration with bank-level security and multiple payment methods
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-2">
                Trusted by Thousands
              </h4>
              <p className="text-gray-300">
                Join over 10,000+ traders who trust our AI-powered insights for their trading decisions
              </p>
            </div>
          </div>
        </div>

        {/* Enterprise CTA */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-2xl p-12 border border-blue-500/30 text-center">
          <div className="max-w-3xl mx-auto">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Crown className="h-10 w-10 text-white" />
            </div>
            
            <h3 className="text-3xl font-bold text-white mb-4">
              Need a Custom Solution?
            </h3>
            
            <p className="text-xl text-gray-300 mb-8">
              Get enterprise-grade features, custom integrations, and dedicated support for your organization
            </p>

            <div className="flex flex-wrap justify-center gap-6 mb-8 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Custom API integrations</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Dedicated account manager</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>White-label solutions</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Priority support</span>
              </div>
            </div>

            <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto">
              <span>Contact Sales Team</span>
              <ArrowRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Questions? We're here to help
          </h3>
          <p className="text-gray-300 mb-6">
            Contact our support team for any questions about our plans and features
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all border border-white/20">
              View FAQ
            </button>
            <button className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-lg font-medium transition-all border border-white/20">
              Contact Support
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Plans;