import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppSelector } from '@/hooks/useAppStore';
import { SAMPLE_POSTS, SAMPLE_SHIFTS } from '@/data/sampleData';
import './HomePage.css';

const SLIDES = [
  {
    id: 1, tag: '✨ Dịch Vụ Nổi Bật',
    title: 'Detailing Xe Máy\nCao Cấp Tại TP.HCM',
    desc: 'Phủ Ceramic, đánh bóng sơn, vệ sinh khoang máy chuyên sâu. Xe bạn luôn sáng bóng như mới.',
    cta: { label: 'Xem Dịch Vụ', to: '/services' },
    ctaSecond: { label: 'Đặt Lịch', to: '/contact' },
    bg: 'linear-gradient(135deg, #0d1b3e 0%, #1a5cff 100%)',
    img: 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&q=80',
    accent: '#4d8aff',
  },
  {
    id: 2, tag: '🔧 Sửa Chữa & Bảo Dưỡng',
    title: 'Kỹ Thuật Chuyên Sâu\nBảo Hành Tận Tâm',
    desc: 'Đội ngũ thợ lành nghề 10+ năm kinh nghiệm, sử dụng thiết bị chẩn đoán hiện đại. Bảo hành sau sửa.',
    cta: { label: 'Dịch Vụ Sửa Chữa', to: '/services' },
    ctaSecond: { label: 'Liên Hệ Ngay', to: '/contact' },
    bg: 'linear-gradient(135deg, #1a2235 0%, #7c3aed 100%)',
    img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&q=80',
    accent: '#a78bfa',
  },
  {
    id: 3, tag: '🛒 Cửa Hàng Phụ Tùng',
    title: 'Phụ Tùng Chính Hãng\nGiao Hàng Toàn Quốc',
    desc: 'Nhớt, lọc, lốp xe, phụ kiện chính hãng từ Honda, Yamaha, Michelin, DID và nhiều thương hiệu khác.',
    cta: { label: 'Mua Ngay', to: '/products' },
    ctaSecond: { label: 'Xem Danh Mục', to: '/products' },
    bg: 'linear-gradient(135deg, #0a1628 0%, #059669 100%)',
    img: 'https://images.unsplash.com/photo-1563720219787-bca88748e795?w=700&q=80',
    accent: '#34d399',
  },
];

const today = new Date();
const DAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

const MiniCalendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(today);
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const shiftDates = new Set(SAMPLE_SHIFTS.map(s => s.date));

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const prev = () => setCurrentDate(new Date(year, month - 1, 1));
  const next = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="mini-calendar">
      <div className="cal-header">
        <button onClick={prev} className="cal-nav"><FiChevronLeft /></button>
        <span className="cal-month">{currentDate.toLocaleDateString('vi-VN', { month: 'long', year: 'numeric' })}</span>
        <button onClick={next} className="cal-nav"><FiChevronRight /></button>
      </div>
      <div className="cal-days-header">
        {DAYS.map(d => <span key={d} className="cal-day-label">{d}</span>)}
      </div>
      <div className="cal-grid">
        {cells.map((d, i) => {
          if (!d) return <span key={i} className="cal-cell empty" />;
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
          const hasShift = shiftDates.has(dateStr);
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <span key={i} className={`cal-cell ${isToday ? 'today' : ''} ${hasShift ? 'has-event' : ''}`}>
              {d}
              {hasShift && <span className="cal-dot" />}
            </span>
          );
        })}
      </div>
      <div className="cal-legend">
        <span className="legend-dot has-event" /> <span>Có lịch hẹn</span>
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const services = useAppSelector(s => s.services.items);
  const storeSlides = useAppSelector(s => s.shop.heroSlides);
  const activeSlides = storeSlides && storeSlides.length > 0 ? storeSlides.map(s => ({
    id: s.id,
    tag: s.tag || '✨ Dịch Vụ Nổi Bật',
    title: s.title || '',
    desc: s.desc || '',
    cta: { label: 'Xem Dịch Vụ', to: '/services' },
    ctaSecond: { label: 'Đặt Lịch', to: '/contact' },
    bg: 'linear-gradient(135deg, #0d1b3e 0%, #1a5cff 100%)',
    img: s.img,
    accent: '#4d8aff',
  })) : SLIDES;

  const [slide, setSlide] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || activeSlides.length === 0) return;
    const t = setInterval(() => setSlide(s => (s + 1) % activeSlides.length), 5000);
    return () => clearInterval(t);
  }, [paused, activeSlides.length]);

  const cur = activeSlides[slide] || activeSlides[0] || SLIDES[0];

  return (
    <UserLayout>
      {/* ── Hero Slider ── */}
      <section className="hero-section" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="hero-bg" style={{ background: cur.bg }} />
        <div className="hero-img-wrap">
          <img key={slide} src={cur.img} alt="" className="hero-img" />
        </div>
        <div className="container hero-content">
          <div className="hero-text">
            <div className="hero-tag">{cur.tag}</div>
            <h1 className="hero-title">{cur.title}</h1>
            <p className="hero-desc">{cur.desc}</p>
            <div className="hero-btns">
              <Link to={cur.cta.to} className="hero-btn primary">{cur.cta.label} <FiArrowRight /></Link>
              <Link to={cur.ctaSecond.to} className="hero-btn secondary">{cur.ctaSecond.label}</Link>
            </div>
          </div>
        </div>
        {/* Slide Controls */}
        <div className="slide-controls">
          <button className="slide-arrow" onClick={() => setSlide(s => (s - 1 + activeSlides.length) % activeSlides.length)}><FiChevronLeft /></button>
          <div className="slide-dots">
            {activeSlides.map((_, i) => <button key={i} className={`slide-dot ${i === slide ? 'active' : ''}`} onClick={() => setSlide(i)} />)}
          </div>
          <button className="slide-arrow" onClick={() => setSlide(s => (s + 1) % activeSlides.length)}><FiChevronRight /></button>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="stats-bar">
        <div className="container stats-row">
          {[
            { label: 'Khách Hài Lòng', value: '2,000+', icon: '😊' },
            { label: 'Năm Kinh Nghiệm', value: '8+', icon: '📅' },
            { label: 'Thợ Lành Nghề', value: '15', icon: '👨‍🔧' },
            { label: 'Dịch Vụ Cung Cấp', value: '30+', icon: '🛠️' },
          ].map(s => (
            <div key={s.label} className="stat-item">
              <span className="stat-icon">{s.icon}</span>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Hot Services ── */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Dịch Vụ Nổi Bật</h2>
              <p className="section-subheading">Các dịch vụ được khách hàng tin dùng nhất tại MotoShine</p>
            </div>
            <Link to="/services" className="see-all-link">Xem tất cả <FiArrowRight /></Link>
          </div>
          <div className="services-grid">
            {services.length > 0 ? (
              services.slice(0, 3).map(svc => (
                <Link to={`/services/${svc.slug}`} key={svc.id} className="service-card">
                  <div className="service-card-img">
                    <img src={svc.images[0]} alt={svc.name} />
                    <span className="service-card-tag">
                      {svc.duration && <><FiClock /> {svc.duration}</>}
                    </span>
                  </div>
                  <div className="service-card-body">
                    <div className="service-card-title">{svc.name}</div>
                    <div className="service-card-desc">{svc.shortDescription}</div>
                    <div className="service-card-price">
                      Từ <strong>{svc.priceFrom.toLocaleString('vi-VN')}₫</strong>
                      {svc.priceTo && <span className="price-to"> – {svc.priceTo.toLocaleString('vi-VN')}₫</span>}
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                Chưa có dịch vụ nào. Dữ liệu sẽ được hiển thị khi được thêm từ hệ thống.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── Main 2-Col Section: Posts + Calendar ── */}
      <section className="section-padded bg-alt">
        <div className="container two-col-section">
          {/* Recent Posts */}
          <div className="recent-posts">
            <div className="section-header">
              <h2 className="section-heading">Tin Tức Mới Nhất</h2>
              <Link to="/posts" className="see-all-link">Xem tất cả <FiArrowRight /></Link>
            </div>
            <div className="post-list">
              {SAMPLE_POSTS.map(post => (
                <Link to={`/posts/${post.slug}`} key={post.id} className="post-list-item">
                  <div className="post-list-img">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                  <div className="post-list-body">
                    <div className="post-list-tags">
                      {post.tags.slice(0, 2).map(t => <span key={t} className="tag-chip">#{t}</span>)}
                    </div>
                    <div className="post-list-title">{post.title}</div>
                    <div className="post-list-meta">
                      <FiCalendar />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      <span className="dot">•</span>
                      {post.likes} lượt thích
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Calendar + Quick Info */}
          <div className="sidebar-widgets">
            <div className="widget-card">
              <h3 className="widget-title"><FiCalendar /> Lịch Hoạt Động</h3>
              <MiniCalendar />
            </div>

            <div className="widget-card opening-hours">
              <h3 className="widget-title">🕐 Giờ Mở Cửa</h3>
              <ul className="hours-list">
                <li><span>Thứ 2 – Thứ 6</span><strong>7:30 – 18:30</strong></li>
                <li><span>Thứ 7</span><strong>7:30 – 18:00</strong></li>
                <li><span>Chủ Nhật</span><strong>8:00 – 16:00</strong></li>
              </ul>
              <Link to="/contact" className="btn-contact">📍 Xem Địa Chỉ <FiArrowRight /></Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Featured Products ── */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Sản Phẩm Bán Chạy</h2>
              <p className="section-subheading">Phụ tùng & phụ kiện chính hãng được mua nhiều nhất</p>
            </div>
            <Link to="/products" className="see-all-link">Xem cửa hàng <FiArrowRight /></Link>
          </div>
          <div className="products-mini-grid">
            {SAMPLE_POSTS.slice(0, 3).map((_, i) => {
              const products = [
                { name: 'Nhớt Honda Ultra Gold', price: '95.000₫', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', rating: 4.7, slug: 'nhot-honda-ultra-gold' },
                { name: 'Set Hóa Chất CarPro', price: '580.000₫', img: 'https://images.unsplash.com/photo-1607349913338-fca6f58f34cd?w=300', rating: 4.9, slug: 'hoa-chat-carpro' },
                { name: 'Lốp Michelin Pilot Street', price: '890.000₫', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300', rating: 4.8, slug: 'lop-michelin-pilot-street' },
              ][i];
              return (
                <Link to={`/products/${products.slug}`} key={i} className="product-mini-card">
                  <img src={products.img} alt={products.name} />
                  <div className="product-mini-info">
                    <div className="product-mini-name">{products.name}</div>
                    <div className="product-mini-row">
                      <span className="product-mini-price">{products.price}</span>
                      <span className="product-mini-rating"><FiStar /> {products.rating}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="cta-banner">
        <div className="container cta-inner">
          <div className="cta-text">
            <h2>Đặt Lịch Dịch Vụ Ngay Hôm Nay</h2>
            <p>Gọi cho chúng tôi hoặc đến trực tiếp cửa hàng để được tư vấn miễn phí.</p>
          </div>
          <div className="cta-btns">
            <a href="tel:0901234567" className="cta-btn primary">📞 0901 234 567</a>
            <Link to="/contact" className="cta-btn secondary">Xem Địa Chỉ</Link>
          </div>
        </div>
      </section>
    </UserLayout>
  );
};

export default HomePage;
