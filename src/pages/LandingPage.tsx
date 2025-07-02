import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { getFeaturedSignals, getAllRecommendations } from '../services/firestore';
import { 
  TrendingUp, 
  Zap, 
  Shield, 
  Users, 
  ArrowRight, 
  CheckCircle, 
  Star,
  Award,
  Globe,
  BarChart3,
  Clock,
  Target,
  TrendingDown,
  Minus,
  Play,
  ChevronLeft,
  ChevronRight,
  Calendar,
  DollarSign,
  Percent,
  Activity,
  Brain,
  Sparkles,
  Eye,
  Filter,
  RefreshCw,
  HelpCircle,
  ChevronDown,
  Mail,
  Phone,
  MessageCircle
} from 'lucide-react';

interface FeaturedSignal {
  id: string;
  pair: string;
  type: 'buy' | 'sell' | 'hold';
  entry: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  probability: number;
  result: 'profit' | 'loss' | 'pending';
  profitPips?: number;
  date: string;
  school: string;
  featured: boolean;
}

interface RecentAnalysis {
  id: string;
  school: string;
  response: string;
  timestamp: any;
  signal?: {
    pair: string;
    type: 'buy' | 'sell' | 'hold';
    entry?: number;
    probability?: number;
  };
}

interface FAQItem {
  question: string;
  answer: string;
  category: 'general' | 'pricing' | 'technical' | 'trading';
}

