import React, { useState } from 'react';
import { createPayComSubscription } from '../services/paycom';
import { updateUserPlan } from '../services/firestore';
import { CreditCard, Loader, Shield, CheckCircle } from 'lucide-react';

interface PayComButtonProps {
  planId: string;
  planName: string;
  price: number;
  userEmail: string;
  userId: string;
  onSuccess: (paymentData: any) => void;
  onError: (error: string) => void;
  disabled?: boolean;
}

const PayComButton: React.FC<PayComButtonProps> = ({
  planId,
  planName,
  price,
  userEmail,
  userId,
  onSuccess,
  onError,
  disabled = false
}) => {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      console.log(`🔄 Creating Pay.com payment for ${planName}...`);
      
      const paymentResponse = await createPayComSubscription(
        planId,
        userEmail,
        undefined, // customer name (optional)
        {
          userId,
          planType: planId,
          source: 'ai-trading-platform'
        }
      );

      console.log('✅ Pay.com payment created:', paymentResponse);

      // Redirect to Pay.com payment page
      if (paymentResponse.paymentUrl) {
        window.location.href = paymentResponse.paymentUrl;
      } else {
        throw new Error('No payment URL received from Pay.com');
      }

    } catch (error: any) {
      console.error('❌ Pay.com payment failed:', error);
      onError(error.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Payment Security Info */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <Shield className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-300">
            <p className="font-medium mb-1">Secure Payment via Pay.com:</p>
            <p>• Bank-level security and encryption</p>
            <p>• Multiple payment methods supported</p>
            <p>• Cancel anytime from your dashboard</p>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || loading}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-4 px-6 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader className="h-5 w-5 animate-spin" />
            <span>Processing...</span>
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            <span>Subscribe for ${price}/month</span>
          </>
        )}
      </button>

      {/* Supported Payment Methods */}
      <div className="text-center">
        <p className="text-xs text-gray-400 mb-2">Powered by Pay.com</p>
        <div className="flex justify-center space-x-2 text-xs text-gray-500">
          <span>💳 Cards</span>
          <span>•</span>
          <span>🏦 Bank Transfer</span>
          <span>•</span>
          <span>📱 Digital Wallets</span>
        </div>
      </div>
    </div>
  );
};

export default PayComButton;