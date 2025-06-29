# Pay.com Payment Integration Setup Guide

## 🚀 Complete Step-by-Step Guide to Configure Pay.com Payments

### Prerequisites
- Pay.com merchant account
- Access to Pay.com Developer Dashboard
- Your AI Trading platform ready for testing

---

## 📋 Step 1: Create Pay.com Merchant Account

1. **Visit Pay.com**
   - Go to: https://pay.com
   - Click "Get Started" or "Sign Up"
   - Choose "Business Account"

2. **Complete Business Verification**
   - Provide business information
   - Upload required documents
   - Complete identity verification
   - Wait for account approval (usually 1-3 business days)

---

## 🔧 Step 2: Access Developer Dashboard

1. **Login to Pay.com Dashboard**
   - Go to your Pay.com merchant dashboard
   - Navigate to "Developer" or "API" section

2. **Generate API Credentials**
   - Create a new application
   - Generate API Key and Merchant ID
   - Choose environment (Sandbox for testing, Production for live)

---

## 🔑 Step 3: Configure Environment Variables

1. **Update your `.env` file**
   ```env
   # Pay.com Configuration
   VITE_PAYCOM_API_KEY=your_actual_api_key_here
   VITE_PAYCOM_MERCHANT_ID=your_actual_merchant_id_here
   VITE_PAYCOM_ENVIRONMENT=sandbox
   ```

2. **For Production**
   ```env
   VITE_PAYCOM_ENVIRONMENT=production
   ```

---

## 🎯 Step 4: Configure Webhooks

1. **Set Webhook URL in Pay.com Dashboard**
   - Webhook URL: `https://your-domain.com/api/webhooks/paycom`
   - Events to subscribe to:
     - `payment.completed`
     - `payment.failed`
     - `subscription.created`
     - `subscription.cancelled`

2. **Webhook Security**
   - Enable webhook signature verification
   - Save the webhook secret for verification

---

## 🧪 Step 5: Test Your Setup

### Test in Sandbox Mode

1. **Update Environment**
   ```env
   VITE_PAYCOM_ENVIRONMENT=sandbox
   ```

2. **Test Payment Flow**
   - Visit: http://localhost:5173/plans
   - Click "Get Started" on Pro or Elite plan
   - Complete Pay.com checkout flow
   - Verify subscription is created

### Test Cards (Sandbox)
```
Success: 4111 1111 1111 1111
Decline: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

---

## 🔍 Step 6: Verify Integration

### Check Pay.com Dashboard

1. **View Payments**
   - Go to Pay.com Dashboard → Payments
   - Verify test payments appear

2. **Check Subscriptions**
   - Go to Subscriptions section
   - Verify subscription events

### Check Your Application

1. **User Dashboard**
   - Verify user plan is updated after payment
   - Check daily limits are applied correctly

2. **Admin Dashboard**
   - Go to: http://localhost:5173/admin
   - Verify subscription data appears

---

## 🚨 Troubleshooting Common Issues

### "API Key Invalid" Error
- **Cause**: Incorrect API key or environment mismatch
- **Solution**: Verify API key in Pay.com dashboard and check environment setting

### "Merchant ID Not Found" Error
- **Cause**: Wrong merchant ID or account not approved
- **Solution**: Check merchant ID and ensure account is fully verified

### Payment Button Not Appearing
- **Cause**: Pay.com configuration not loaded
- **Solution**: Check browser console for errors and verify environment variables

### Subscription Not Activating
- **Cause**: Webhook not configured or Firestore update failing
- **Solution**: Check webhook configuration and Firestore security rules

---

## 📝 Environment Variables Reference

```env
# Required Pay.com Configuration
VITE_PAYCOM_API_KEY=pk_sandbox_1234567890abcdef  # Your API key
VITE_PAYCOM_MERCHANT_ID=merchant_1234567890      # Your merchant ID
VITE_PAYCOM_ENVIRONMENT=sandbox                  # sandbox or production

# Optional Configuration
VITE_PAYCOM_WEBHOOK_SECRET=whsec_1234567890      # For webhook verification
```

---

## 🎯 Final Checklist

- [ ] Pay.com merchant account created and verified
- [ ] API credentials generated (API Key + Merchant ID)
- [ ] Environment variables configured in `.env` file
- [ ] Webhook endpoints configured in Pay.com dashboard
- [ ] Tested subscription flow in sandbox
- [ ] Verified user plan updates after payment
- [ ] Ready for production testing

---

## 🆘 Need Help?

If you encounter issues:

1. **Check Pay.com Documentation**
   - https://docs.pay.com/

2. **Verify API Credentials**
   - Ensure API Key and Merchant ID are correct

3. **Test in Sandbox First**
   - Always test with sandbox before going live

4. **Check Browser Console**
   - Look for JavaScript errors during payment flow

5. **Contact Pay.com Support**
   - Use their support chat or email for API issues

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit API keys to version control
   - Use different keys for development/production
   - Rotate keys regularly

2. **Webhook Security**
   - Always verify webhook signatures
   - Use HTTPS for webhook endpoints
   - Implement proper error handling

3. **User Data**
   - Follow PCI compliance guidelines
   - Never store sensitive payment data
   - Use Pay.com's secure tokenization

---

**🎉 Once completed, your Pay.com payment system will be fully functional!**

Your users will be able to:
- Subscribe to Pro plan ($29.99/month)
- Subscribe to Elite plan ($99/month)
- Pay with multiple payment methods
- Manage subscriptions from their dashboard
- Enjoy secure, PCI-compliant payment processing