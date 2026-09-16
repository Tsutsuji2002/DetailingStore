import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiStar, FiShoppingCart, FiMinus, FiPlus, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppSelector, useAppDispatch } from '@/hooks/useAppStore';
import { addToCart } from '@/features/cartSlice';
import { fetchProductsThunk, fetchCategoriesThunk } from '@/features/productsSlice';
import { productApi } from '@/services/api/productApi';
import type { Product } from '@/types';
import { useToast } from '@/context/ToastContext';
import './ProductDetailPage.css';

const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const dispatch = useAppDispatch();
  const { showAddToCartToast } = useToast();
  const { items } = useAppSelector(s => s.products);

  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedImg, setSelectedImg] = useState<number>(0);
  const [qty, setQty] = useState<number>(1);
  const [added, setAdded] = useState<boolean>(false);

  useEffect(() => {
    dispatch(fetchProductsThunk());
    dispatch(fetchCategoriesThunk());
  }, [dispatch]);

  // Find product in Redux store or fetch directly from API
  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const found = items.find(p => p.slug === slug || p.id === slug);
    if (found) {
      setDirectProduct(found);
      setLoading(false);
    } else {
      setLoading(true);
      productApi.getProductByIdOrSlug(slug)
        .then(res => {
          if (res) {
            setDirectProduct({
              id: res.id,
              categoryId: res.categoryId,
              name: res.name,
              slug: res.slug,
              brand: res.brand || 'Chính hãng',
              shortDescription: res.shortDescription || '',
              description: res.description || '',
              price: res.price || 0,
              discountPrice: res.discountPrice,
              stock: res.stock || 0,
              images: res.images && res.images.length > 0 ? res.images : ['https://placehold.co/600x400/1e293b/94a3b8?text=Product+Image'],
              rating: res.rating || 5.0,
              reviewCount: res.reviewCount || 0,
              tags: ['san-pham'],
              isActive: res.isActive ?? true,
              createdAt: res.createdAt || new Date().toISOString()
            });
          } else {
            setDirectProduct(null);
          }
        })
        .catch((err) => {
          console.warn('Cannot fetch product detail:', err);
          setDirectProduct(null);
        })
        .finally(() => setLoading(false));
    }
  }, [slug]);

  const product = directProduct || items.find(p => p.slug === slug || p.id === slug);

  if (loading) {
    return (
      <UserLayout>
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div className="skeleton" style={{ width: 80, height: 80, borderRadius: '50%', margin: '0 auto 1rem' }} />
          <h3>Đang tải thông tin sản phẩm...</h3>
        </div>
      </UserLayout>
    );
  }

  if (!product) {
    return (
      <UserLayout>
        <div className="container" style={{ padding: '5rem 0', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem' }}>Sản phẩm không tồn tại hoặc đã bị gỡ.</h2>
          <Link to="/products" className="back-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--accent-primary)', color: 'white', borderRadius: 10, fontWeight: 700 }}>
            <FiArrowLeft /> Quay về cửa hàng
          </Link>
        </div>
      </UserLayout>
    );
  }

  const price = product.discountPrice || product.price || 0;
  const fmt = (n: number | undefined) => typeof n === 'number' ? n.toLocaleString('vi-VN') + '₫' : '0₫';
  const discount = (product.discountPrice && product.price) ? Math.round((1 - product.discountPrice / product.price) * 100) : 0;
  const productImages = product.images && product.images.length > 0 ? product.images : ['https://placehold.co/600x400/1e293b/94a3b8?text=Product+Image'];

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) dispatch(addToCart(product));
    showAddToCartToast(`${product.name} (x${qty})`, productImages[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/products" className="back-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
            <FiArrowLeft /> Cửa Hàng
          </Link>
          <h1 className="page-hero-title" style={{ fontSize: '1.75rem' }}>{product.name}</h1>
        </div>
      </div>
      <div className="container pd-layout">
        {/* Images */}
        <div className="pd-images">
          <div className="pd-main-img">
            <img src={productImages[selectedImg] || productImages[0]} alt={product.name} />
            {discount > 0 && <span className="pd-discount-badge">-{discount}%</span>}
          </div>
          {productImages.length > 1 && (
            <div className="pd-thumbs">
              {productImages.map((img: string, i: number) => (
                <button key={i} className={`pd-thumb ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="pd-info">
          {product.brand && <div className="pd-brand">{product.brand}</div>}
          <h2 className="pd-title">{product.name}</h2>
          <div className="pd-rating">
            {Array.from({ length: 5 }).map((_, i: number) => (
              <FiStar key={i} className={i < Math.floor(product.rating || 5) ? 'star-filled' : 'star-empty'} />
            ))}
            <span>{product.rating || 5.0} ({product.reviewCount || 0} đánh giá)</span>
          </div>
          <div className="pd-price-box">
            <div className="pd-price-current">{fmt(price)}</div>
            {product.discountPrice && <div className="pd-price-original">{fmt(product.price)}</div>}
          </div>
          <p className="pd-short-desc">{product.shortDescription || 'Sản phẩm phụ tùng xe máy chính hãng chất lượng cao.'}</p>
          <div className="pd-stock">{product.stock > 0 ? <><FiCheckCircle className="in-stock-icon" /> Còn hàng ({product.stock} sản phẩm)</> : 'Hết hàng'}</div>
          <div className="pd-qty-row">
            <span className="pd-qty-label">Số lượng:</span>
            <div className="qty-controls">
              <button className="qty-btn" onClick={() => setQty(q => Math.max(1, q - 1))}><FiMinus /></button>
              <span className="qty-value">{qty}</span>
              <button className="qty-btn" onClick={() => setQty(q => Math.min(product.stock || 99, q + 1))}><FiPlus /></button>
            </div>
          </div>
          <button className={`pd-add-btn ${added ? 'added' : ''}`} onClick={handleAddToCart} disabled={product.stock === 0} id="pd-add-to-cart">
            <FiShoppingCart /> {added ? '✓ Đã Thêm Vào Giỏ!' : 'Thêm Vào Giỏ Hàng'}
          </button>
          {product.tags && product.tags.length > 0 && (
            <div className="pd-tags">
              {product.tags.map((t: string) => <span key={t} className="tag-chip">#{t}</span>)}
            </div>
          )}
        </div>

        {/* Description */}
        <div className="pd-desc">
          <h3>Mô Tả Sản Phẩm</h3>
          <div className="pd-desc-content">{product.description || product.shortDescription || 'Chưa có thông tin mô tả chi tiết cho sản phẩm này.'}</div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductDetailPage;
