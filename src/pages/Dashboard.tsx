import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useLanguage } from '../contexts/LanguageContext';
import { getSchools, saveRecommendation, incrementUserUsage } from '../services/firestore';
import { doc, getDoc } from 'firebase/firestore';
import { generateTradingSignalWithRealData } from '../services/gpt';
import { fetchMultiTimeframeData, generateMockMultiTimeframeData, TRADING_PAIRS, testApiConnection } from '../services/marketData';
import { sendTelegramMessage, formatSignalForTelegram } from '../services/telegram';
import { db } from '../config/firebase';
import { School } from '../types';
import AnalysisDisplay from '../components/AnalysisDisplay';
import { 
  TrendingUp, 
  Zap, 
  AlertCircle, 
  BarChart3, 
  Crown, 
  Clock, 
  Settings,
  RefreshCw,
  Activity,
  Target,
  DollarSign,
  TrendingDown,
  Minus,
  ChevronDown,
  Globe,
  Loader,
  Wifi,
  WifiOff,
  CheckCircle,
  XCircle
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t, isRTL } = useLanguage();
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedPair, setSelectedPair] = useState('XAUUSD');
  const [candleCount, setCandleCount] = useState(50);
  const [aiProvider, setAiProvider] = useState<'openrouter' | 'gemini'>('openrouter');
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(false);
  const [lastRecommendation, setLastRecommendation] = useState<string>('');
  const [lastSignal, setLastSignal] = useState<any>(null);
  const [error, setError] = useState('');
  const [marketData, setMarketData] = useState<any>(null);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [apiStatus, setApiStatus] = useState<'unknown' | 'connected' | 'error'>('unknown');
  const [telegramConfig, setTelegramConfig] = useState<any>(null);

  useEffect(() => {
    loadSchools();
    checkApiConnection();
    if (user?.plan === 'elite') {
      loadTelegramConfig();
    }
  }, [user]);

  const loadSchools = async () => {
    try {
      const schoolsData = await getSchools();
      setSchools(schoolsData);
      if (schoolsData.length > 0 && !selectedSchool) {
        setSelectedSchool(schoolsData[0].id);
      }
    } catch (error) {
      console.error('Error loading schools:', error);
    }
  };

  const loadTelegramConfig = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.telegram && userData.telegram.enabled) {
          setTelegramConfig({
            botToken: userData.telegram.botToken,
            chatId: userData.telegram.chatId
          });
        }
      }
    } catch (error) {
      console.error('Error loading Telegram config:', error);
    }
  };

  const checkApiConnection = async () => {
    try {
      const isConnected = await testApiConnection();
      setApiStatus(isConnected ? 'connected' : 'error');
    } catch (error) {
      setApiStatus('error');
    }
  };

  const fetchMarketData = async () => {
    setDataLoading(true);
    setError('');
    
    try {
      console.log(`Fetching market data for ${selectedPair}...`);
      const data = await fetchMultiTimeframeData(selectedPair, candleCount);
      setMarketData(data);
      setError('');
      setApiStatus('connected');
    } catch (error: any) {
      console.error('Error fetching market data:', error);
      setApiStatus('error');
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (errorMessage.includes('API key')) {
        errorMessage = t('error.apiNotConfigured');
      } else if (errorMessage.includes('rate limit')) {
        errorMessage = t('error.rateLimitReached');
      } else if (errorMessage.includes('symbol')) {
        errorMessage = t('error.symbolNotFound');
      } else {
        errorMessage = t('error.marketDataUnavailable');
      }
      
      // Fallback to mock data
      console.log('Falling back to demo data...');
      const mockData = generateMockMultiTimeframeData(selectedPair);
      setMarketData(mockData);
      setError(errorMessage);
    } finally {
      setDataLoading(false);
    }
  };

  const generateSignal = async () => {
    if (!user || !selectedSchool) return;

    if (user.used_today >= user.recommendation_limit) {
      setError(t('signal.dailyLimitReached'));
      return;
    }

    // Fetch fresh market data if not available
    if (!marketData) {
      await fetchMarketData();
      return;
    }

    setLoading(true);
    setError('');

    try {
      const school = schools.find(s => s.id === selectedSchool);
      if (!school) throw new Error('Selected school not found');

      console.log('Generating signal with market data...');
      
      const result = await generateTradingSignalWithRealData({
        symbol: selectedPair,
        marketData,
        schoolPrompt: school.prompt,
        provider: aiProvider
      });

      // Save recommendation with structured signal data
      await saveRecommendation({
        userId: user.uid,
        school: school.name,
        prompt: school.prompt,
        response: result.analysis,
        candlestick_data: marketData,
        timestamp: new Date().toISOString(),
        signal: result.signal
      });

      // Update user usage
      await incrementUserUsage(user.uid);
      
      setLastRecommendation(result.analysis);
      setLastSignal(result.signal);
    } catch (error: any) {
      console.error('Error generating signal:', error);
      setError(error.message || 'Failed to generate signal');
    } finally {
      setLoading(false);
    }
  };

  const handleSendToTelegram = async (message: string) => {
    if (!telegramConfig || !user || user.plan !== 'elite') {
      throw new Error('Telegram not configured or not available for your plan');
    }

    try {
      await sendTelegramMessage(telegramConfig, message);
    } catch (error: any) {
      throw new Error(`Failed to send to Telegram: ${error.message}`);
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'free': return 'text-gray-400';
      case 'pro': return 'text-blue-400';
      case 'elite': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'elite': return <Crown className="h-5 w-5" />;
      default: return <Zap className="h-5 w-5" />;
    }
  };

  const getApiStatusIcon = () => {
    switch (apiStatus) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-400" />;
      case 'error':
        return <WifiOff className="h-4 w-4 text-red-400" />;
      default:
        return <Loader className="h-4 w-4 text-gray-400 animate-spin" />;
    }
  };

  const getApiStatusText = () => {
    switch (apiStatus) {
      case 'connected':
        return t('api.connected');
      case 'error':
        return t('api.disconnected');
      default:
        return t('api.checking');
    }
  };

  const selectedPairInfo = TRADING_PAIRS.find(p => p.symbol === selectedPair);

  if (!user) return null;

  return (
    <div className="min-h-screen py-4 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
            {t('dashboard.title')}
          </h1>
          <p className="text-gray-300 text-sm sm:text-base">
            {t('dashboard.subtitle')}
          </p>
        </div>

        {/* API Status Banner */}
        <div className="mb-4 sm:mb-6">
          <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg border text-sm ${
            apiStatus === 'connected' 
              ? 'bg-green-500/10 border-green-500/20 text-green-400'
              : apiStatus === 'error'
              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
              : 'bg-gray-500/10 border-gray-500/20 text-gray-400'
          }`}>
            {getApiStatusIcon()}
            <span className="font-medium">{getApiStatusText()}</span>
            {apiStatus === 'error' && (
              <span className="text-xs">• {t('api.demoDataUsed')}</span>
            )}
            <button
              onClick={checkApiConnection}
              className="ml-auto text-xs hover:underline"
            >
              {t('api.retry')}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Stats Cards */}
          <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{t('dashboard.currentPlan')}</p>
                  <div className={`flex items-center space-x-2 ${getPlanColor(user.plan)}`}>
                    {getPlanIcon(user.plan)}
                    <span className="text-lg sm:text-xl font-bold capitalize">{user.plan}</span>
                  </div>
                </div>
                <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{t('dashboard.signalsToday')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {user.used_today} / {user.recommendation_limit}
                  </p>
                </div>
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-300 text-sm">{t('dashboard.remaining')}</p>
                  <p className="text-lg sm:text-2xl font-bold text-white">
                    {user.recommendation_limit - user.used_today}
                  </p>
                </div>
                <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Signal Generator */}
          <div className="lg:col-span-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-white/20">
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-4 sm:mb-6 flex items-center space-x-2">
                <Activity className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                <span>{t('signal.title')}</span>
              </h2>

              <div className="space-y-4 sm:space-y-6">
                {/* Trading Pair Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('signal.tradingPair')}
                  </label>
                  <select
                    value={selectedPair}
                    onChange={(e) => {
                      setSelectedPair(e.target.value);
                      setMarketData(null);
                    }}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {TRADING_PAIRS.map((pair) => (
                      <option key={pair.symbol} value={pair.symbol} className="bg-gray-800">
                        {pair.name} ({pair.symbol}) - {pair.category}
                      </option>
                    ))}
                  </select>
                  {selectedPairInfo && (
                    <p className="text-xs text-gray-400 mt-1">
                      Category: {selectedPairInfo.category}
                    </p>
                  )}
                </div>

                {/* Trading School Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    {t('signal.tradingSchool')}
                  </label>
                  <select
                    value={selectedSchool}
                    onChange={(e) => setSelectedSchool(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                  >
                    {schools.map((school) => (
                      <option key={school.id} value={school.id} className="bg-gray-800">
                        {school.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Advanced Settings */}
                <div>
                  <button
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors text-sm sm:text-base"
                  >
                    <Settings className="h-4 w-4" />
                    <span>{t('signal.advancedSettings')}</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showAdvanced && (
                    <div className="mt-4 p-4 bg-black/20 rounded-lg space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('signal.candleCount')}
                          </label>
                          <select
                            value={candleCount}
                            onChange={(e) => setCandleCount(Number(e.target.value))}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value={30} className="bg-gray-800">30 Candles</option>
                            <option value={50} className="bg-gray-800">50 Candles</option>
                            <option value={100} className="bg-gray-800">100 Candles</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            {t('signal.aiProvider')}
                          </label>
                          <select
                            value={aiProvider}
                            onChange={(e) => setAiProvider(e.target.value as 'openrouter' | 'gemini')}
                            className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="openrouter" className="bg-gray-800">OpenRouter (GPT-4)</option>
                            <option value="gemini" className="bg-gray-800">Google Gemini</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Market Data Status */}
                {marketData && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-400" />
                        <span className="text-green-400 font-medium">{t('signal.marketDataReady')}</span>
                        {apiStatus === 'error' && (
                          <span className="text-yellow-400 text-xs">({t('signal.demoData')})</span>
                        )}
                      </div>
                      <button
                        onClick={fetchMarketData}
                        disabled={dataLoading}
                        className="text-green-400 hover:text-green-300 p-1 rounded transition-colors"
                      >
                        <RefreshCw className={`h-4 w-4 ${dataLoading ? 'animate-spin' : ''}`} />
                      </button>
                    </div>
                    <p className="text-green-300 text-sm mt-1">
                      {selectedPair} • {candleCount} candles • 4 timeframes
                    </p>
                  </div>
                )}

                {error && (
                  <div className="bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 px-4 py-3 rounded-lg flex items-start space-x-2">
                    <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">Notice</p>
                      <p className="text-sm">{error}</p>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {!marketData && (
                    <button
                      onClick={fetchMarketData}
                      disabled={dataLoading}
                      className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                    >
                      {dataLoading ? (
                        <>
                          <Loader className="h-5 w-5 animate-spin" />
                          <span>{t('signal.fetchingData')}</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-5 w-5" />
                          <span>1. {t('signal.fetchMarketData')}</span>
                        </>
                      )}
                    </button>
                  )}

                  <button
                    onClick={generateSignal}
                    disabled={loading || !marketData || user.used_today >= user.recommendation_limit}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 sm:py-4 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-sm sm:text-base"
                  >
                    {loading ? (
                      <>
                        <Loader className="h-5 w-5 animate-spin" />
                        <span>{t('signal.analyzingMarket')}</span>
                      </>
                    ) : (
                      <>
                        <Zap className="h-5 w-5" />
                        <span>{marketData ? '2. ' : ''}{t('signal.generateSignal')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Upgrade Prompt */}
            <div className="bg-gradient-to-br from-blue-600/20 to-purple-600/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-blue-500/30">
              <h3 className="text-lg sm:text-xl font-bold text-white mb-3">
                {t('dashboard.needMoreSignals')}
              </h3>
              <p className="text-gray-300 mb-4 text-sm">
                {t('dashboard.upgradeDesc')}
              </p>
              <a
                href="/plans"
                className="inline-block bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all text-sm sm:text-base"
              >
                {t('dashboard.viewPlans')}
              </a>
            </div>

            {/* Quick Stats */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                Quick Stats
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('stats.accountType')}:</span>
                  <span className={`font-semibold capitalize ${getPlanColor(user.plan)}`}>
                    {user.plan}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('stats.dailyLimit')}:</span>
                  <span className="text-white font-semibold">
                    {user.recommendation_limit}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('stats.usedToday')}:</span>
                  <span className="text-white font-semibold">
                    {user.used_today}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('stats.selectedPair')}:</span>
                  <span className="text-white font-semibold">
                    {selectedPair}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-300">{t('stats.dataSource')}:</span>
                  <span className={`font-semibold ${apiStatus === 'connected' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {apiStatus === 'connected' ? t('stats.live') : t('stats.demo')}
                  </span>
                </div>
                {user.plan === 'elite' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">Telegram:</span>
                    <span className={`font-semibold ${telegramConfig ? 'text-green-400' : 'text-gray-400'}`}>
                      {telegramConfig ? 'Configured' : 'Not Set'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Market Data Info */}
            {marketData && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-white/20">
                <h3 className="text-lg font-semibold text-white mb-3">
                  Market Data
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('market.symbol')}:</span>
                    <span className="text-white font-semibold">{marketData.symbol}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('market.candles5min')}:</span>
                    <span className="text-white">{marketData.timeframes['5min']?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('market.candles15min')}:</span>
                    <span className="text-white">{marketData.timeframes['15min']?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('market.candles1h')}:</span>
                    <span className="text-white">{marketData.timeframes['1h']?.length || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-300">{t('market.candles4h')}:</span>
                    <span className="text-white">{marketData.timeframes['4h']?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Analysis Display */}
        {(lastRecommendation || lastSignal) && (
          <div className="mt-8">
            <AnalysisDisplay
              analysis={lastRecommendation}
              signal={lastSignal}
              school={schools.find(s => s.id === selectedSchool)?.name || 'Unknown'}
              timestamp={new Date()}
              onSendToTelegram={user?.plan === 'elite' && telegramConfig ? handleSendToTelegram : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;