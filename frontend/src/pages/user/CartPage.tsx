import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { updateQuantity, removeFromCart, clearCart } from '@/features/cartSlice';
import './CartPage.css';

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items } = useAppSelector(s => s.cart);
  const { user } = useAppSelector(s => s.auth);

  const totalAmount = items.reduce((sum, ci) => {
    const price = ci.product.discountPrice || ci.product.price;
    return sum + price * ci.quantity;
  }, 0);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'momo'>('cod');
  const [address, setAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');
  const [completed, setCompleted] = useState(false);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setCompleted(true);
    dispatch(clearCart());
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Giỏ Hàng & Thanh Toán</h1>
          <p className="page-hero-sub">Xác nhận đơn hàng & thông tin giao nhận</p>
        </div>
      </div>

      <div className="container cart-layout">
        {completed ? (
          <div className="order-success-card">
            <FiCheckCircle className="success-icon" />
            <h2>Đặt Hàng Thành Công!</h2>
            <p>Mã đơn hàng: <strong>#MS-{Math.floor(100000 + Math.random() * 900000)}</strong></p>
            <p className="sub-text">Cảm ơn bạn đã mua hàng tại MotoShine. Đội ngũ cửa hàng sẽ gọi điện xác nhận đơn trong 15 phút.</p>
            <div className="success-btns">
              <Link to="/products" className="btn-continue">Tiếp Tục Mua Sắm</Link>
              <Link to="/account" className="btn-my-orders">Xem Đơn Hàng Của Tôi</Link>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-cart-card">
            <p>Giỏ hàng của bạn đang trống.</p>
            <Link to="/products" className="btn-shop-now">Khám Phá Cửa Hàng <FiArrowRight /></Link>
          </div>
        ) : (
          <>
            {/* Left: Cart items */}
            <div className="cart-items-col">
              <h3 className="section-title">Danh Sách Sản Phẩm ({items.length})</h3>
              <div className="cart-items-list">
                {items.map(ci => {
                  const price = ci.product.discountPrice || ci.product.price;
                  return (
                    <div key={ci.product.id} className="cart-item-row">
                      <img src={ci.product.images[0]} alt={ci.product.name} className="ci-img" />
                      <div className="ci-info">
                        <Link to={`/products/${ci.product.slug}`} className="ci-title">{ci.product.name}</Link>
                        <div className="ci-price">{fmt(price)}</div>
                      </div>
                      <div className="ci-qty">
                        <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: ci.product.id, quantity: ci.quantity - 1 }))}><FiMinus /></button>
                        <span>{ci.quantity}</span>
                        <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: ci.product.id, quantity: ci.quantity + 1 }))}><FiPlus /></button>
                      </div>
                      <div className="ci-subtotal">{fmt(price * ci.quantity)}</div>
                      <button className="ci-del" onClick={() => dispatch(removeFromCart(ci.product.id))}><FiTrash2 /></button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Checkout summary */}
            <div className="cart-summary-col">
              <div className="summary-card">
                <h3 className="summary-title">Thông Tin Giao Hàng & Thanh Toán</h3>
                <form onSubmit={handleCheckout} className="checkout-form">
                  <div className="form-group">
                    <label>Số điện thoại nhận hàng *</label>
                    <input type="tel" required placeholder="0901 234 567" value={phone} onChange={e => setPhone(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Địa chỉ giao hàng *</label>
                    <textarea rows={2} required placeholder="Số nhà, đường, phường/xã, quận/huyện..." value={address} onChange={e => setAddress(e.target.value)} />
                  </div>

                  <div className="form-group">
                    <label>Ghi chú đơn hàng</label>
                    <input type="text" placeholder="Giao giờ hành chính, gọi trước khi giao..." value={note} onChange={e => setNote(e.target.value)} />
                  </div>

                  {/* Payment method selector */}
                  <div className="form-group">
                    <label>Phương thức thanh toán</label>
                    <div className="payment-options">
                      <label className={`pay-opt ${paymentMethod === 'cod' ? 'active' : ''}`}>
                        <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} />
                        💵 Thanh toán khi nhận hàng (COD)
                      </label>
                      <label className={`pay-opt ${paymentMethod === 'bank' ? 'active' : ''}`}>
                        <input type="radio" name="payment" value="bank" checked={paymentMethod === 'bank'} onChange={() => setPaymentMethod('bank')} />
                        🏦 Chuyển khoản Ngân hàng (QR Code)
                      </label>
                      <label className={`pay-opt ${paymentMethod === 'momo' ? 'active' : ''}`}>
                        <input type="radio" name="payment" value="momo" checked={paymentMethod === 'momo'} onChange={() => setPaymentMethod('momo')} />
                        📱 Ví MoMo / ZaloPay
                      </label>
                    </div>
                  </div>

                  <div className="summary-total-block">
                    <div className="summary-row"><span>Tạm tính:</span><span>{fmt(totalAmount)}</span></div>
                    <div className="summary-row"><span>Phí vận chuyển:</span><span>Miễn phí</span></div>
                    <div className="summary-row total"><span>Tổng thanh toán:</span><strong>{fmt(totalAmount)}</strong></div>
                  </div>

                  <button type="submit" className="btn-place-order" id="place-order-btn">
                    Xác Nhận Đặt Hàng <FiArrowRight />
                  </button>
                </form>
              </div>
            </div>
          </>
        )}
      </div>
    </UserLayout>
  );
};

export default CartPage;
