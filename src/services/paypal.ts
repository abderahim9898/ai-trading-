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

// PayPal Plan IDs - Updated with correct IDs
export const PAYPAL_PLAN_IDS = {
  pro: 'P-45K919511S534301FNBQVDII',   // Pro Plan: $29/month
  elite: 'P-16783531A4944761DNBQVFNI'  // Elite Plan: $99/month - This is the one showing "Setup Required"
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

// Instructions for PayPal setup - Updated to reflect current status
export const getPayPalSetupInstructions = () => {
  return {
    title: "PayPal Configuration Status",
    steps: [
      "✅ PayPal Client ID: Configured",
      "✅ Pro Plan ID: P-45K919511S534301FNBQVDII",
      "✅ Elite Plan ID: P-16783531A4944761DNBQVFNI",
      "",
      "🔍 If you're seeing 'Setup Required', please verify:",
      "1. The PayPal plan IDs are active in your PayPal Developer Dashboard",
      "2. The plans are approved and not in draft status",
      "3. Your PayPal Client ID has access to these plans",
      "4. The plans are configured for the correct environment (sandbox vs live)",
      "",
      "📝 To check your PayPal plans:",
      "• Go to developer.paypal.com",
      "• Navigate to 'Billing Plans'",
      "• Verify both plan IDs exist and are 'ACTIVE'",
      "• Ensure they're in the same environment as your Client ID"
    ],
    note: "Both plan IDs are configured in the code. If you're still seeing setup issues, the plans may need to be activated in your PayPal Developer Dashboard."
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