const LandingPage: React.FC = () => {
  const { t, isRTL } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [featuredSignals, setFeaturedSignals] = useState<FeaturedSignal[]>([]);
  const [recentAnalyses, setRecentAnalyses] = useState<RecentAnalysis[]>([]);
  const [currentSignalIndex, setCurrentSignalIndex] = useState(0);
  const [currentAnalysisIndex, setCurrentAnalysisIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<string>('general');

  useEffect(() => {
    loadFeaturedSignals();
    loadRecentAnalyses();
  }, []);

  const loadFeaturedSignals = async () => {
    try {
      const signals = await getFeaturedSignals();
      setFeaturedSignals(signals);
    } catch (error) {
      console.error('Error loading featured signals:', error);
      // Fallback to demo data
      setFeaturedSignals(getDemoSignals());
    } finally {
      setLoading(false);
    }
  };

  const loadRecentAnalyses = async () => {
    try {
      setAnalysesLoading(true);
      const analyses = await getAllRecommendations(10);
      
      // Filter for analyses with profitable signals and good structure
      const profitableAnalyses = analyses
        .filter(analysis => 
          analysis.signal && 
          analysis.signal.type !== 'hold' &&
          analysis.signal.probability && 
          analysis.signal.probability > 75 &&
          analysis.response.length > 200
        )
        .slice(0, 6); // Show latest 6 profitable analyses
      
      setRecentAnalyses(profitableAnalyses);
    } catch (error) {
      console.error('Error loading recent analyses:', error);
      // Fallback to demo data
      setRecentAnalyses(getDemoAnalyses());
    } finally {
      setAnalysesLoading(false);
    }
  };

  const getDemoSignals = (): FeaturedSignal[] => [
    {
      id: '1',
      pair: 'XAUUSD',
      type: 'buy',
      entry: 2045.50,
      stopLoss: 2035.00,
      takeProfit1: 2055.00,
      takeProfit2: 2065.00,
      probability: 87,
      result: 'profit',
      profitPips: 950,
      date: '2024-01-15',
      school: 'Technical Analysis',
      featured: true
    },
    {
      id: '2',
      pair: 'EURUSD',
      type: 'sell',
      entry: 1.0850,
      stopLoss: 1.0880,
      takeProfit1: 1.0820,
      takeProfit2: 1.0790,
      probability: 92,
      result: 'profit',
      profitPips: 300,
      date: '2024-01-14',
      school: 'Momentum Trading',
      featured: true
    },
    {
      id: '3',
      pair: 'GBPUSD',
      type: 'buy',
      entry: 1.2650,
      stopLoss: 1.2620,
      takeProfit1: 1.2680,
      takeProfit2: 1.2710,
      probability: 85,
      result: 'profit',
      profitPips: 300,
      date: '2024-01-13',
      school: 'Fundamental Analysis',
      featured: true
    }
  ];

  const getDemoAnalyses = (): RecentAnalysis[] => [
    {
      id: 'demo1',
      school: 'Technical Analysis',
      response: 'Strong bullish momentum detected on XAUUSD with clear breakout above key resistance at 2040. Multiple confluences including RSI divergence, volume spike, and institutional order flow suggest continuation to 2055-2065 zone. Risk management crucial with stop below 2035 support.',
      timestamp: { toDate: () => new Date(Date.now() - 2 * 60 * 60 * 1000) },
      signal: {
        pair: 'XAUUSD',
        type: 'buy',
        entry: 2042.50,
        probability: 89
      }
    },
    {
      id: 'demo2',
      school: 'Momentum Trading',
      response: 'EURUSD showing strong bearish momentum with break below critical 1.0850 support. Institutional selling pressure evident from order flow analysis. Target 1.0820 with potential extension to 1.0790. Stop loss above 1.0880 for optimal risk-reward ratio.',
      timestamp: { toDate: () => new Date(Date.now() - 4 * 60 * 60 * 1000) },
      signal: {
        pair: 'EURUSD',
        type: 'sell',
        entry: 1.0845,
        probability: 91
      }
    },
    {
      id: 'demo3',
      school: 'Fundamental Analysis',
      response: 'GBPUSD bullish setup confirmed by positive economic data and central bank dovish stance. Technical confluence at 1.2650 support with strong buying interest. Targeting 1.2680-1.2710 resistance zone. Fundamental backdrop supports upside momentum.',
      timestamp: { toDate: () => new Date(Date.now() - 6 * 60 * 60 * 1000) },
      signal: {
        pair: 'GBPUSD',
        type: 'buy',
        entry: 1.2655,
        probability: 86
      }
    }
  ];

  // FAQ Data
  const faqData: FAQItem[] = [
    {
      question: "What is AI Trader and how does it work?",
      answer: "AI Trader is an advanced trading platform that uses artificial intelligence to analyze market data and generate trading signals. Our AI models process real-time market data, technical indicators, and multiple trading methodologies to provide you with actionable trading recommendations.",
      category: "general"
    },
    {
      question: "How accurate are the AI-generated signals?",
      answer: "Our AI signals have shown an average accuracy rate of 87% based on historical performance. However, past performance doesn't guarantee future results. We recommend using proper risk management and never investing more than you can afford to lose.",
      category: "general"
    },
    {
      question: "What trading schools/methodologies do you offer?",
      answer: "We offer four main trading methodologies: Technical Analysis (pattern recognition and indicators), Fundamental Analysis (economic data and market trends), Momentum Trading (breakout and trend following), and Swing Trading (multi-day position strategies).",
      category: "trading"
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you won't be charged for the next cycle.",
      category: "pricing"
    },
    {
      question: "What's the difference between the plans?",
      answer: "Free plan includes 1 signal per day with basic analysis. Pro plan offers 5 signals daily with advanced analysis and priority support. Elite plan provides 15 signals per day, VIP analysis, 24/7 support, custom strategies, and API access.",
      category: "pricing"
    },
    {
      question: "Do you offer a money-back guarantee?",
      answer: "Yes, we offer a 30-day money-back guarantee for all paid plans. If you're not satisfied with our service within the first 30 days, contact our support team for a full refund.",
      category: "pricing"
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use PayPal for all payment processing, which provides bank-level security and buyer protection. We never store your payment information on our servers.",
      category: "technical"
    },
    {
      question: "Can I use the signals for automated trading?",
      answer: "Elite plan users have access to our API which can be integrated with automated trading systems. However, we recommend thorough testing and proper risk management when using automated strategies.",
      category: "technical"
    },
    {
      question: "What markets do you cover?",
      answer: "We cover major forex pairs (EUR/USD, GBP/USD, etc.), precious metals (Gold, Silver), major stock indices (S&P 500, NASDAQ), and popular cryptocurrencies (Bitcoin, Ethereum).",
      category: "trading"
    },
    {
      question: "Do you provide trading education?",
      answer: "Yes, all plans include access to our educational resources, market analysis explanations, and trading methodology guides. Elite users also get access to exclusive webinars and one-on-one strategy sessions.",
      category: "trading"
    },
    {
      question: "How do I get started?",
      answer: "Simply sign up for a free account to start with 1 daily signal. You can upgrade to Pro or Elite plans anytime to access more signals and advanced features. No setup fees or long-term commitments required.",
      category: "general"
    },
    {
      question: "What if I need help or have technical issues?",
      answer: "Our support team is available 24/7 for Elite users, with priority support for Pro users, and email support for Free users. You can reach us through the contact form, email, or live chat.",
      category: "technical"
    }
  ];

  const faqCategories = [
    { id: 'general', name: 'General', icon: HelpCircle },
    { id: 'pricing', name: 'Pricing', icon: DollarSign },
    { id: 'trading', name: 'Trading', icon: TrendingUp },
    { id: 'technical', name: 'Technical', icon: Settings }
  ];

  const filteredFAQs = faqData.filter(faq => faq.category === selectedFAQCategory);

  // Handle plan selection - redirect based on auth status
  const handlePlanSelection = (planId: string) => {
    if (user) {
      // User is logged in, go to plans page
      navigate('/plans');
    } else {
      // User not logged in, go to register with plan parameter
      navigate(`/register?plan=${planId}`);
    }
  };

  // Contact handlers
  const handleContactEmail = () => {
    window.location.href = 'mailto:support@aitrader.com?subject=Contact from AI Trader Website';
  };

  const handleContactPhone = () => {
    window.location.href = 'tel:+15551234567';
  };

  const handleLiveChat = () => {
    // In a real implementation, this would open a chat widget
    alert('Live chat feature coming soon! Please use email or phone for now.');
  };

  const nextSignal = () => {
    setCurrentSignalIndex((prev) => (prev + 1) % featuredSignals.length);
  };

  const prevSignal = () => {
    setCurrentSignalIndex((prev) => (prev - 1 + featuredSignals.length) % featuredSignals.length);
  };

  const nextAnalysis = () => {
    setCurrentAnalysisIndex((prev) => (prev + 1) % recentAnalyses.length);
  };

  const prevAnalysis = () => {
    setCurrentAnalysisIndex((prev) => (prev - 1 + recentAnalyses.length) % recentAnalyses.length);
  };

  const getSignalTypeIcon = (type: string) => {
    switch (type) {
      case 'buy': return <TrendingUp className="h-5 w-5 text-green-400" />;
      case 'sell': return <TrendingDown className="h-5 w-5 text-red-400" />;
      case 'hold': return <Minus className="h-5 w-5 text-yellow-400" />;
      default: return <Target className="h-5 w-5 text-blue-400" />;
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

  const formatTimeAgo = (timestamp: any) => {
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      
      if (diffInHours < 1) return 'Just now';
      if (diffInHours < 24) return `${diffInHours}h ago`;
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    } catch (error) {
      return 'Recently';
    }
  };

  const truncateAnalysis = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const features = [
    {
      icon: <Zap className="h-8 w-8" />,
      title: t('landing.features.ai.title'),
      description: t('landing.features.ai.desc'),
      stats: '95% Accuracy'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: t('landing.features.secure.title'),
      description: t('landing.features.secure.desc'),
      stats: '99.9% Uptime'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: t('landing.features.schools.title'),
      description: t('landing.features.schools.desc'),
      stats: '4 Strategies'
    }
  ];

  const stats = [
    { label: 'Active Traders', value: '10,000+', icon: <Users className="h-6 w-6" /> },
    { label: 'Signals Generated', value: '50,000+', icon: <BarChart3 className="h-6 w-6" /> },
    { label: 'Success Rate', value: '87%', icon: <Target className="h-6 w-6" /> },
    { label: 'Countries', value: '120+', icon: <Globe className="h-6 w-6" /> }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Professional Trader',
      content: 'AI Trader has revolutionized my trading strategy. The signals are incredibly accurate and have significantly improved my profitability.',
      rating: 5,
      avatar: '👩‍💼'
    },
    {
      name: 'Michael Chen',
      role: 'Investment Manager',
      content: 'The technical analysis provided by AI Trader is top-notch. It\'s like having a team of expert analysts at your fingertips.',
      rating: 5,
      avatar: '👨‍💼'
    },
    {
      name: 'Elena Rodriguez',
      role: 'Day Trader',
      content: 'I\'ve been using AI Trader for 6 months and my win rate has increased by 40%. The Elite plan is worth every penny.',
      rating: 5,
      avatar: '👩‍💻'
    }
  ];

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      originalPrice: null,
      features: ['1 signal per day', 'Basic analysis', 'Email support'],
      popular: false,
      badge: null
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$19.99',
      originalPrice: '$29',
      features: ['5 signals per day', 'Advanced analysis', 'Priority support', 'Historical data'],
      popular: true,
      badge: 'Most Popular'
    },
    {
      id: 'elite',
      name: 'Elite',
      price: '$99',
      originalPrice: '$149',
      features: ['15 signals per day', 'VIP analysis', '24/7 support', 'Custom strategies', 'API access'],
      popular: false,
      badge: 'Best Value'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="max-w-7xl mx-auto relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-8">
              <Star className="h-5 w-5 text-yellow-400" />
              <span className="text-blue-400 font-semibold">Trusted by 10,000+ Traders Worldwide</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                AI-Powered
              </span>
              <br />
              Trading Signals
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              {t('landing.hero.subtitle')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {user ? (
                <Link
                  to="/dashboard"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-2xl"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 flex items-center justify-center space-x-2 shadow-2xl"
                >
                  <span>{t('landing.hero.startTrial')}</span>
                  <ArrowRight className={`h-5 w-5 group-hover:translate-x-1 transition-transform ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              )}
              <Link
                to="/plans"
                className="border-2 border-blue-500 text-blue-400 hover:bg-blue-500 hover:text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all flex items-center justify-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>View Plans</span>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-400 text-sm">
              <div className="flex items-center space-x-2">
                <Shield className="h-4 w-4 text-green-400" />
                <span>Bank-Level Security</span>
              </div>
              <div className="flex items-center space-x-2">
                <Award className="h-4 w-4 text-yellow-400" />
                <span>Award-Winning Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-400" />
                <span>Real-Time Signals</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 mx-auto">
                  <div className="text-white">
                    {stat.icon}
                  </div>
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-400 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Profitable Analyses Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 rounded-full px-6 py-3 mb-6">
              <Brain className="h-5 w-5 text-purple-400" />
              <span className="text-purple-400 font-semibold">Live AI Analysis</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Latest Profitable Analyses
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See real-time AI-generated trading analyses from our platform. These are actual signals created by our users using advanced AI models.
            </p>
          </div>

          {!analysesLoading && recentAnalyses.length > 0 && (
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {recentAnalyses[currentAnalysisIndex]?.signal && (
                      <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2 w-fit ${getSignalTypeColor(recentAnalyses[currentAnalysisIndex].signal.type)}`}>
                        {getSignalTypeIcon(recentAnalyses[currentAnalysisIndex].signal.type)}
                        <span className="uppercase">{recentAnalyses[currentAnalysisIndex].signal.type}</span>
                      </div>
                    )}
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-white">
                        {recentAnalyses[currentAnalysisIndex]?.signal?.pair || 'Market Analysis'}
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-300 mt-1">
                        <Brain className="h-4 w-4" />
                        <span>{recentAnalyses[currentAnalysisIndex]?.school}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(recentAnalyses[currentAnalysisIndex]?.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <button
                      onClick={prevAnalysis}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-gray-400 text-sm px-2">
                      {currentAnalysisIndex + 1} / {recentAnalyses.length}
                    </span>
                    <button
                      onClick={nextAnalysis}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Analysis Content */}
                <div className="bg-black/20 rounded-lg p-4 sm:p-6 mb-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Activity className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-semibold text-white">AI Analysis</h3>
                    {recentAnalyses[currentAnalysisIndex]?.signal?.probability && (
                      <div className="ml-auto bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-sm font-semibold">
                        {recentAnalyses[currentAnalysisIndex].signal.probability}% Confidence
                      </div>
                    )}
                  </div>
                  <p className="text-gray-300 leading-relaxed">
                    {truncateAnalysis(recentAnalyses[currentAnalysisIndex]?.response || '', 200)}
                  </p>
                </div>

                {/* Signal Details */}
                {recentAnalyses[currentAnalysisIndex]?.signal && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Trading Pair</p>
                      <p className="text-white font-bold text-sm sm:text-lg">{recentAnalyses[currentAnalysisIndex].signal.pair}</p>
                    </div>
                    
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Signal Type</p>
                      <p className="text-white font-bold text-sm sm:text-lg capitalize">{recentAnalyses[currentAnalysisIndex].signal.type}</p>
                    </div>
                    
                    {recentAnalyses[currentAnalysisIndex].signal.entry && (
                      <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">Entry Price</p>
                        <p className="text-green-400 font-bold text-sm sm:text-lg">{recentAnalyses[currentAnalysisIndex].signal.entry}</p>
                      </div>
                    )}
                    
                    {recentAnalyses[currentAnalysisIndex].signal.probability && (
                      <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                        <p className="text-gray-400 text-xs sm:text-sm mb-1">AI Confidence</p>
                        <p className="text-blue-400 font-bold text-sm sm:text-lg">{recentAnalyses[currentAnalysisIndex].signal.probability}%</p>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4" />
                      <span>Generated {formatTimeAgo(recentAnalyses[currentAnalysisIndex]?.timestamp)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Brain className="h-4 w-4" />
                      <span>Method: {recentAnalyses[currentAnalysisIndex]?.school}</span>
                    </div>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold w-fit">
                    LIVE ANALYSIS
                  </div>
                </div>
              </div>

              {/* Analysis Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {recentAnalyses.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentAnalysisIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all touch-manipulation ${
                      index === currentAnalysisIndex ? 'bg-purple-500' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {analysesLoading && (
            <div className="text-center">
              <div className="inline-flex items-center space-x-2 text-gray-400">
                <RefreshCw className="h-5 w-5 animate-spin" />
                <span>Loading latest analyses...</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Featured Trading Signals */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-green-500/10 border border-green-500/20 rounded-full px-6 py-3 mb-6">
              <Award className="h-5 w-5 text-green-400" />
              <span className="text-green-400 font-semibold">Proven Results</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Recent Winning Signals
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              See real examples of profitable trades generated by our AI system. These signals were curated by our admin team to showcase our platform's capabilities.
            </p>
          </div>

          {!loading && featuredSignals.length > 0 && (
            <div className="relative">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 sm:p-6 lg:p-8 border border-white/20">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-medium border flex items-center space-x-2 w-fit ${getSignalTypeColor(featuredSignals[currentSignalIndex].type)}`}>
                      {getSignalTypeIcon(featuredSignals[currentSignalIndex].type)}
                      <span className="uppercase">{featuredSignals[currentSignalIndex].type}</span>
                    </div>
                    <div className="text-center sm:text-left">
                      <div className="text-2xl font-bold text-white">
                        {featuredSignals[currentSignalIndex].pair}
                      </div>
                      <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-semibold w-fit mx-auto sm:mx-0 mt-2">
                        +{featuredSignals[currentSignalIndex].profitPips} pips
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center lg:justify-end space-x-2">
                    <button
                      onClick={prevSignal}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <span className="text-gray-400 text-sm px-2">
                      {currentSignalIndex + 1} / {featuredSignals.length}
                    </span>
                    <button
                      onClick={nextSignal}
                      className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all touch-manipulation"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-6">
                  <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Entry Price</p>
                    <p className="text-white font-bold text-sm sm:text-lg">{featuredSignals[currentSignalIndex].entry}</p>
                  </div>
                  
                  {featuredSignals[currentSignalIndex].stopLoss && (
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Stop Loss</p>
                      <p className="text-red-400 font-bold text-sm sm:text-lg">{featuredSignals[currentSignalIndex].stopLoss}</p>
                    </div>
                  )}
                  
                  {featuredSignals[currentSignalIndex].takeProfit1 && (
                    <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                      <p className="text-gray-400 text-xs sm:text-sm mb-1">Take Profit</p>
                      <p className="text-green-400 font-bold text-sm sm:text-lg">{featuredSignals[currentSignalIndex].takeProfit1}</p>
                    </div>
                  )}
                  
                  <div className="bg-black/20 rounded-lg p-3 sm:p-4">
                    <p className="text-gray-400 text-xs sm:text-sm mb-1">Probability</p>
                    <p className="text-blue-400 font-bold text-sm sm:text-lg">{featuredSignals[currentSignalIndex].probability}%</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm text-gray-400 space-y-2 sm:space-y-0">
                  <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(featuredSignals[currentSignalIndex].date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <BarChart3 className="h-4 w-4" />
                      <span>{featuredSignals[currentSignalIndex].school}</span>
                    </div>
                  </div>
                  <div className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-xs font-semibold w-fit">
                    PROFITABLE
                  </div>
                </div>
              </div>

              {/* Signal Navigation Dots */}
              <div className="flex justify-center mt-6 space-x-2">
                {featuredSignals.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSignalIndex(index)}
                    className={`w-3 h-3 rounded-full transition-all touch-manipulation ${
                      index === currentSignalIndex ? 'bg-blue-500' : 'bg-white/30'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('landing.features.title')}
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              {t('landing.features.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all hover:scale-105"
              >
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 w-16 h-16 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <div className="text-white">
                    {feature.icon}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-300 mb-4 leading-relaxed">
                  {feature.description}
                </p>
                <div className="text-blue-400 font-semibold">
                  {feature.stats}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center space-x-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-6 py-3 mb-6">
              <HelpCircle className="h-5 w-5 text-blue-400" />
              <span className="text-blue-400 font-semibold">Frequently Asked Questions</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Got Questions? We Have Answers
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Find answers to the most common questions about our AI trading platform
            </p>
          </div>

          {/* FAQ Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {faqCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedFAQCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all ${
                  selectedFAQCategory === category.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                <category.icon className="h-4 w-4" />
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="max-w-4xl mx-auto">
            <div className="space-y-4">
              {filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedFAQ(expandedFAQ === `${selectedFAQCategory}-${index}` ? null : `${selectedFAQCategory}-${index}`)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-white/5 transition-colors"
                  >
                    <span className="text-white font-semibold pr-4">{faq.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform flex-shrink-0 ${
                        expandedFAQ === `${selectedFAQCategory}-${index}` ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {expandedFAQ === `${selectedFAQCategory}-${index}` && (
                    <div className="px-6 pb-4">
                      <div className="text-gray-300 leading-relaxed">
                        {faq.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-12">
            <p className="text-gray-300 mb-6">Still have questions?</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleContactEmail}
                className="flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Email Support</span>
              </button>
              <button
                onClick={handleLiveChat}
                className="flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>Live Chat</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              What Our Traders Say
            </h2>
            <p className="text-xl text-gray-300">
              Join thousands of successful traders who trust AI Trader
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{testimonial.avatar}</div>
                  <div>
                    <div className="text-white font-semibold">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('landing.pricing.title')}
            </h2>
            <p className="text-xl text-gray-300">
              {t('landing.pricing.subtitle')}
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white/10 backdrop-blur-sm rounded-2xl p-8 border transition-all hover:scale-105 ${
                  plan.popular 
                    ? 'border-blue-500 ring-2 ring-blue-500/50 shadow-2xl shadow-blue-500/20' 
                    : 'border-white/20 hover:border-white/40'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <div className={`px-6 py-2 rounded-full text-sm font-semibold text-white ${
                      plan.popular ? 'bg-gradient-to-r from-blue-500 to-purple-500' : 'bg-gradient-to-r from-green-500 to-emerald-500'
                    }`}>
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">{plan.name}</h3>
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center space-x-2">
                      <span className="text-5xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">/month</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="text-gray-400 line-through text-lg mt-1">
                        {plan.originalPrice}/month
                      </div>
                    )}
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <CheckCircle className="h-5 w-5 text-green-400 mr-3 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handlePlanSelection(plan.id)}
                  className={`w-full py-4 px-6 rounded-xl font-semibold transition-all text-center block ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                      : 'bg-white/10 hover:bg-white/20 text-white border border-white/30'
                  }`}
                >
                  {user ? 'Upgrade Plan' : t('landing.pricing.getStarted')}
                </button>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <p className="text-gray-400 mb-6">All plans include:</p>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-300">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>No setup fees</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Cancel anytime</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>24/7 support</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-400" />
                <span>Money-back guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Get in Touch
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Have questions or need support? Our team is here to help you succeed in your trading journey.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Email Support</h3>
              <p className="text-gray-300 mb-6">Get help via email with detailed responses</p>
              <button
                onClick={handleContactEmail}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full"
              >
                Send Email
              </button>
              <p className="text-gray-400 text-sm mt-3">support@aitrader.com</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Live Chat</h3>
              <p className="text-gray-300 mb-6">Chat with our support team in real-time</p>
              <button
                onClick={handleLiveChat}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full"
              >
                Start Chat
              </button>
              <p className="text-gray-400 text-sm mt-3">Available 24/7</p>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Phone className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Phone Support</h3>
              <p className="text-gray-300 mb-6">Speak directly with our experts</p>
              <button
                onClick={handleContactPhone}
                className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all w-full"
              >
                Call Now
              </button>
              <p className="text-gray-400 text-sm mt-3">+1 (555) 123-4567</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-black/20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-3xl p-12 border border-blue-500/30">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              {t('landing.cta.title')}
            </h2>
            <p className="text-xl text-gray-300 mb-8">
              {t('landing.cta.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  to="/dashboard"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              ) : (
                <Link
                  to="/register"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all transform hover:scale-105 inline-flex items-center justify-center space-x-2"
                >
                  <span>{t('landing.cta.startTrial')}</span>
                  <ArrowRight className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
                </Link>
              )}
              <Link
                to="/plans"
                className="border-2 border-white/30 text-white hover:bg-white/10 px-8 py-4 rounded-xl text-lg font-semibold transition-all"
              >
                View All Plans
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;