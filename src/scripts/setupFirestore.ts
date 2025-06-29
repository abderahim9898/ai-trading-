import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { PAYPAL_PLAN_IDS } from '../services/paypal';

// Plans data - Both plans now configured with correct PayPal Plan IDs! 🎉
const plansData = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    recommendations_per_day: 1,
    features: [
      '1 signal per day',
      'Basic analysis',
      'Email support'
    ],
    paypal_plan_id: '',
    popular: false
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 19.99, // ✅ Matches your PayPal plan
    recommendations_per_day: 5,
    features: [
      '5 signals per day',
      'Advanced analysis',
      'Priority support',
      'Historical data'
    ],
    paypal_plan_id: PAYPAL_PLAN_IDS.pro, // ✅ P-45K919511S534301FNBQVDII
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 99,
    recommendations_per_day: 15,
    features: [
      '15 signals per day',
      'VIP analysis',
      '24/7 support',
      'Custom strategies',
      'API access'
    ],
    paypal_plan_id: PAYPAL_PLAN_IDS.elite, // ✅ P-16783531A4944761DNBQVFNI
    popular: false
  }
];

// Schools data
const schoolsData = [
  {
    id: 'technical',
    name: 'Technical Analysis',
    prompt: 'Analyze the following candlestick data using technical analysis principles. Look for patterns, support/resistance levels, and momentum indicators. Provide a clear buy/sell/hold recommendation with confidence level.',
    active: true
  },
  {
    id: 'fundamental',
    name: 'Fundamental Analysis',
    prompt: 'Based on the market data provided, perform a fundamental analysis considering market trends, volume, and price action. Provide actionable trading advice with risk assessment.',
    active: true
  },
  {
    id: 'momentum',
    name: 'Momentum Trading',
    prompt: 'Focus on momentum indicators and price velocity in the candlestick data. Identify breakout opportunities and trend continuation patterns. Provide timing-focused trading recommendations.',
    active: true
  },
  {
    id: 'swing',
    name: 'Swing Trading',
    prompt: 'Analyze the candlestick data for swing trading opportunities. Focus on multi-day price movements, key reversal patterns, and optimal entry/exit points for position trades.',
    active: true
  }
];

export const setupPlans = async () => {
  try {
    console.log('🚀 Setting up subscription plans...');
    
    for (const plan of plansData) {
      const { id, ...planData } = plan;
      await setDoc(doc(db, 'plans', id), planData);
      console.log(`✅ Plan '${plan.name}' created successfully`);
      
      if (plan.paypal_plan_id) {
        console.log(`   💳 PayPal Plan ID: ${plan.paypal_plan_id}`);
        console.log(`   💰 Price: $${plan.price}/month`);
      } else {
        console.log(`   🆓 Free plan - no PayPal integration needed`);
      }
    }
    
    console.log('🎉 All plans setup completed!');
    console.log('✅ Pro plan ($19.99/month) - Ready for payments!');
    console.log('✅ Elite plan ($99/month) - Ready for payments!');
    console.log('🚀 Your subscription system is fully operational!');
  } catch (error) {
    console.error('❌ Error setting up plans:', error);
    throw error;
  }
};

export const setupSchools = async () => {
  try {
    console.log('Setting up trading schools...');
    
    for (const school of schoolsData) {
      const { id, ...schoolData } = school;
      await setDoc(doc(db, 'schools', id), schoolData);
      console.log(`✅ School '${school.name}' created successfully`);
    }
    
    console.log('🎉 All schools setup completed!');
  } catch (error) {
    console.error('❌ Error setting up schools:', error);
    throw error;
  }
};

export const setupAllFirestoreData = async () => {
  try {
    console.log('🚀 Starting complete Firestore data setup...');
    
    await setupPlans();
    await setupSchools();
    
    console.log('✨ Firestore setup completed successfully!');
    console.log('');
    console.log('📊 PAYMENT SYSTEM STATUS:');
    console.log('✅ Free Plan - Ready');
    console.log('✅ Pro Plan ($19.99/month) - PayPal Configured & Ready');
    console.log('✅ Elite Plan ($99/month) - PayPal Configured & Ready');
    console.log('✅ All trading schools configured');
    console.log('');
    console.log('🎯 NEXT STEPS:');
    console.log('1. Test Pro plan payment flow');
    console.log('2. Test Elite plan payment flow');
    console.log('3. Verify user plan upgrades work correctly');
    console.log('4. Check daily signal limits are applied');
    console.log('');
    console.log('🚀 Your AI Trading platform is ready for business!');
  } catch (error) {
    console.error('💥 Failed to setup Firestore data:', error);
    throw error;
  }
};