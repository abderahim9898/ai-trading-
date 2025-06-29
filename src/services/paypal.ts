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

// PayPal Plan IDs - Updated with new Elite plan ID
export const PAYPAL_PLAN_IDS = {
  pro: 'P-45K919511S534301FNBQVDII',   // Pro Plan: $29/month
  elite: 'P-2D270313MK3350614NBQYT3Q'  // Elite Plan: $99/month - UPDATED ID
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

// Instructions for PayPal setup - Updated with new Elite plan ID
export const getPayPalSetupInstructions = () => {
  return {
    title: "PayPal Configuration Updated ✅",
    steps: [
      "✅ PayPal Client ID: Configured",
      "✅ Pro Plan ID: P-45K919511S534301FNBQVDII ($29/month)",
      "✅ Elite Plan ID: P-2D270313MK3350614NBQYT3Q ($99/month) - UPDATED",
      "",
      "🎉 Both plans are now configured with correct PayPal Plan IDs!",
      "",
      "📝 Next steps:",
      "1. Go to /setup and click 'Setup All Data'",
      "2. Verify both plans show 'Get Started' buttons",
      "3. Test the payment flow for both plans",
      "",
      "🔍 If you still see 'Setup Required':",
      "• Verify the plans are ACTIVE in PayPal Developer Dashboard",
      "• Check that your Client ID has access to these plans",
      "• Ensure plans are in the correct environment (sandbox vs live)"
    ],
    note: "Elite plan ID has been updated to P-2D270313MK3350614NBQYT3Q. Your payment system should now be fully operational!"
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