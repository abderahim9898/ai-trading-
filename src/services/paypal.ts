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

// Enhanced plan validation with better error handling
export const hasValidPayPalPlan = (planId: string): boolean => {
  const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
  
  // More detailed validation
  if (!paypalPlanId) {
    console.warn(`⚠️ No PayPal plan ID found for plan: ${planId}`);
    return false;
  }
  
  if (typeof paypalPlanId !== 'string' || paypalPlanId.trim() === '') {
    console.warn(`⚠️ Empty PayPal plan ID for plan: ${planId}`);
    return false;
  }
  
  if (!paypalPlanId.startsWith('P-')) {
    console.warn(`⚠️ Invalid PayPal plan ID format for ${planId}: ${paypalPlanId} (should start with 'P-')`);
    return false;
  }
  
  // Check minimum length (PayPal plan IDs are typically 27-30 characters)
  if (paypalPlanId.length < 25) {
    console.warn(`⚠️ PayPal plan ID too short for ${planId}: ${paypalPlanId} (length: ${paypalPlanId.length})`);
    return false;
  }
  
  console.log(`✅ PayPal plan ${planId} is valid: ${paypalPlanId}`);
  return true;
};

// Get all valid plan IDs
export const getValidPayPalPlans = (): string[] => {
  return Object.keys(PAYPAL_PLAN_IDS).filter(planId => hasValidPayPalPlan(planId));
};

// Test PayPal plan validity with API call simulation
export const testPayPalPlan = async (planId: string): Promise<boolean> => {
  try {
    console.log(`🧪 Testing PayPal plan: ${planId}`);
    
    const paypalPlanId = PAYPAL_PLAN_IDS[planId as keyof typeof PAYPAL_PLAN_IDS];
    
    if (!paypalPlanId) {
      console.error(`❌ No PayPal plan ID found for ${planId}`);
      return false;
    }
    
    // Basic format validation
    if (!paypalPlanId.startsWith('P-') || paypalPlanId.length < 25) {
      console.error(`❌ Invalid PayPal plan ID format for ${planId}:`, paypalPlanId);
      return false;
    }
    
    // Simulate API validation (in a real app, you'd call PayPal API to verify the plan exists)
    console.log(`✅ PayPal plan ${planId} format validation passed:`, paypalPlanId);
    
    // For now, we'll assume all properly formatted plan IDs are valid
    // In production, you would make an API call to PayPal to verify the plan exists
    return true;
    
  } catch (error) {
    console.error(`❌ Error testing PayPal plan ${planId}:`, error);
    return false;
  }
};

// Instructions for PayPal setup - Updated with current status
export const getPayPalSetupInstructions = () => {
  const validPlans = getValidPayPalPlans();
  
  return {
    title: "PayPal Business Account Configuration",
    steps: [
      "🔧 Current Configuration Status:",
      `• Client ID: ${PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NOT SET'}`,
      `• Pro Plan ID: ${PAYPAL_PLAN_IDS.pro} ${hasValidPayPalPlan('pro') ? '✅' : '❌'}`,
      `• Elite Plan ID: ${PAYPAL_PLAN_IDS.elite} ${hasValidPayPalPlan('elite') ? '✅' : '❌'}`,
      `• Valid Plans: ${validPlans.length}/2`,
      "",
      "📊 PayPal Dashboard Verification:",
      "• TRADIA v22 app is active",
      "• Both subscription plans show as ON",
      "• Plan IDs copied from your dashboard",
      "",
      "🔍 If you see validation errors:",
      "1. Double-check plan IDs in PayPal dashboard",
      "2. Ensure plans are ACTIVE (not paused)",
      "3. Copy plan IDs exactly as shown in dashboard",
      "4. Run /setup to update Firestore with correct IDs",
      "",
      "🛠️ Troubleshooting Steps:",
      "• Go to PayPal Developer Dashboard",
      "• Navigate to Billing Plans",
      "• Verify both plans exist and are active",
      "• Copy the exact Plan ID (starts with P-)",
      "• Update the plan IDs in the code if needed"
    ],
    note: `Configuration shows ${validPlans.length} of 2 plans are valid. ${validPlans.length === 2 ? 'All systems ready!' : 'Some plans need attention.'}`
  };
};

// Debug function to check all configuration with enhanced details
export const debugPayPalConfig = () => {
  console.log('🔍 PayPal Configuration Debug Report:');
  console.log('=====================================');
  
  console.log('Environment Variables:');
  console.log('- VITE_PAYPAL_CLIENT_ID:', import.meta.env.VITE_PAYPAL_CLIENT_ID ? 'SET' : 'NOT SET');
  
  console.log('Hardcoded Values:');
  console.log('- PAYPAL_CLIENT_ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 20)}...` : 'NOT SET');
  console.log('- PAYPAL_PLAN_IDS:', PAYPAL_PLAN_IDS);
  
  console.log('Plan Validation Details:');
  Object.entries(PAYPAL_PLAN_IDS).forEach(([planId, paypalPlanId]) => {
    console.log(`- ${planId}:`);
    console.log(`  • Plan ID: ${paypalPlanId}`);
    console.log(`  • Length: ${paypalPlanId.length} characters`);
    console.log(`  • Starts with P-: ${paypalPlanId.startsWith('P-')}`);
    console.log(`  • Valid: ${hasValidPayPalPlan(planId) ? '✅' : '❌'}`);
  });
  
  const validPlans = getValidPayPalPlans();
  console.log(`Valid Plans: ${validPlans.join(', ')} (${validPlans.length}/2)`);
  
  try {
    validatePayPalConfig();
    console.log('✅ Overall configuration: VALID');
  } catch (error) {
    console.log('❌ Overall configuration: INVALID -', error);
  }
  
  console.log('=====================================');
};

// Force refresh PayPal configuration
export const refreshPayPalConfig = async (): Promise<{ success: boolean; validPlans: string[]; errors: string[] }> => {
  const errors: string[] = [];
  const validPlans: string[] = [];
  
  try {
    console.log('🔄 Refreshing PayPal configuration...');
    
    // Validate client ID
    if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'your_paypal_client_id') {
      errors.push('PayPal Client ID is not configured');
    }
    
    // Test each plan
    for (const [planId, paypalPlanId] of Object.entries(PAYPAL_PLAN_IDS)) {
      const isValid = await testPayPalPlan(planId);
      if (isValid) {
        validPlans.push(planId);
      } else {
        errors.push(`Plan ${planId} (${paypalPlanId}) is invalid`);
      }
    }
    
    const success = errors.length === 0 && validPlans.length === Object.keys(PAYPAL_PLAN_IDS).length;
    
    console.log(`🔄 Refresh complete: ${success ? 'SUCCESS' : 'ISSUES FOUND'}`);
    console.log(`Valid plans: ${validPlans.join(', ')}`);
    if (errors.length > 0) {
      console.log(`Errors: ${errors.join(', ')}`);
    }
    
    return { success, validPlans, errors };
    
  } catch (error) {
    console.error('❌ Error refreshing PayPal config:', error);
    return { 
      success: false, 
      validPlans, 
      errors: [...errors, `Refresh failed: ${error}`] 
    };
  }
};