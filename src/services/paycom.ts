// Pay.com payment integration service
export const PAYCOM_API_KEY = import.meta.env.VITE_PAYCOM_API_KEY;
export const PAYCOM_MERCHANT_ID = import.meta.env.VITE_PAYCOM_MERCHANT_ID;
export const PAYCOM_ENVIRONMENT = import.meta.env.VITE_PAYCOM_ENVIRONMENT || 'sandbox';

// Pay.com API endpoints
const PAYCOM_BASE_URL = PAYCOM_ENVIRONMENT === 'production' 
  ? 'https://api.pay.com' 
  : 'https://sandbox-api.pay.com';

export interface PayComSubscriptionPlan {
  id: string;
  name: string;
  amount: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  description: string;
}

export interface PayComPaymentRequest {
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

export interface PayComPaymentResponse {
  id: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  currency: string;
  paymentUrl: string;
  subscriptionId?: string;
}

// Plan configurations for Pay.com
export const PAYCOM_PLANS = {
  pro: {
    id: 'pro-monthly',
    name: 'AI Trading Pro Plan',
    amount: 2999, // $29.99 in cents
    currency: 'USD',
    interval: 'monthly' as const,
    description: 'Professional AI-powered trading signals with 5 signals per day'
  },
  elite: {
    id: 'elite-monthly', 
    name: 'AI Trading Elite Plan',
    amount: 9900, // $99.00 in cents
    currency: 'USD',
    interval: 'monthly' as const,
    description: 'Elite AI-powered trading signals with 15 signals per day and VIP features'
  }
} as const;

// Validate Pay.com configuration
export const validatePayComConfig = (): boolean => {
  if (!PAYCOM_API_KEY || PAYCOM_API_KEY === 'your_paycom_api_key') {
    throw new Error('Pay.com API key is not configured');
  }
  
  if (!PAYCOM_MERCHANT_ID || PAYCOM_MERCHANT_ID === 'your_paycom_merchant_id') {
    throw new Error('Pay.com Merchant ID is not configured');
  }
  
  return true;
};

// Check if a plan has valid Pay.com configuration
export const hasValidPayComPlan = (planId: string): boolean => {
  return planId in PAYCOM_PLANS;
};

// Create a payment session with Pay.com
export const createPayComPayment = async (request: PayComPaymentRequest): Promise<PayComPaymentResponse> => {
  try {
    validatePayComConfig();
    
    const response = await fetch(`${PAYCOM_BASE_URL}/v1/payments`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYCOM_API_KEY}`,
        'Content-Type': 'application/json',
        'X-Merchant-ID': PAYCOM_MERCHANT_ID
      },
      body: JSON.stringify({
        ...request,
        success_url: `${window.location.origin}/dashboard?payment=success`,
        cancel_url: `${window.location.origin}/plans?payment=cancelled`,
        webhook_url: `${window.location.origin}/api/webhooks/paycom`
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Pay.com API error: ${errorData.message || response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pay.com payment creation failed:', error);
    throw error;
  }
};

// Create a subscription with Pay.com
export const createPayComSubscription = async (
  planId: string, 
  customerEmail: string, 
  customerName?: string,
  metadata?: Record<string, string>
): Promise<PayComPaymentResponse> => {
  const plan = PAYCOM_PLANS[planId as keyof typeof PAYCOM_PLANS];
  
  if (!plan) {
    throw new Error(`Invalid plan ID: ${planId}`);
  }

  return createPayComPayment({
    amount: plan.amount,
    currency: plan.currency,
    description: plan.description,
    customer: {
      email: customerEmail,
      name: customerName
    },
    subscription: {
      planId: plan.id
    },
    metadata
  });
};

// Verify payment status
export const verifyPayComPayment = async (paymentId: string): Promise<any> => {
  try {
    validatePayComConfig();
    
    const response = await fetch(`${PAYCOM_BASE_URL}/v1/payments/${paymentId}`, {
      headers: {
        'Authorization': `Bearer ${PAYCOM_API_KEY}`,
        'X-Merchant-ID': PAYCOM_MERCHANT_ID
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to verify payment: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Pay.com payment verification failed:', error);
    throw error;
  }
};

// Cancel subscription
export const cancelPayComSubscription = async (subscriptionId: string): Promise<boolean> => {
  try {
    validatePayComConfig();
    
    const response = await fetch(`${PAYCOM_BASE_URL}/v1/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${PAYCOM_API_KEY}`,
        'X-Merchant-ID': PAYCOM_MERCHANT_ID
      }
    });

    return response.ok;
  } catch (error) {
    console.error('Pay.com subscription cancellation failed:', error);
    return false;
  }
};

// Get setup instructions for Pay.com
export const getPayComSetupInstructions = () => {
  return {
    title: "Pay.com Payment Integration Setup",
    steps: [
      "1. Create a Pay.com merchant account at https://pay.com",
      "2. Complete business verification process",
      "3. Navigate to Developer Settings in your Pay.com dashboard",
      "4. Generate API keys for your application",
      "5. Copy your API Key and Merchant ID",
      "6. Add them to your .env file:",
      "   VITE_PAYCOM_API_KEY=your_api_key",
      "   VITE_PAYCOM_MERCHANT_ID=your_merchant_id",
      "   VITE_PAYCOM_ENVIRONMENT=sandbox (or production)",
      "7. Configure webhook endpoints in Pay.com dashboard",
      "8. Test payments in sandbox mode before going live"
    ],
    note: "Pay.com offers competitive rates and supports multiple payment methods including cards, digital wallets, and bank transfers."
  };
};

// Debug Pay.com configuration
export const debugPayComConfig = () => {
  console.log('🔍 Pay.com Configuration Debug:');
  console.log('================================');
  console.log('API Key:', PAYCOM_API_KEY ? `${PAYCOM_API_KEY.substring(0, 10)}...` : 'NOT SET');
  console.log('Merchant ID:', PAYCOM_MERCHANT_ID ? `${PAYCOM_MERCHANT_ID.substring(0, 10)}...` : 'NOT SET');
  console.log('Environment:', PAYCOM_ENVIRONMENT);
  console.log('Base URL:', PAYCOM_BASE_URL);
  console.log('Available Plans:', Object.keys(PAYCOM_PLANS));
  
  try {
    validatePayComConfig();
    console.log('✅ Configuration is valid');
  } catch (error) {
    console.log('❌ Configuration error:', error);
  }
};

// Test Pay.com connection
export const testPayComConnection = async (): Promise<boolean> => {
  try {
    validatePayComConfig();
    
    // Test API connection with a simple request
    const response = await fetch(`${PAYCOM_BASE_URL}/v1/health`, {
      headers: {
        'Authorization': `Bearer ${PAYCOM_API_KEY}`,
        'X-Merchant-ID': PAYCOM_MERCHANT_ID
      }
    });
    
    return response.ok;
  } catch (error) {
    console.error('Pay.com connection test failed:', error);
    return false;
  }
};