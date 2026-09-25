import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiLoader } from 'react-icons/fi';
import { paymentApi, InitiatePaymentResponse } from '@/services/api/paymentApi';
import { orderStorage } from '@/utils/orderStorage';
import './MomoPaymentModal.css';

interface MomoPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId?: string;
  orderId?: string;
  amount: number;
}

type PaymentModalStatus = 'loading' | 'qr' | 'polling' | 'success' | 'error';

const MomoPaymentModal: React.FC<MomoPaymentModalProps> = ({
  isOpen,
  onClose,
  bookingId,
  orderId,
  amount,
}) => {
  const [paymentData, setPaymentData] = useState<InitiatePaymentResponse | null>(null);
  const [status, setStatus] = useState<PaymentModalStatus>('loading');
  const [error, setError] = useState<string | null>(null);
  const [pollingCount, setPollingCount] = useState(0);
  const pollingIntervalRef = useRef<number | null>(null);
  const maxPollingCount = 100; // 5 minutes at 3-second intervals

  useEffect(() => {
    if (isOpen) {
      initiatePayment();
    }

    // Cleanup on unmount or when modal closes
    return () => {
      if (pollingIntervalRef.current !== null) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  const initiatePayment = async () => {
    try {
      setStatus('loading');
      setError(null);
      setPollingCount(0);
      
      let response: InitiatePaymentResponse;
      
      if (bookingId) {
        response = await paymentApi.initiateBookingPayment(bookingId);
      } else if (orderId) {
        response = await paymentApi.initiateOrderPayment(orderId);
      } else {
        throw new Error('Không có mã đặt chỗ hoặc đơn hàng');
      }

      setPaymentData(response);
      setStatus('qr');
      startPolling(response.orderId);
    } catch (err: any) {
      setError(err.message || 'Không thể khởi tạo thanh toán');
      setStatus('error');
    }
  };

  const startPolling = (momoOrderId: string) => {
    setStatus('polling');
    
    pollingIntervalRef.current = window.setInterval(async () => {
      try {
        const statusResponse = await paymentApi.getPaymentStatus(momoOrderId);
        
        if (statusResponse.status === 'Success') {
          stopPolling();
          setStatus('success');
          
          // Update order payment status in local storage if orderId exists
          if (orderId) {
            orderStorage.updateOrderPayment(orderId, true);
          }
          
          setTimeout(() => {
            if (orderId) {
              window.location.href = `/payment/success?orderId=${orderId}`;
            } else if (bookingId) {
              window.location.href = `/bookings/success?bookingId=${bookingId}`;
            }
          }, 2000);
        } else if (statusResponse.status === 'Failed') {
          stopPolling();
          setError('Thanh toán thất bại');
          setStatus('error');
        }

        setPollingCount(prev => {
          const newCount = prev + 1;
          if (newCount >= maxPollingCount) {
            stopPolling();
            setError('Hết thời gian chờ thanh toán');
            setStatus('error');
          }
          return newCount;
        });
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 3000);
  };

  const stopPolling = () => {
    if (pollingIntervalRef.current !== null) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handleClose = () => {
    stopPolling();
    onClose();
  };

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (!isOpen) return null;

  return (
    <div className="momo-payment-modal-overlay" onClick={handleClose}>
      <div className="momo-payment-modal" onClick={(e) => e.stopPropagation()}>
        <button className="momo-payment-modal-close" onClick={handleClose}>
          <FiX />
        </button>

        {status === 'loading' && (
          <div className="momo-payment-loading">
            <div className="momo-payment-spinner">
              <FiLoader className="spinner-icon" />
            </div>
            <p className="momo-payment-loading-text">Đang khởi tạo thanh toán...</p>
          </div>
        )}

        {(status === 'qr' || status === 'polling') && paymentData && (
          <div className="momo-payment-qr-container">
            <h3 className="momo-payment-title">Thanh toán với Momo</h3>
            <p className="momo-payment-amount">{formatCurrency(amount)}</p>

            <div className="momo-payment-qr-code">
              {paymentData.qrCodeUrl ? (
                <img 
                  src={paymentData.qrCodeUrl} 
                  alt="Momo QR Code"
                  className="momo-qr-image"
                />
              ) : (
                <div className="momo-payment-spinner">
                  <FiLoader className="spinner-icon" />
                </div>
              )}
            </div>

            <p className="momo-payment-instructions">
              Mở ứng dụng Momo và quét mã QR để thanh toán
            </p>

            <a
              href={paymentData.paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="momo-payment-btn-open"
            >
              Mở ứng dụng Momo
            </a>

            {status === 'polling' && (
              <div className="momo-payment-polling-status">
                <div className="momo-payment-spinner-inline">
                  <FiLoader className="spinner-icon-small" />
                </div>
                <span>Đang chờ xác nhận thanh toán...</span>
              </div>
            )}

            <button onClick={handleClose} className="momo-payment-btn-cancel">
              Hủy
            </button>
          </div>
        )}

        {status === 'success' && (
          <div className="momo-payment-success">
            <div className="momo-payment-success-icon">
              <FiCheckCircle />
            </div>
            <h3 className="momo-payment-success-title">Thanh toán thành công!</h3>
            <p className="momo-payment-success-text">Đang chuyển hướng...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="momo-payment-error">
            <div className="momo-payment-error-icon">
              <FiAlertCircle />
            </div>
            <h3 className="momo-payment-error-title">Thanh toán thất bại</h3>
            <p className="momo-payment-error-text">{error}</p>
            <div className="momo-payment-error-actions">
              <button onClick={initiatePayment} className="momo-payment-btn-retry">
                Thử lại
              </button>
              <button onClick={handleClose} className="momo-payment-btn-close">
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomoPaymentModal;
