# Momo Payment Gateway Setup Guide

This guide explains how to configure the Momo payment gateway integration for the DetailingStore application.

## Prerequisites

- A Momo developer account (for test/sandbox credentials)
- Access to the backend `.env.development` file
- A way to expose your local development server to the internet (e.g., ngrok) for testing webhooks

## Step 1: Obtain Test Credentials from Momo Developer Portal

### 1.1 Register for Momo Developer Account

1. Visit [Momo Developer Portal](https://developers.momo.vn)
2. Click "Đăng ký" (Register) to create a developer account
3. Complete the registration form with your information
4. Verify your email address

### 1.2 Create a Test Application

1. Log in to the Momo Developer Portal
2. Navigate to "Ứng dụng của tôi" (My Applications)
3. Click "Tạo ứng dụng mới" (Create New Application)
4. Fill in application details:
   - **App Name**: DetailingStore Test
   - **Environment**: Sandbox/Test
   - **Payment Method**: QR Code Payment (captureWallet)
5. Submit the application

### 1.3 Copy Your Test Credentials

After creating the application, you'll receive three key credentials:

- **Partner Code**: A unique identifier for your application
- **Access Key**: Public key for API authentication
- **Secret Key**: Private key for signature generation (keep this secure!)

**Important**: These are test credentials for the sandbox environment. They will not process real money transactions.

## Step 2: Configure Environment Variables

### 2.1 Update `.env.development` File

Open `backend/.env.development` and replace the placeholder values:

```bash
# Replace these with your actual Momo test credentials
MomoSettings__PartnerCode=YOUR_MOMO_PARTNER_CODE_HERE
MomoSettings__AccessKey=YOUR_MOMO_ACCESS_KEY_HERE
MomoSettings__SecretKey=YOUR_MOMO_SECRET_KEY_HERE
```

### 2.2 Configure Webhook URL (IPN Callback)

The IPN (Instant Payment Notification) callback URL is where Momo sends payment status updates.

#### For Local Development:

1. Install and run ngrok or a similar tunneling service:
   ```bash
   ngrok http 5000
   ```

2. Copy the HTTPS forwarding URL (e.g., `https://abc123.ngrok.io`)

3. Update the IPN callback URL in `.env.development`:
   ```bash
   MomoSettings__IpnCallbackUrl=https://abc123.ngrok.io/api/webhooks/momo/ipn
   ```

4. **Important**: Register this webhook URL in the Momo Developer Portal:
   - Go to your application settings
   - Add the IPN URL to the webhook configuration
   - Save the changes

#### For Production:

```bash
MomoSettings__IpnCallbackUrl=https://api.yourdomain.com/api/webhooks/momo/ipn
```

### 2.3 Configure Payment Redirect URL

This is where customers are redirected after completing payment in the Momo app.

#### For Local Development:
```bash
MomoSettings__PaymentRedirectUrl=http://localhost:3000/payment/callback
```

#### For Production:
```bash
MomoSettings__PaymentRedirectUrl=https://yourdomain.com/payment/callback
```

## Step 3: Verify Configuration

### 3.1 Check Configuration Loading

When you start the backend application, you should see a log message:

```
warn: DetailingStore.Services.MomoConfigurationService[0]
      Momo payment gateway is running in TEST MODE
```

This confirms the configuration is loaded correctly.

### 3.2 Configuration Validation

The `MomoConfigurationService` validates all required settings on startup. If any configuration is missing, you'll see an error:

```
error: DetailingStore.Services.MomoConfigurationService[0]
       Momo configuration is invalid or incomplete
```

Check that all required fields are set in `.env.development`.

## Step 4: Test the Integration

### 4.1 Test Payment Initiation

1. Create a service booking through the application
2. Click "Thanh toán với Momo" (Pay with Momo)
3. You should see a QR code displayed
4. The backend should log:
   ```
   info: DetailingStore.Services.MomoPaymentService[0]
         Momo API response for requestId REQ_xxx: {...}
   ```

### 4.2 Test Payment Completion

1. Use the Momo sandbox app or test account to scan the QR code
2. Complete the payment in the test environment
3. Momo will send an IPN notification to your webhook URL
4. The backend should log:
   ```
   info: DetailingStore.Services.MomoPaymentService[0]
         Processing IPN for orderId: BOOKING_xxx, resultCode: 0
   info: DetailingStore.Services.MomoPaymentService[0]
         Payment successful for transaction xxx
   ```
5. The booking status should update to "Confirmed" and "IsPaid" should be true

### 4.3 Common Test Scenarios

The Momo sandbox environment supports several test scenarios:

- **Successful Payment**: Use test account with sufficient balance
- **Insufficient Balance**: Test account with zero balance
- **Payment Timeout**: Don't complete payment within the time limit
- **User Cancellation**: Cancel the payment in the Momo app

## Step 5: Production Deployment

### 5.1 Request Production Credentials

1. Contact Momo business team to request production credentials
2. Complete the business verification process
3. Provide your business information and documentation
4. Receive production Partner Code, Access Key, and Secret Key

### 5.2 Update Production Configuration

1. Create `.env.production` file or set environment variables on your server
2. Update the credentials with production values
3. Update `appsettings.Production.json`:
   ```json
   {
     "MomoSettings": {
       "ApiEndpoint": "https://payment.momo.vn",
       "IsTestMode": false
     }
   }
   ```

### 5.3 Security Best Practices

- **Never commit `.env.*` files to version control** (they should be in `.gitignore`)
- **Store production credentials securely** using environment variables or secret management services (e.g., Azure Key Vault, AWS Secrets Manager)
- **Use HTTPS** for all IPN callback URLs in production
- **Implement IP whitelisting** for Momo webhook endpoints if supported
- **Monitor logs** for signature validation failures or suspicious activity
- **Rotate secrets** periodically according to your security policy

## Troubleshooting

### IPN Webhook Not Receiving Notifications

**Problem**: Payment completes but booking status doesn't update

**Solutions**:
1. Check that your ngrok tunnel is still active
2. Verify the IPN URL is registered in Momo Developer Portal
3. Check firewall settings allowing Momo IPs
4. Review backend logs for signature validation errors
5. Ensure the webhook endpoint is publicly accessible

### Signature Validation Failures

**Problem**: IPN notifications are rejected with "Invalid IPN signature"

**Solutions**:
1. Verify the Secret Key in `.env.development` matches Momo portal
2. Check for whitespace or special characters in the Secret Key
3. Ensure parameter ordering in signature generation matches Momo documentation
4. Review logs for the received vs. expected signature

### Payment Request Fails

**Problem**: Cannot initiate payment, error from Momo API

**Solutions**:
1. Check that Partner Code and Access Key are correct
2. Verify the API endpoint is correct for test environment
3. Check that the amount is within sandbox limits (typically ≤ 50,000,000 VND)
4. Review Momo API response for specific error codes
5. Ensure signature generation is correct

### Amount Mismatch Errors

**Problem**: IPN processing fails with "Amount mismatch"

**Solutions**:
1. Verify booking/order amount calculation is correct
2. Check that amounts are stored as the correct data type (decimal)
3. Ensure currency conversion is not applied (Momo uses VND)

## Additional Resources

- [Momo API Documentation](https://developers.momo.vn/v3/docs/payment/api/payment-api)
- [Momo Integration Guide](https://developers.momo.vn/v3/docs/payment/guide)
- [Momo Error Codes](https://developers.momo.vn/v3/docs/payment/guide/error-codes)
- [Momo Test Scenarios](https://developers.momo.vn/v3/docs/payment/guide/test-cases)

## Support

For issues related to:
- **Momo API or credentials**: Contact Momo support at developers@momo.vn
- **Application integration**: Check the project documentation or contact the development team
