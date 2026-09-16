import React, { useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiClock, FiArrowRight } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { setCategory, setSearch, setSort, fetchServicesThunk, fetchServiceCategoriesThunk } from '@/features/servicesSlice';
import './ServicesPage.css';

const ServicesPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, categories, selectedCategory, searchQuery, sortBy } = useAppSelector(s => s.services);
  const { isAuthenticated } = useAppSelector(s => s.auth);

  useEffect(() => {
    dispatch(fetchServicesThunk());
    dispatch(fetchServiceCategoriesThunk());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let list = [...items].filter(s => s.isActive);
    if (selectedCategory !== 'all') list = list.filter(s => s.categoryId === selectedCategory);
    if (searchQuery) list = list.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.shortDescription.toLowerCase().includes(searchQuery.toLowerCase()));
    switch (sortBy) {
      case 'price-asc': list.sort((a, b) => a.priceFrom - b.priceFrom); break;
      case 'price-desc': list.sort((a, b) => b.priceFrom - a.priceFrom); break;
      case 'name': list.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [items, selectedCategory, searchQuery, sortBy]);

  return (
    <UserLayout>
      {/* Page Header */}
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Dịch Vụ</h1>
          <p className="page-hero-sub">Chuyên nghiệp – Tận tâm – Bảo hành rõ ràng</p>
        </div>
      </div>

      <div className="container services-layout">
        {/* Filters */}
        <div className="filter-bar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input type="text" placeholder="Tìm dịch vụ..." value={searchQuery} onChange={e => dispatch(setSearch(e.target.value))} id="service-search" />
          </div>
          <div className="filter-cats">
            <button className={`cat-chip ${selectedCategory === 'all' ? 'active' : ''}`} onClick={() => dispatch(setCategory('all'))}>Tất Cả</button>
            {categories.map(c => (
              <button key={c.id} className={`cat-chip ${selectedCategory === c.id ? 'active' : ''}`} onClick={() => dispatch(setCategory(c.id))}>
                {c.icon} {c.name}
              </button>
            ))}
          </div>
          <div className="sort-select-wrap">
            <FiFilter />
            <select value={sortBy} onChange={e => dispatch(setSort(e.target.value as any))} id="service-sort">
              <option value="newest">Mới Nhất</option>
              <option value="price-asc">Giá Tăng</option>
              <option value="price-desc">Giá Giảm</option>
              <option value="name">Tên A–Z</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="results-count">Tìm thấy <strong>{filtered.length}</strong> dịch vụ</div>

        {/* Service Grid */}
        <div className="services-grid-full">
          {filtered.length === 0 ? (
            <div className="empty-state"><p>Không tìm thấy dịch vụ phù hợp.</p></div>
          ) : filtered.map(svc => (
            <Link to={`/services/${svc.slug}`} key={svc.id} className="service-card-full">
              <div className="scf-img">
                <img src={svc.images[0]} alt={svc.name} />
                <div className="scf-tags">
                  {svc.tags.slice(0, 2).map(t => <span key={t} className="tag-chip">#{t}</span>)}
                </div>
              </div>
              <div className="scf-body">
                <div className="scf-category-label">
                  {categories.find(c => c.id === svc.categoryId)?.icon} {categories.find(c => c.id === svc.categoryId)?.name}
                </div>
                <h3 className="scf-title">{svc.name}</h3>
                <p className="scf-desc">{svc.shortDescription}</p>
                <div className="scf-footer">
                  <div className="scf-price">
                    <span className="price-from-label">Từ</span>
                    <strong className="price-main">{svc.priceFrom.toLocaleString('vi-VN')}₫</strong>
                    {svc.priceTo && <span className="price-sep">–</span>}
                    {svc.priceTo && <span className="price-to">{svc.priceTo.toLocaleString('vi-VN')}₫</span>}
                  </div>
                  {svc.duration && <span className="scf-duration"><FiClock /> {svc.duration}</span>}
                  <span className="scf-cta">Chi tiết <FiArrowRight /></span>
                  <button
                    onClick={e => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/user/service-requests/new?serviceId=${svc.id}`);
                    }}
                    style={{ padding: '0.4rem 0.85rem', borderRadius: 8, background: 'var(--accent-gradient)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                  >
                    Đặt lịch
                  </button>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </UserLayout>
  );
};

export default ServicesPage;
