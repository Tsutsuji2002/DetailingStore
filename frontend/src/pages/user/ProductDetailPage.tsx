import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { addToCart } from '@/features/cartSlice';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { items, categories } = useAppSelector(s => s.products);
  const product = items.find(p => p.slug === slug);
  const [selectedImg, setSelectedImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  if (!product) return <UserLayout><div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}><h2>Sản phẩm không tồn tại.</h2><Link to="/products" className="back-btn">← Về cửa hàng</Link></div></UserLayout>;

  const cat = categories.find(c => c.id === product.categoryId);
  const price = product.discountPrice || product.price;
  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';
  const discount = product.discountPrice ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/products" className="back-link"><FiArrowLeft /> Cửa Hàng</Link>
          <h1 className="page-hero-title" style={{ fontSize: '1.75rem' }}>{product.name}</h1>
        </div>
      </div>
      <div className="container pd-layout">
        {/* Images */}
        <div className="pd-images">
          <div className="pd-main-img">
            <img src={product.images[selectedImg]} alt={product.name} />
            {discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
          </div>
          <div className="pd-thumbs">
            {product.images.map((img, i) => (
              <button key={i} className={`pd-thumb ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                <img src={img} alt="" />
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="pd-info">
          {product.brand && <div className="pd-brand">{product.brand}</div>}
          <h2 className="pd-title">{product.name}</h2>
          <div className="pd-rating">
            {Array.from({ length: 5 }).map((_, i) => <FiStar key={i} className={i < Math.floor(product.rating) ? 'star-filled' : 'star-empty'} />)}
            <span>{product.rating} ({product.reviewCount} đánh giá)</span>
          </div>
          <div className="pd-price-box">
            <div className="pd-price-current">{fmt(price)}</div>
            {product.discountPrice && <div className="pd-price-original">{fmt(product.price)}</div>}
          </div>
          <p className="pd-short-desc">{product.shortDescription}</p>
          <div className="pd-stock">{product.stock > 0 ? <><FiCheckCircle className="in-stock-icon" /> Còn hàng ({product.stock} sản phẩm)</> : 'Hết hàng'}</div>
          <div className="pd-qty-row">
            <span className="pd-qty-label">Số lượng:</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus /></button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock, q + 1))}><FiPlus /></button>
            </div>
          </div>
          <button className={`pd-add-btn ${added ? 'added' : ''}`} onClick={handleAddToCart} disabled={product.stock === 0} id="pd-add-to-cart">
            <FiShoppingCart /> {added ? '✓ Đã Thêm Vào Giỏ!' : 'Thêm Vào Giỏ Hàng'}
          </button>
          <div className="pd-tags">
            {product.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
          </div>
        </div>

        {/* Description */}
        <div className="pd-desc">
          <h3>Mô Tả Sản Phẩm</h3>
          <div className="pd-desc-content">{product.description}</div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductDetailPage;
