import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiTrash2, FiMinus, FiPlus, FiArrowRight, FiCheckCircle, 
  FiShoppingBag, FiTruck, FiShield, FiLock, FiTag, 
  FiCreditCard, FiSmartphone, FiDollarSign, FiUser, FiPhone, FiMapPin, FiFileText, FiBookmark 
} from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { updateQuantity, removeFromCart, clearCart } from '@/features/cartSlice';
import { useToast } from '@/context/ToastContext';
import type { UserAddress } from '@/types';
import { getSavedAddresses, saveAddress, formatFullAddress } from '@/utils/addressStorage';
import { orderStorage, type UserOrder } from '@/utils/orderStorage';
import { productStorage } from '@/utils/productStorage';
import { fetchProductsThunk } from '@/features/productsSlice';
import { useVNAddress } from '@/hooks/useVNAddress';
import MomoPaymentModal from '@/components/payment/MomoPaymentModal';
import './CartPage.css';

const FREE_SHIPPING_THRESHOLD = 500000;

const CartPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { showRemoveFromCartToast, showToast } = useToast();
  const { items } = useAppSelector(s => s.cart);
  const { user } = useAppSelector(s => s.auth);

  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank' | 'momo'>('cod');
  const [fullName, setFullName] = useState(user?.fullName || `${user?.lastName || ''} ${user?.firstName || ''}`.trim() || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [note, setNote] = useState('');

  // Structured VN address fields & Cascading Hook
  const vnAddr = useVNAddress();
  const [streetAddress, setStreetAddress] = useState('');

  // Saved address selector
  const [savedAddresses, setSavedAddresses] = useState<UserAddress[]>([]);
  const [selectedAddrId, setSelectedAddrId] = useState<string | null>(null);
  const [saveNewAddress, setSaveNewAddress] = useState(false);

  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percent: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<{ id: string; total: number } | null>(null);
  
  // Momo payment modal state
  const [isMomoModalOpen, setIsMomoModalOpen] = useState(false);
  const [selectedOrderIdForPayment, setSelectedOrderIdForPayment] = useState<string | null>(null);

  useEffect(() => {
    const addrs = getSavedAddresses(user?.id);
    setSavedAddresses(addrs);
    const defaultAddr = addrs.find(a => a.isDefault);
    if (defaultAddr) {
      applyAddress(defaultAddr);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const applyAddress = (addr: UserAddress) => {
    setSelectedAddrId(addr.id);
    setFullName(addr.receiverName || '');
    setPhone(addr.phone || '');
    setStreetAddress(addr.streetAddress || '');
    setSaveNewAddress(false);
    vnAddr.setByName(addr.province || '', addr.district || '', addr.ward || '');
  };

  const handleSelectSavedAddr = (addr: UserAddress) => {
    applyAddress(addr);
  };

  const handleManualEntry = () => {
    setSelectedAddrId(null);
    setSaveNewAddress(false);
  };

  const rawTotal = items.reduce((sum, ci) => {
    const price = ci.product.discountPrice || ci.product.price;
    return sum + price * ci.quantity;
  }, 0);

  const discountAmount = appliedDiscount ? Math.round(rawTotal * (appliedDiscount.percent / 100)) : 0;
  const isFreeShipping = rawTotal >= FREE_SHIPPING_THRESHOLD || rawTotal === 0;
  const shippingFee = isFreeShipping ? 0 : 30000;
  const finalTotal = Math.max(0, rawTotal - discountAmount + shippingFee);
  const shippingProgress = Math.min(100, Math.round((rawTotal / FREE_SHIPPING_THRESHOLD) * 100));
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - rawTotal);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'MOTOSHINE10' || code === 'CHAOCHUBAC') {
      setAppliedDiscount({ code, percent: 10 });
      showToast({ type: 'success', title: 'Áp dụng mã thành công!', subtitle: 'Giảm 10% cho toàn bộ đơn hàng' });
    } else if (code === 'VIP20') {
      setAppliedDiscount({ code, percent: 20 });
      showToast({ type: 'success', title: 'Áp dụng mã thành công!', subtitle: 'Giảm 20% ưu đãi thành viên VIP' });
    } else {
      showToast({ type: 'delete', title: 'Mã không hợp lệ', subtitle: 'Thử lại với MOTOSHINE10 hoặc VIP20' });
    }
  };

  const handleUpdateQty = (name: string, id: string, newQty: number) => {
    if (newQty <= 0) showRemoveFromCartToast(name);
    dispatch(updateQuantity({ id, quantity: newQty }));
  };

  const handleRemoveItem = (name: string, id: string) => {
    dispatch(removeFromCart(id));
    showRemoveFromCartToast(name);
  };

  const handleClearAll = () => {
    if (window.confirm('Bạn có chắc muốn xóa tất cả sản phẩm khỏi giỏ hàng?')) {
      dispatch(clearCart());
      showToast({ type: 'info', title: 'Đã làm trống giỏ hàng' });
    }
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    // Save new address if user opts in
    const full = vnAddr.getFullAddress();
    if (saveNewAddress && !selectedAddrId && fullName && phone && full.province && full.district && full.ward && streetAddress) {
      const result = saveAddress({
        label: 'Địa chỉ mới',
        receiverName: fullName,
        phone,
        province: full.province,
        district: full.district,
        ward: full.ward,
        streetAddress,
        isDefault: savedAddresses.length === 0,
      }, user?.id);
      setSavedAddresses(result.addresses);
      showToast({ type: 'success', title: 'Đã lưu địa chỉ mới vào Sổ Địa Chỉ!' });
    }

    setIsSubmitting(true);
    setTimeout(() => {
      const orderId = `61-${Math.floor(100000 + Math.random() * 900000)}`;
      const full = vnAddr.getFullAddress();
      const fullAddrStr = [streetAddress, full.ward, full.district, full.province].filter(Boolean).join(', ');

      const orderItems = items.map(i => ({ id: i.product.id, name: i.product.name, price: i.product.price, quantity: i.quantity, image: i.product.images?.[0] }));

      const newOrder: UserOrder = {
        id: orderId,
        date: new Date().toISOString().split('T')[0],
        customerName: fullName || user?.fullName || 'Khách hàng',
        phone: phone,
        address: fullAddrStr,
        items: orderItems,
        itemsSummary: items.map(i => `${i.product.name} (x${i.quantity})`).join(', '),
        total: finalTotal,
        paymentMethod: paymentMethod,
        status: 'Đang xử lý',
        createdAt: new Date().toISOString(),
        isPaid: false, // Initially unpaid for all payment methods
      };

      orderStorage.saveOrder(newOrder);
      // Deduct stock for ordered items
      productStorage.deductStock(orderItems);
      dispatch(fetchProductsThunk());

      setCompletedOrder({ id: orderId, total: finalTotal });
      setIsSubmitting(false);
      dispatch(clearCart());

      // If payment method is Momo, open the payment modal
      if (paymentMethod === 'momo') {
        setSelectedOrderIdForPayment(orderId);
        setIsMomoModalOpen(true);
      }
    }, 1000);
  };

  return (
    <UserLayout>
      <div className="checkout-page-wrapper">
        {/* Step Indicator Header */}
        <div className="checkout-steps-bar">
          <div className="container">
            <div className="checkout-steps">
              <div className={`step-item ${!completedOrder ? 'active' : 'completed'}`}>
                <span className="step-num">1</span>
                <span className="step-label">Giỏ Hàng & Sản Phẩm</span>
              </div>
              <div className="step-divider" />
              <div className={`step-item ${!completedOrder ? 'active' : 'completed'}`}>
                <span className="step-num">2</span>
                <span className="step-label">Thông Tin Giao Hàng</span>
              </div>
              <div className="step-divider" />
              <div className={`step-item ${completedOrder ? 'active completed' : ''}`}>
                <span className="step-num">3</span>
                <span className="step-label">Hoàn Tất Đặt Hàng</span>
              </div>
            </div>
          </div>
        </div>

        <div className="container cart-layout-container">
          {completedOrder ? (
            /* Order Success View */
            <div className="order-success-card">
              <div className="success-icon-wrap">
                <FiCheckCircle className="success-icon" />
              </div>
              <h2 className="success-title">Đặt Hàng Thành Công! 🎉</h2>
              <p className="success-order-id">
                Mã đơn hàng: <strong>#{completedOrder.id}</strong>
              </p>
              <p className="success-desc">
                Cảm ơn bạn <strong>{fullName || 'quý khách'}</strong> đã mua sắm tại <strong>61 Team Detailing</strong>. 
                Chúng tôi đã tiếp nhận đơn hàng trị giá <strong>{fmt(completedOrder.total)}</strong> và sẽ liên hệ xác nhận trong 15 phút.
              </p>

              <div className="order-details-recap">
                <div className="recap-item">
                  <FiMapPin className="recap-icon" />
                  <div>
                    <span className="recap-label">Địa chỉ nhận hàng:</span>
                    <strong className="recap-val">{[streetAddress, vnAddr.selectedWard?.name, vnAddr.selectedDistrict?.name, vnAddr.selectedProvince?.name].filter(Boolean).join(', ') || '—'}</strong>
                  </div>
                </div>
                <div className="recap-item">
                  <FiPhone className="recap-icon" />
                  <div>
                    <span className="recap-label">Số điện thoại liên hệ:</span>
                    <strong className="recap-val">{phone}</strong>
                  </div>
                </div>
                <div className="recap-item">
                  <FiDollarSign className="recap-icon" />
                  <div>
                    <span className="recap-label">Phương thức thanh toán:</span>
                    <strong className="recap-val">
                      {paymentMethod === 'cod' && 'Thanh toán khi nhận hàng (COD)'}
                      {paymentMethod === 'bank' && 'Chuyển khoản Ngân hàng (VietQR Code)'}
                      {paymentMethod === 'momo' && 'Ví MoMo / ZaloPay'}
                    </strong>
                  </div>
                </div>
              </div>

              {/* Payment status and Momo button */}
              {paymentMethod === 'momo' && (
                <div className="payment-status-section" style={{ margin: '20px 0' }}>
                  {orderStorage.getOrders().find(o => o.id === completedOrder.id)?.isPaid ? (
                    <div className="paid-status-badge" style={{ 
                      display: 'inline-flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '10px 20px', 
                      backgroundColor: '#4caf50', 
                      color: 'white', 
                      borderRadius: '8px',
                      fontWeight: 'bold'
                    }}>
                      <FiCheckCircle size={20} />
                      <span>Đã thanh toán</span>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedOrderIdForPayment(completedOrder.id);
                        setIsMomoModalOpen(true);
                      }}
                      className="btn-pay-with-momo"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '12px 24px',
                        backgroundColor: '#d82d8b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                      }}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#b8256f'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#d82d8b'}
                    >
                      <FiSmartphone size={20} />
                      <span>Thanh toán với Momo</span>
                    </button>
                  )}
                </div>
              )}

              <div className="success-btns">
                <Link to="/products" className="btn-continue">
                  <FiShoppingBag /> Tiếp Tục Mua Sắm
                </Link>
                <Link to="/account?tab=orders" className="btn-my-orders">
                  Xem Đơn Hàng Của Tôi
                </Link>
              </div>
            </div>
          ) : items.length === 0 ? (
            /* Empty Cart View */
            <div className="empty-cart-card">
              <div className="empty-icon-wrap">
                <FiShoppingBag size={56} />
              </div>
              <h2>Giỏ hàng của bạn đang trống</h2>
              <p>Chưa có sản phẩm nào được chọn. Hãy khám phá kho phụ tùng & phụ kiện xe máy chính hãng của 61 Team ngay!</p>
              <Link to="/products" className="btn-shop-now">
                Khám Phá Cửa Hàng <FiArrowRight />
              </Link>
            </div>
          ) : (
            /* Main Cart & Checkout Grid */
            <div className="cart-grid">
              {/* Left Column: Product Items & Coupon */}
              <div className="cart-left-col">
                {/* Free Shipping Progress */}
                <div className="free-shipping-card">
                  <div className="shipping-info-head">
                    <FiTruck className="truck-icon" />
                    <span>
                      {isFreeShipping ? (
                        <strong className="text-success">🎉 Bạn đủ điều kiện Miễn Phí Vận Chuyển toàn quốc!</strong>
                      ) : (
                        <>Mua thêm <strong>{fmt(remainingForFreeShipping)}</strong> để được <strong>Miễn Phí Vận Chuyển</strong></>
                      )}
                    </span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${shippingProgress}%` }} />
                  </div>
                </div>

                {/* Items Container */}
                <div className="cart-items-card">
                  <div className="items-card-header">
                    <h3>
                      Sản Phẩm Trong Giỏ <span>({items.length})</span>
                    </h3>
                    <button className="btn-clear-all" onClick={handleClearAll}>
                      <FiTrash2 /> Xóa tất cả
                    </button>
                  </div>

                  <div className="items-list">
                    {items.map(ci => {
                      const unitPrice = ci.product.discountPrice || ci.product.price;
                      const hasDiscount = !!ci.product.discountPrice;
                      const discountPct = hasDiscount ? Math.round((1 - ci.product.discountPrice! / ci.product.price) * 100) : 0;

                      return (
                        <div key={ci.product.id} className="cart-item-card">
                          <Link to={`/products/${ci.product.slug || ci.product.id}`} className="item-thumb-wrap">
                            <img src={ci.product.images[0]} alt={ci.product.name} className="item-thumb" />
                            {hasDiscount && <span className="item-discount-tag">-{discountPct}%</span>}
                          </Link>

                          <div className="item-details">
                            {ci.product.brand && <span className="item-brand">{ci.product.brand}</span>}
                            <Link to={`/products/${ci.product.slug || ci.product.id}`} className="item-name">
                              {ci.product.name}
                            </Link>

                            <div className="item-price-unit">
                              <span className="unit-current">{fmt(unitPrice)}</span>
                              {hasDiscount && <span className="unit-original">{fmt(ci.product.price)}</span>}
                            </div>
                          </div>

                          <div className="item-actions">
                            <div className="qty-stepper">
                              <button
                                className="qty-btn"
                                onClick={() => handleUpdateQty(ci.product.name, ci.product.id, ci.quantity - 1)}
                                title="Giảm số lượng"
                              >
                                <FiMinus />
                              </button>
                              <span className="qty-num">{ci.quantity}</span>
                              <button
                                className="qty-btn"
                                onClick={() => handleUpdateQty(ci.product.name, ci.product.id, ci.quantity + 1)}
                                title="Tăng số lượng"
                              >
                                <FiPlus />
                              </button>
                            </div>

                            <div className="item-subtotal-block">
                              <span className="subtotal-label">Thành tiền:</span>
                              <span className="subtotal-val">{fmt(unitPrice * ci.quantity)}</span>
                            </div>

                            <button
                              className="item-delete-btn"
                              onClick={() => handleRemoveItem(ci.product.name, ci.product.id)}
                              title="Xóa sản phẩm"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Promo Code Box */}
                <div className="promo-card">
                  <div className="promo-header">
                    <FiTag className="promo-icon" />
                    <span>Mã Giảm Giá / Voucher Ưu Đãi</span>
                  </div>
                  <form onSubmit={handleApplyPromo} className="promo-form">
                    <input
                      type="text"
                      placeholder="Nhập mã giảm giá..."
                      value={promoCode}
                      onChange={e => setPromoCode(e.target.value)}
                      className="promo-input"
                    />
                    <button type="submit" className="promo-apply-btn">
                      Áp Dụng
                    </button>
                  </form>
                  {appliedDiscount && (
                    <div className="applied-promo-badge">
                      <span>✓ Đã áp dụng mã <strong>{appliedDiscount.code}</strong> (-{appliedDiscount.percent}%)</span>
                      <button onClick={() => setAppliedDiscount(null)}>Xóa</button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Checkout Form & Summary */}
              <div className="cart-right-col">
                <div className="summary-checkout-card">
                  <h3 className="checkout-title">
                    <FiFileText className="title-icon" /> Thông Tin Nhận Hàng & Thanh Toán
                  </h3>

                  <form onSubmit={handleCheckout} className="checkout-form">
                    {/* Receiver Info */}
                    <div className="form-section">
                      {/* Saved Address Selector */}
                      {savedAddresses.length > 0 && (
                        <div className="saved-addr-section">
                          <div className="saved-addr-header">
                            <FiBookmark className="saved-addr-icon" />
                            <span>Chọn địa chỉ đã lưu</span>
                          </div>
                          <div className="saved-addr-list">
                            {savedAddresses.map(addr => (
                              <div
                                key={addr.id}
                                className={`saved-addr-card ${selectedAddrId === addr.id ? 'selected' : ''}`}
                                onClick={() => handleSelectSavedAddr(addr)}
                              >
                                <div className="saved-addr-top">
                                  <span className="saved-addr-label">{addr.label || 'Địa chỉ'}</span>
                                  {addr.isDefault && <span className="saved-addr-default-dot">●</span>}
                                </div>
                                <div className="saved-addr-name">{addr.receiverName}</div>
                                <div className="saved-addr-text">{formatFullAddress(addr)}</div>
                              </div>
                            ))}
                            <div
                              className={`saved-addr-card manual-entry ${!selectedAddrId ? 'selected' : ''}`}
                              onClick={handleManualEntry}
                            >
                              <div className="saved-addr-name">+ Nhập địa chỉ khác</div>
                              <div className="saved-addr-text">Điền thông tin thủ công bên dưới</div>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label">
                          <FiUser /> Họ và tên người nhận *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Họ và tên người nhận"
                          value={fullName}
                          onChange={e => setFullName(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">
                          <FiPhone /> Số điện thoại nhận hàng *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="Số điện thoại nhận hàng"
                          value={phone}
                          onChange={e => setPhone(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      {/* Vietnamese cascading administrative dropdowns */}
                      <div className="addr-row-2col">
                        <div className="form-group">
                          <label className="form-label">
                            <FiMapPin /> Tỉnh / Thành phố *
                          </label>
                          <select
                            className="form-input"
                            value={vnAddr.selectedProvince?.code || ''}
                            onChange={e => vnAddr.selectProvince(e.target.value)}
                            disabled={vnAddr.loadingProvinces}
                            style={{ cursor: 'pointer' }}
                          >
                            {vnAddr.loadingProvinces && <option value="">Đang tải Tỉnh/Thành...</option>}
                            {!vnAddr.loadingProvinces && vnAddr.provinces.map(p => (
                              <option key={p.code} value={p.code}>{p.name}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Phường / Xã / Thị trấn *</label>
                          <select
                            className="form-input"
                            value={vnAddr.selectedWard?.code || ''}
                            onChange={e => vnAddr.selectWard(e.target.value)}
                            disabled={vnAddr.loadingWards || !vnAddr.selectedProvince}
                            style={{ cursor: 'pointer' }}
                          >
                            <option value="">{vnAddr.loadingWards ? 'Đang tải Phường/Xã...' : '-- Chọn Phường / Xã / Thị trấn --'}</option>
                            {vnAddr.wards.map(w => (
                              <option key={w.code} value={w.code}>{w.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Số nhà, tên đường, tòa nhà / căn hộ *</label>
                        <input
                          type="text"
                          required
                          placeholder="Số nhà, tên đường, tòa nhà / căn hộ..."
                          value={streetAddress}
                          onChange={e => setStreetAddress(e.target.value)}
                          className="form-input"
                        />
                      </div>

                      {/* Save Address Checkbox (only when NOT using a saved address) */}
                      {!selectedAddrId && (
                        <label className="save-addr-checkbox-label">
                          <input
                            type="checkbox"
                            checked={saveNewAddress}
                            onChange={e => setSaveNewAddress(e.target.checked)}
                          />
                          <FiBookmark style={{ fontSize: '0.9rem' }} />
                          Lưu địa chỉ này vào Sổ Địa Chỉ của tôi
                        </label>
                      )}

                      <div className="form-group">
                        <label className="form-label">Ghi chú cho đơn hàng</label>
                        <input
                          type="text"
                          placeholder="Ghi chú thêm cho đơn hàng (không bắt buộc)..."
                          value={note}
                          onChange={e => setNote(e.target.value)}
                          className="form-input"
                        />
                      </div>
                    </div>

                    {/* Payment Method Selector */}
                    <div className="payment-section">
                      <label className="form-label">Hình thức thanh toán</label>
                      <div className="payment-cards-grid">
                        <div
                          className={`payment-card ${paymentMethod === 'cod' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('cod')}
                        >
                          <div className="pay-card-head">
                            <FiDollarSign className="pay-icon cod" />
                            <strong>Thanh toán COD</strong>
                          </div>
                          <p className="pay-card-sub">Thanh toán tiền mặt khi nhận hàng</p>
                        </div>

                        <div
                          className={`payment-card ${paymentMethod === 'bank' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('bank')}
                        >
                          <div className="pay-card-head">
                            <FiCreditCard className="pay-icon bank" />
                            <strong>Chuyển Khoản QR</strong>
                          </div>
                          <p className="pay-card-sub">Quét mã VietQR nhận hàng nhanh</p>
                        </div>

                        <div
                          className={`payment-card ${paymentMethod === 'momo' ? 'selected' : ''}`}
                          onClick={() => setPaymentMethod('momo')}
                        >
                          <div className="pay-card-head">
                            <FiSmartphone className="pay-icon momo" />
                            <strong>Ví MoMo / ZaloPay</strong>
                          </div>
                          <p className="pay-card-sub">Thanh toán qua ví điện tử tiện lợi</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Price Breakdown */}
                    <div className="order-price-summary">
                      <div className="summary-line">
                        <span>Tạm tính ({items.length} sản phẩm):</span>
                        <strong>{fmt(rawTotal)}</strong>
                      </div>

                      {appliedDiscount && (
                        <div className="summary-line text-success">
                          <span>Giảm giá ({appliedDiscount.code}):</span>
                          <strong>-{fmt(discountAmount)}</strong>
                        </div>
                      )}

                      <div className="summary-line">
                        <span>Phí vận chuyển:</span>
                        <span>{isFreeShipping ? <strong className="text-success">Miễn phí</strong> : fmt(shippingFee)}</span>
                      </div>

                      <div className="summary-line total-line">
                        <span>Tổng Thanh Toán:</span>
                        <strong className="grand-total-price">{fmt(finalTotal)}</strong>
                      </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="trust-badges-row">
                      <div className="trust-badge">
                        <FiLock /> <span>Bảo mật SSL 100%</span>
                      </div>
                      <div className="trust-badge">
                        <FiShield /> <span>Chính hãng 61 Team</span>
                      </div>
                      <div className="trust-badge">
                        <FiTruck /> <span>Giao hàng toàn quốc</span>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-place-order"
                      id="place-order-btn"
                    >
                      {isSubmitting ? 'ĐANG XỬ LÝ ĐƠN HÀNG...' : <>XÁC NHẬN ĐẶT HÀNG <FiArrowRight /></>}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Momo Payment Modal */}
      <MomoPaymentModal
        isOpen={isMomoModalOpen}
        onClose={() => setIsMomoModalOpen(false)}
        orderId={selectedOrderIdForPayment || undefined}
        amount={finalTotal}
      />
    </UserLayout>
  );
};

export default CartPage;
