// PayPal payment integration service
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID;
export const PAYPAL_ENVIRONMENT = import.meta.env.VITE_PAYPAL_ENVIRONMENT || 'sandbox';

// PayPal API endpoints
const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === 'production' 
  ? 'https://api.paypal.com' 
  : 'https://api.sandbox.paypal.com';

export interface PayPalSubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  description: string;
}

export interface PayPalPaymentRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    email: string;
    name?: string;
  };
  subscription?: {
    planId: string;
  };
  metadata?: {
    userId: string;
    planType: string;
  };
}

export interface PayPalPaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  paymentUrl: string;
  subscriptionId?: string;
}

// Plan configurations for PayPal
export const PAYPAL_PLANS = {
  pro: {
    id: 'P-5ML4271244454362WXNWU5NQ', // Replace with actual PayPal Plan ID
    name: 'AI Trading Pro Plan',
    amount: 2999, // $29.99 in cents
    currency: 'USD',
    interval: 'monthly' as const,
    description: 'Professional AI-powered trading signals with 5 signals per day'
  },
  elite: {
    id: 'P-6XL9876543210987YXOWV6PR', // Replace with actual PayPal Plan ID
    name: 'AI Trading Elite Plan',
    amount: 9900, // $99.00 in cents
    currency: 'USD',
    interval: 'monthly' as const,
    description: 'Elite AI-powered trading signals with 15 signals per day and VIP features'
  }
} as const;

// Validate PayPal configuration
export const validatePayPalConfig = (): boolean => {
  if (!PAYPAL_CLIENT_ID || PAYPAL_CLIENT_ID === 'your_paypal_client_id') {
    throw new Error('PayPal Client ID is not configured');
  }
  
  return true;
};

// Check if a plan has valid PayPal configuration
export const hasValidPayPalPlan = (planId: string): boolean => {
  return planId in PAYPAL_PLANS;
};

// Load PayPal SDK
export const loadPayPalSDK = (): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (window.paypal) {
      resolve(window.paypal);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&vault=true&intent=subscription`;
    script.onload = () => {
      if (window.paypal) {
        resolve(window.paypal);
      } else {
        reject(new Error('PayPal SDK failed to load'));
      }
    };
    script.onerror = () => reject(new Error('PayPal SDK failed to load'));
    document.head.appendChild(script);
  });
};

// Create a subscription with PayPal
export const createPayPalSubscription = async (
  planId: string, 
  customerEmail: string, 
  customerName?: string,
  metadata?: Record<string, string>
): Promise<PayPalPaymentResponse> => {
  const plan = PAYPAL_PLANS[planId as keyof typeof PAYPAL_PLANS];
  
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  try {
    validatePayPalConfig();
    await loadPayPalSDK();

    return new Promise((resolve, reject) => {
      window.paypal.Buttons({
        createSubscription: function(data: any, actions: any) {
          return actions.subscription.create({
            'plan_id': plan.id,
            'subscriber': {
              'email_address': customerEmail,
              'name': customerName ? {
                'given_name': customerName.split(' ')[0],
                'surname': customerName.split(' ').slice(1).join(' ')
              } : undefined
            },
            'custom_id': metadata?.userId || '',
            'application_context': {
              'brand_name': 'AI Trader',
              'locale': 'en-US',
              'shipping_preference': 'NO_SHIPPING',
              'user_action': 'SUBSCRIBE_NOW',
              'payment_method': {
                'payer_selected': 'PAYPAL',
                'payee_preferred': 'IMMEDIATE_PAYMENT_REQUIRED'
              },
              'return_url': `${window.location.origin}/dashboard?payment=success`,
              'cancel_url': `${window.location.origin}/plans?payment=cancelled`
            }
          });
        },
        onApprove: function(data: any, actions: any) {
          resolve({
            id: data.subscriptionID,
            status: 'completed',
            amount: plan.amount,
            currency: plan.currency,
            paymentUrl: '',
            subscriptionId: data.subscriptionID
          });
        },
        onError: function(err: any) {
          reject(new Error(`PayPal error: ${err.message || 'Unknown error'}`));
        },
        onCancel: function(data: any) {
          reject(new Error('Payment cancelled by user'));
        }
      }).render('#paypal-button-container');
    });
  } catch (error) {
    console.error('PayPal subscription creation failed:', error);
    throw error;
  }
};

// Verify payment status
export const verifyPayPalPayment = async (subscriptionId: string): Promise<any> => {
  try {
    validatePayPalConfig();
    
    // Note: This would typically be done on the backend for security
    // For demo purposes, we'll return a mock response
    return {
      id: subscriptionId,
      status: 'ACTIVE',
      plan_id: 'mock-plan-id'
    };
  } catch (error) {
    console.error('PayPal payment verification failed:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelPayPalSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    validatePayPalConfig();
    
    // Note: This would typically be done on the backend
    console.log(`Cancelling PayPal subscription: ${subscriptionId}`);
    return true;
  } catch (error) {
    console.error('PayPal subscription cancellation failed:', error);
    return false;
  }
};

// Get setup instructions for PayPal
export const getPayPalSetupInstructions = () => {
  return {
    title: "PayPal Payment Integration Setup",
    steps: [
      "1. Create a PayPal Business account at https://paypal.com",
      "2. Go to PayPal Developer Dashboard at https://developer.paypal.com",
      "3. Create a new application",
      "4. Get your Client ID from the app credentials",
      "5. Create subscription plans in PayPal Dashboard:",
      "   • Pro Plan: $29.99/month",
      "   • Elite Plan: $99/month",
      "6. Copy the Plan IDs and update PAYPAL_PLANS in the code",
      "7. Add your Client ID to .env file:",
      "   VITE_PAYPAL_CLIENT_ID=your_client_id",
      "   VITE_PAYPAL_ENVIRONMENT=sandbox (or production)",
      "8. Test payments in sandbox mode before going live"
    ],
    note: "PayPal offers secure payment processing with buyer protection and supports multiple payment methods."
  };
};

// Debug PayPal configuration
export const debugPayPalConfig = () => {
  console.log('🔍 PayPal Configuration Debug:');
  console.log('================================');
  console.log('Client ID:', PAYPAL_CLIENT_ID ? `${PAYPAL_CLIENT_ID.substring(0, 10)}...` : 'NOT SET');
  console.log('Environment:', PAYPAL_ENVIRONMENT);
  console.log('Base URL:', PAYPAL_BASE_URL);
  console.log('Available Plans:', Object.keys(PAYPAL_PLANS));
  
  try {
    validatePayPalConfig();
    console.log('✅ Configuration is valid');
  } catch (error) {
    console.log('❌ Configuration error:', error);
  }
};

// Test PayPal connection
export const testPayPalConnection = async (): Promise<boolean> => {
  try {
    validatePayPalConfig();
    await loadPayPalSDK();
    return true;
  } catch (error) {
    console.error('PayPal connection test failed:', error);
    return false;
  }
};

// Add PayPal types to window
declare global {
  interface Window {
    paypal: any;
  }
}