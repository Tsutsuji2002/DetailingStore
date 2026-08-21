import React from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiShoppingCart, FiTrash2, FiPlus, FiMinus } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { toggleCart, removeFromCart, updateQuantity } from '@/features/cartSlice';
import './CartDrawer.css';

const CartDrawer: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, isOpen } = useAppSelector(s => s.cart);

  const subtotal = items.reduce((acc, i) => acc + (i.product.discountPrice || i.product.price) * i.quantity, 0);
  const totalQty = items.reduce((acc, i) => acc + i.quantity, 0);

  if (!isOpen) return null;

  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

  return (
    <>
      <div className="cart-overlay" onClick={() => dispatch(toggleCart())} />
      <div className="cart-drawer">
        <div className="cart-drawer-header">
          <div className="cart-title-row">
            <FiShoppingCart />
            <span>Giỏ Hàng</span>
            {totalQty > 0 && <span className="cart-count-badge">{totalQty}</span>}
          </div>
          <button className="cart-close" onClick={() => dispatch(toggleCart())}><FiX /></button>
        </div>

        <div className="cart-items">
          {items.length === 0 ? (
            <div className="cart-empty">
              <FiShoppingCart size={48} />
              <p>Giỏ hàng của bạn đang trống.</p>
              <Link to="/products" className="btn-primary" onClick={() => dispatch(toggleCart())}>Xem Sản Phẩm</Link>
            </div>
          ) : (
            items.map(item => (
              <div key={item.product.id} className="cart-item">
                <img src={item.product.images[0]} alt={item.product.name} className="cart-item-img" />
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.product.name}</div>
                  <div className="cart-item-price">{fmt(item.product.discountPrice || item.product.price)}</div>
                  <div className="cart-item-qty">
                    <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity - 1 }))}><FiMinus /></button>
                    <span>{item.quantity}</span>
                    <button className="qty-btn" onClick={() => dispatch(updateQuantity({ id: item.product.id, quantity: item.quantity + 1 }))}><FiPlus /></button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => dispatch(removeFromCart(item.product.id))}><FiTrash2 /></button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-footer">
            <div className="cart-subtotal">
              <span>Tạm tính ({totalQty} sản phẩm)</span>
              <strong>{fmt(subtotal)}</strong>
            </div>
            <Link to="/cart" className="btn-primary btn-full" onClick={() => dispatch(toggleCart())}>Tiến Hành Thanh Toán</Link>
            <button className="btn-outline btn-full" onClick={() => dispatch(toggleCart())}>Tiếp Tục Mua Sắm</button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
