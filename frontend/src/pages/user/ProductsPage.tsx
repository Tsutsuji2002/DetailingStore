import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiStar, FiShoppingCart, FiFilter } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { setCategory, setSearch, setSort } from '@/features/productsSlice';
import { addToCart } from '@/features/cartSlice';
import './ProductsPage.css';

const ProductsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories, selectedCategory, searchQuery, sortBy } = useAppSelector(s => s.products);

  const filtered = useMemo(() => {
    let list = [...items].filter(p => p.isActive);
    if (selectedCategory !== 'all') list = list.filter(p => p.categoryId === selectedCategory);
    if (searchQuery) list = list.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || (p.brand || '').toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [items, selectedCategory, searchQuery, sortBy]);

  const fmt = (n: number) => n.toLocaleString('vi-VN') + '₫';

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Cửa Hàng</h1>
          <p className="page-hero-sub">Phụ tùng & phụ kiện xe máy chính hãng</p>
        </div>
      </div>

      <div className="container products-layout">
        {/* Sidebar filters */}
        <aside className="products-sidebar">
          <div className="sidebar-section">
            <h4 className="sidebar-section-title">Danh Mục</h4>
            <ul className="category-list">
              <li>
                <button className={`cat-item ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => dispatch(setCategory('all'))}>
                  🏍️ Tất Cả <span className="cat-count">{items.length}</span>
                </button>
              </li>
              {categories.map(c => (
                <li key={c.id}>
                  <button className={`cat-item ${selectedCategory === c.id ? 'active' : ''}`} onClick={() => dispatch(setCategory(c.id))}>
                    {c.name} <span className="cat-count">{items.filter(p => p.categoryId === c.id).length}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Main content */}
        <div className="products-main">
          <div className="products-toolbar">
            <div className="search-box">
              <FiSearch className="search-icon" />
              <input type="text" placeholder="Tìm sản phẩm, thương hiệu..." value={searchQuery} onChange={e => dispatch(setSearch(e.target.value))} id="product-search" />
            </div>
            <div className="sort-select-wrap">
              <FiFilter />
              <select value={sortBy} onChange={e => dispatch(setSort(e.target.value as any))} id="product-sort">
                <option value="newest">Mới Nhất</option>
                <option value="price-asc">Giá Tăng</option>
                <option value="price-desc">Giá Giảm</option>
                <option value="rating">Đánh Giá</option>
                <option value="name">Tên A–Z</option>
              </select>
            </div>
          </div>
          <div className="results-count">Tìm thấy <strong>{filtered.length}</strong> sản phẩm</div>

          <div className="products-grid">
            {filtered.length === 0 ? (
              <div className="empty-state"><p>Không tìm thấy sản phẩm.</p></div>
            ) : filtered.map(p => {
              const hasDiscount = !!p.discountPrice;
              const discount = hasDiscount ? Math.round((1 - p.discountPrice! / p.price) * 100) : 0;
              return (
                <div key={p.id} className="product-card">
                  <Link to={`/products/${p.slug}`} className="product-card-img">
                    <img src={p.images[0]} alt={p.name} />
                    {hasDiscount && <span className="discount-badge">-{discount}%</span>}
                    {p.stock === 0 && <div className="out-of-stock">Hết Hàng</div>}
                  </Link>
                  <div className="product-card-body">
                    {p.brand && <div className="product-brand">{p.brand}</div>}
                    <Link to={`/products/${p.slug}`} className="product-name">{p.name}</Link>
                    <div className="product-rating">
                      <FiStar className="star-icon" />
                      <span>{p.rating}</span>
                      <span className="review-count">({p.reviewCount} đánh giá)</span>
                    </div>
                    <div className="product-price-row">
                      {hasDiscount ? (
                        <>
                          <span className="price-current">{fmt(p.discountPrice!)}</span>
                          <span className="price-original">{fmt(p.price)}</span>
                        </>
                      ) : <span className="price-current">{fmt(p.price)}</span>}
                    </div>
                    <button
                      className="add-to-cart-btn"
                      disabled={p.stock === 0}
                      onClick={() => dispatch(addToCart(p))}
                      id={`add-cart-${p.id}`}>
                      <FiShoppingCart /> {p.stock === 0 ? 'Hết Hàng' : 'Thêm Vào Giỏ'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ProductsPage;
