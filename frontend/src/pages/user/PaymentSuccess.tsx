import React, { useEffect, useState } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiShoppingBag, FiArrowRight, FiPackage, FiDollarSign, FiCreditCard, FiMapPin } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import './PaymentSuccess.css';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<UserOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const orderId = searchParams.get('orderId');

  useEffect(() => {
    if (!orderId) {
      // If no orderId in URL, redirect to home after a short delay
      setTimeout(() => navigate('/'), 2000);
      return;
    }

    // Fetch order details from local storage
    const orders = orderStorage.getOrders();
    const foundOrder = orders.find(o => o.id === orderId);

    if (foundOrder) {
      setOrder(foundOrder);
    }
    setLoading(false);
  }, [orderId, navigate]);

  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(value);
  };

  if (loading) {
    return (
      <UserLayout>
        <div className="payment-success-page">
          <div className="container">
            <div className="payment-success-loading">
              <div className="loading-spinner" />
              <p>Đang tải thông tin đơn hàng...</p>
            </div>
          </div>
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="payment-success-page">
        <div className="container">
          <div className="payment-success-card">
            {/* Success Icon */}
            <div className="success-icon-wrapper">
              <div className="success-icon-circle">
                <FiCheckCircle className="success-icon" />
              </div>
              <div className="success-ripple" />
            </div>

            {/* Success Message */}
            <h1 className="success-title">Thanh Toán Thành Công! 🎉</h1>
            <p className="success-subtitle">
              Cảm ơn bạn đã thanh toán bằng Momo. Đơn hàng của bạn đang được xử lý.
            </p>

            {/* Order Details */}
            {order ? (
              <div className="order-details-section">
                <div className="order-info-card">
                  <div className="order-info-header">
                    <FiPackage className="order-icon" />
                    <h2>Thông Tin Đơn Hàng</h2>
                  </div>

                  <div className="order-info-grid">
                    <div className="order-info-row">
                      <span className="info-label">Mã đơn hàng:</span>
                      <span className="info-value order-id">#{order.id}</span>
                    </div>

                    <div className="order-info-row">
                      <span className="info-label">Ngày đặt:</span>
                      <span className="info-value">{order.date}</span>
                    </div>

                    <div className="order-info-row">
                      <span className="info-label">
                        <FiDollarSign className="inline-icon" />
                        Tổng tiền:
                      </span>
                      <span className="info-value total-amount">{formatCurrency(order.total)}</span>
                    </div>

                    <div className="order-info-row">
                      <span className="info-label">
                        <FiCreditCard className="inline-icon" />
                        Phương thức:
                      </span>
                      <span className="info-value payment-method">
                        {order.paymentMethod === 'momo' ? 'Ví MoMo' : order.paymentMethod}
                      </span>
                    </div>

                    <div className="order-info-row">
                      <span className="info-label">
                        <FiMapPin className="inline-icon" />
                        Địa chỉ nhận:
                      </span>
                      <span className="info-value">{order.address}</span>
                    </div>

                    <div className="order-info-row full-width">
                      <span className="info-label">Trạng thái thanh toán:</span>
                      <span className="info-value payment-status paid">
                        <FiCheckCircle className="status-icon" />
                        Đã thanh toán
                      </span>
                    </div>
                  </div>

                  {/* Order Items */}
                  {order.items && order.items.length > 0 && (
                    <div className="order-items-section">
                      <h3 className="items-title">Sản phẩm đã đặt:</h3>
                      <div className="order-items-list">
                        {order.items.map((item, index) => (
                          <div key={index} className="order-item">
                            {item.image && (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="item-image"
                              />
                            )}
                            <div className="item-details">
                              <div className="item-name">{item.name}</div>
                              <div className="item-meta">
                                {formatCurrency(item.price)} × {item.quantity}
                              </div>
                            </div>
                            <div className="item-subtotal">
                              {formatCurrency(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Next Steps Info */}
                <div className="next-steps-card">
                  <h3 className="next-steps-title">Các bước tiếp theo</h3>
                  <ul className="next-steps-list">
                    <li>Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 15 phút</li>
                    <li>Đơn hàng sẽ được đóng gói và giao trong 1-3 ngày làm việc</li>
                    <li>Bạn có thể theo dõi trạng thái đơn hàng trong tài khoản của mình</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="no-order-info">
                <p>Không tìm thấy thông tin đơn hàng. Vui lòng kiểm tra lại trong tài khoản của bạn.</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="success-actions">
              <Link to="/products" className="btn-continue-shopping">
                <FiShoppingBag />
                Tiếp Tục Mua Sắm
              </Link>
              <Link to="/account?tab=orders" className="btn-view-orders">
                Xem Đơn Hàng Của Tôi
                <FiArrowRight />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default PaymentSuccess;
