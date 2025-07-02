import React, { useState, useEffect, useRef } from 'react';
import { loadPayPalSDK, PAYPAL_PLANS } from '../services/paypal';
import { updateUserPlan } from '../services/firestore';
import { CreditCard, Loader, Shield, CheckCircle } from 'lucide-react';

interface PayPalButtonProps {
  planId: string;
  planName: string;
  price: number;
  userEmail: string;
  userId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const PayPalButton: React.FC<PayPalButtonProps> = ({
  planId,
  planName,
  price,
  userEmail,
  userId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(true);
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const paypalRef = useRef<HTMLDivElement>(null);
  const buttonsRendered = useRef(false);

  useEffect(() => {
    initializePayPal();
  }, []);

  const initializePayPal = async () => {
    try {
      console.log(`🔄 Initializing PayPal for ${planName}...`);
      
      await loadPayPalSDK();
      setSdkLoaded(true);
      
      if (paypalRef.current && !buttonsRendered.current) {
        renderPayPalButtons();
      }
    } catch (error: any) {
      console.error('❌ PayPal initialization failed:', error);
      onError(error.message || 'Failed to load PayPal');
    } finally {
      setLoading(false);
    }
  };

  const renderPayPalButtons = () => {
    if (!window.paypal || !paypalRef.current || buttonsRendered.current) return;

    const plan = PAYPAL_PLANS[planId as keyof typeof PAYPAL_PLANS];
    if (!plan) {
      onError('Invalid subscription plan');
      return;
    }

    buttonsRendered.current = true;

    window.paypal.Buttons({
      style: {
        layout: 'vertical',
        color: 'blue',
        shape: 'rect',
        label: 'subscribe'
      },
      createSubscription: function(data: any, actions: any) {
        return actions.subscription.create({
          'plan_id': plan.id,
          'subscriber': {
            'email_address': userEmail
          },
          'custom_id': userId,
          'application_context': {
            'brand_name': 'AI Trader',
            'locale': 'en-US',
            'shipping_preference': 'NO_SHIPPING',
            'user_action': 'SUBSCRIBE_NOW',
            'return_url': `${window.location.origin}/dashboard?payment=success`,
            'cancel_url': `${window.location.origin}/plans?payment=cancelled`
          }
        });
      },
      onApprove: async function(data: any, actions: any) {
        try {
          console.log('🎉 PayPal Payment Approved:', data);
          
          // Update user subscription in Firestore
          await updateUserPlan(userId, planId, data.subscriptionID);
          
          onSuccess({
            subscriptionId: data.subscriptionID,
            planId: planId,
            status: 'approved'
          });
          
        } catch (error: any) {
          console.error('Error processing subscription:', error);
          onError(`Subscription activation failed: ${error.message}`);
        }
      },
      onError: function(err: any) {
        console.error('PayPal Error:', err);
        onError(err.message || 'PayPal payment failed. Please try again.');
      },
      onCancel: function(data: any) {
        console.log('PayPal Payment Cancelled:', data);
        onError('Payment was cancelled. You can try again anytime.');
      }
    }).render(paypalRef.current);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Loader className="h-4 w-4 text-blue-400 animate-spin" />
            <span className="text-blue-300 text-sm">Loading PayPal...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!sdkLoaded) {
    return (
      <div className="space-y-4">
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Shield className="h-4 w-4 text-red-400" />
            <span className="text-red-300 text-sm">PayPal failed to load</span>
          </div>
        </div>
        <button
          onClick={initializePayPal}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-all"
        >
          Retry PayPal Setup
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Payment Security Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Secure Payment via PayPal:</p>
            <p>• Buyer protection and secure checkout</p>
            <p>• Multiple payment methods supported</p>
            <p>• Cancel anytime from your dashboard</p>
          </div>
        </div>
      </div>

      {/* PayPal Button Container */}
      <div 
        ref={paypalRef} 
        id="paypal-button-container"
        className={disabled ? 'opacity-50 pointer-events-none' : ''}
      />

      {/* Supported Payment Methods */}
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Powered by PayPal</p>
        <div className="flex justify-center space-x-2 text-xs text-gray-500">
          <span>💳 Cards</span>
          <span>•</span>
          <span>🏦 Bank Transfer</span>
          <span>•</span>
          <span>📱 PayPal Balance</span>
        </div>
      </div>
    </div>
  );
};

export default PayPalButton;