import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiLoader } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import './PaymentCallback.css';

/**
 * PaymentCallback Page
 * Handles the redirect from Momo payment gateway after payment completion.
 * This page processes the callback parameters and redirects to the appropriate success/failure page.
 */
const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');

  useEffect(() => {
    processCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const processCallback = () => {
    // Extract parameters from Momo callback URL
    const orderId = searchParams.get('orderId');
    const resultCode = searchParams.get('resultCode');
    const message = searchParams.get('message');

    // Log callback for debugging
    console.log('Momo Payment Callback:', {
      orderId,
      resultCode,
      message,
    });

    // Process result code
    if (resultCode === '0') {
      // Payment successful
      setStatus('success');
      setMessage('Thanh toán thành công! Đang chuyển hướng...');

      // Redirect to success page with order ID
      setTimeout(() => {
        if (orderId) {
          navigate(`/payment/success?orderId=${orderId}`);
        } else {
          navigate('/payment/success');
        }
      }, 1500);
    } else {
      // Payment failed or cancelled
      setStatus('error');
      setMessage(message || 'Thanh toán thất bại. Đang quay về trang giỏ hàng...');

      // Redirect to cart page after delay
      setTimeout(() => {
        navigate('/cart');
      }, 3000);
    }
  };

  return (
    <UserLayout>
      <div className="payment-callback-page">
        <div className="container">
          <div className="payment-callback-card">
            <div className="callback-spinner-wrapper">
              {status === 'processing' && (
                <div className="callback-spinner">
                  <FiLoader className="spinner-icon" />
                </div>
              )}
              {status === 'success' && (
                <div className="callback-icon success">
                  <svg viewBox="0 0 52 52" className="checkmark">
                    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                  </svg>
                </div>
              )}
              {status === 'error' && (
                <div className="callback-icon error">
                  <svg viewBox="0 0 52 52" className="cross">
                    <circle className="cross-circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="cross-line" fill="none" d="M16 16 36 36" />
                    <path className="cross-line" fill="none" d="M36 16 16 36" />
                  </svg>
                </div>
              )}
            </div>
            <p className={`callback-message ${status}`}>{message}</p>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PaymentCallback;
