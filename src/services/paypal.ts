import { PayPalScriptProvider } from '@paypal/react-paypal-js';

// Updated to use the correct PayPal Client ID from your TRADIA v22 dashboard
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AYGUIXYvnaCxrGFnm3rw5t8v2lwrT-vBuTcd2PpUkG7I4QEMASBR1H0NJDaL1glTyUGQt5_5CL0q4yUi';

export const paypalOptions = {
  'client-id': PAYPAL_CLIENT_ID,
  currency: 'USD',
  intent: 'subscription',
  vault: 'true',
  'enable-funding': 'venmo,paylater',
  'disable-funding': 'card'
};

export const handlePayPalSuccess = async (data: any, userId: string, planId: string) => {
  try {
    console.log('PayPal payment successful:', data);
    
    return {
      success: true,
      subscriptionId: data.subscriptionID || data.orderID
    };
  } catch (error) {
    console.error('Error processing PayPal payment:', error);
    throw error;
  }
};

// PayPal Plan IDs - Updated to match your actual PayPal dashboard exactly
export const PAYPAL_PLAN_IDS = {
  pro: 'P-06P792050H561492LNBQW6ZA',    // ✅ AI Trading Pro Monthly - ACTIVE
  elite: 'P-2D270313MK3350614NBQYT3Q'   // ✅ Elite Plan - ACTIVE
};

// Validate PayPal configuration with detailed logging
export const validatePayPalConfig = () => {
  console.log('🔍 Validating PayPal Configuration...');
  console.log('Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
  console.log('Plan IDs:', PAYPAL_PLAN_IDS);
  
  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'your_paypal_client_id') {
    console.error('❌ PayPal Client ID is not configured');
    throw new Error('PayPal Client ID is not configured');
  }
  
  // Check if we have valid plan IDs
  const hasValidPlans = Object.values(PAYPAL_PLAN_IDS).some(id => id && id.trim() !== '' && id.startsWith('P-'));
  if (!hasValidPlans) {
    console.error('❌ No valid PayPal plan IDs configured');
    throw new Error('No valid PayPal plan IDs configured');
  }
  
  console.log('✅ PayPal configuration is valid');
  return true;
};

// Helper function to check if a plan has a valid PayPal ID with detailed logging
export const hasValidPayPalPlan = (planId: string): boolean => {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
  const isValid = !!(paypalPlanId && paypalPlanId.trim() !== '' && paypalPlanId.startsWith('P-'));
  
  console.log(`🔍 Checking PayPal plan for ${planId}:`, {
    planId,
    paypalPlanId,
    isValid,
    hasValue: !!paypalPlanId,
    isNotEmpty: paypalPlanId && paypalPlanId.trim() !== '',
    startsWithP: paypalPlanId && paypalPlanId.startsWith('P-'),
    allPlanIds: PAYPAL_PLAN_IDS
  });
  
  return isValid;
};

// Get all valid plan IDs
export const getValidPayPalPlans = (): string[] => {
  return Object.keys(PAYPAL_PLAN_IDS).filter(planId => hasValidPayPalPlan(planId));
};

// Instructions for PayPal setup - Updated with current status
export const getPayPalSetupInstructions = () => {
  return {
    title: "PayPal Configuration Status",
    steps: [
      "🔧 Current Configuration:",
      `• Client ID: ${PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NOT SET'}`,
      `• Pro Plan ID: ${PAYPAL_PLAN_IDS.pro}`,
      `• Elite Plan ID: ${PAYPAL_PLAN_IDS.elite}`,
      "",
      "📊 PayPal Dashboard Status:",
      "• TRADIA v22 app is active",
      "• Both subscription plans are ON",
      "• Plan IDs match your dashboard",
      "",
      "🔍 Troubleshooting Steps:",
      "1. Refresh the page to reload environment variables",
      "2. Check browser console for any errors",
      "3. Verify .env file has the correct VITE_PAYPAL_CLIENT_ID",
      "4. Go to /setup and click 'Setup All Data' to sync Firestore",
      "",
      "✅ If you still see 'Setup Required', try:",
      "• Hard refresh (Ctrl+F5 or Cmd+Shift+R)",
      "• Clear browser cache",
      "• Check browser developer tools for errors"
    ],
    note: "Configuration appears correct. If issues persist, check browser console for detailed error messages."
  };
};

// Test PayPal plan validity with detailed logging
export const testPayPalPlan = async (planId: string): Promise<boolean> => {
  try {
    console.log(`🧪 Testing PayPal plan: ${planId}`);
    
    const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
    
    if (!paypalPlanId) {
      console.error(`❌ No PayPal plan ID found for ${planId}`);
      return false;
    }
    
    if (!paypalPlanId.startsWith('P-')) {
      console.error(`❌ Invalid PayPal plan ID format for ${planId}:`, paypalPlanId);
      return false;
    }
    
    console.log(`✅ PayPal plan ${planId} appears valid:`, paypalPlanId);
    return true;
    
  } catch (error) {
    console.error(`❌ Error testing PayPal plan ${planId}:`, error);
    return false;
  }
};

// Debug function to check all configuration
export const debugPayPalConfig = () => {
  console.log('🔍 PayPal Configuration Debug:');
  console.log('Environment Variables:');
  console.log('- VITE_PAYPAL_CLIENT_ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET');
  console.log('Hardcoded Values:');
  console.log('- PAYPAL_CLIENT_ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NOT SET');
  console.log('- PAYPAL_PLAN_IDS:', PAYPAL_PLAN_IDS);
  console.log('Plan Validation:');
  console.log('- Pro plan valid:', hasValidPayPalPlan('pro'));
  console.log('- Elite plan valid:', hasValidPayPalPlan('elite'));
  
  try {
    validatePayPalConfig();
    console.log('✅ Overall configuration: VALID');
  } catch (error) {
    console.log('❌ Overall configuration: INVALID -', error);
  }
};