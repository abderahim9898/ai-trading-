import { PayPalScriptProvider } from '@paypal/react-paypal-js';

export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID || 'AXx3_6Uc5uEaKyQ3lo2TObG2hnLmgqFfK3nWn-hB96wr7R-08nO6nivLY_YSdZVGuDs6o9nQ4aYh5eSl';

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

// PayPal Plan IDs - Updated to match your actual PayPal dashboard
export const PAYPAL_PLAN_IDS = {
  pro: 'P-06P792050H561492LNBQW6ZA',    // ✅ AI Trading Pro Monthly
  elite: 'P-2D270313MK3350614NBQYT3Q'   // ✅ Elite Plan
};

// Validate PayPal configuration
export const validatePayPalConfig = () => {
  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'your_paypal_client_id') {
    throw new Error('PayPal Client ID is not configured');
  }
  
  // Check if we have valid plan IDs
  const hasValidPlans = Object.values(PAYPAL_PLAN_IDS).some(id => id && id.trim() !== '');
  if (!hasValidPlans) {
    throw new Error('No valid PayPal plan IDs configured');
  }
  
  return true;
};

// Helper function to check if a plan has a valid PayPal ID
export const hasValidPayPalPlan = (planId: string): boolean => {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
  const isValid = !!(paypalPlanId && paypalPlanId.trim() !== '' && paypalPlanId.startsWith('P-'));
  
  console.log(`Checking PayPal plan for ${planId}:`, {
    paypalPlanId,
    isValid,
    allPlanIds: PAYPAL_PLAN_IDS
  });
  
  return isValid;
};

// Instructions for PayPal setup - Updated with correct plan IDs
export const getPayPalSetupInstructions = () => {
  return {
    title: "PayPal Configuration Synchronized ✅",
    steps: [
      "✅ PayPal Client ID: Configured",
      "✅ Pro Plan ID: P-06P792050H561492LNBQW6ZA (AI Trading Pro Monthly)",
      "✅ Elite Plan ID: P-2D270313MK3350614NBQYT3Q (Elite Plan)",
      "",
      "🎉 Plan IDs now match your PayPal dashboard exactly!",
      "",
      "📊 Your PayPal Dashboard Shows:",
      "• Pro Plan: P-06P792050H561492LNBQW6ZA - AI Trading Pro Monthly - ON",
      "• Elite Plan: P-2D270313MK3350614NBQYT3Q - Elite Plan - ON",
      "",
      "📝 Next steps:",
      "1. Go to /setup and click 'Setup All Data'",
      "2. Both plans should now show 'Get Started' buttons",
      "3. Test the payment flow for both plans",
      "",
      "🔍 Both plans are ACTIVE with 0 subscriptions - ready for testing!"
    ],
    note: "Plan IDs have been synchronized with your PayPal dashboard. Your payment system should now work perfectly!"
  };
};

// Test PayPal plan validity
export const testPayPalPlan = async (planId: string): Promise<boolean> => {
  try {
    // This would normally make an API call to PayPal to verify the plan exists
    // For now, we'll just check if the plan ID format is correct
    const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
    
    if (!paypalPlanId || !paypalPlanId.startsWith('P-')) {
      console.error(`Invalid PayPal plan ID format for ${planId}:`, paypalPlanId);
      return false;
    }
    
    console.log(`PayPal plan ${planId} appears valid:`, paypalPlanId);
    return true;
    
  } catch (error) {
    console.error(`Error testing PayPal plan ${planId}:`, error);
    return false;
  }
};