import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiCalendar, FiClock, FiStar, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { contentApi } from '@/services/api/contentApi';
import { serviceApi, BackendService } from '@/services/api/serviceApi';
import { productApi, BackendProduct } from '@/services/api/productApi';
import postApi, { PostDto } from '@/services/api/postApi';
import './HomePage.css';

interface SlideItem {
  id: number | string;
  tag: string;
  title: string;
  desc: string;
  cta: { label: string; to: string };
  ctaSecond: { label: string; to: string };
  bg: string;
  img: string;
  accent: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
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
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <span key={i} className={`cal-cell ${isToday ? 'today' : ''}`}>
              {d}
            </span>
          );
        })}
      </div>
    </div>
  );
};

const HomePage: React.FC = () => {
  const [slides, setSlides] = useState<SlideItem[]>(DEFAULT_SLIDES);
  const [services, setServices] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [slideIndex, setSlideIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Fetch dynamic hero slides
    contentApi.getSlides()
      .then(dbSlides => {
        if (dbSlides && dbSlides.length > 0) {
          const mapped: SlideItem[] = dbSlides.map((s, idx) => ({
            id: s.id,
            tag: s.tag || '✨ Banner',
            title: s.title,
            desc: s.description,
            // Build CTA based on linkType
            ...((): { cta: SlideItem['cta']; ctaSecond: SlideItem['ctaSecond'] } => {
              const linkType = s.linkType?.toLowerCase() || 'none';
              const slug = s.linkedContentSlug || '';
              const contentPath = linkType === 'service' ? `/services/${slug}`
                : linkType === 'post' ? `/posts/${slug}`
                : linkType === 'product' ? `/products/${slug}`
                : '/services';

              const primaryCta = linkType !== 'none' && slug
                ? { label: linkType === 'service' ? 'Xem Dịch Vụ →' : linkType === 'post' ? 'Đọc Bài Viết →' : 'Xem Sản Phẩm →', to: contentPath }
                : { label: 'Xem Dịch Vụ', to: '/services' };

              const secondaryCta = linkType === 'service' && slug
                ? { label: 'Lên Lịch', to: `/user/service-requests/new?serviceId=${s.linkedContentId || ''}` }
                : { label: 'Đặt Lịch', to: '/contact' };

              return { cta: primaryCta, ctaSecond: secondaryCta };
            })(),
            bg: idx % 3 === 0
              ? 'linear-gradient(135deg, #0d1b3e 0%, #1a5cff 100%)'
              : idx % 3 === 1
              ? 'linear-gradient(135deg, #1a2235 0%, #7c3aed 100%)'
              : 'linear-gradient(135deg, #0a1628 0%, #059669 100%)',
            img: s.imageUrl || 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=700&q=80',
            accent: idx % 3 === 0 ? '#4d8aff' : idx % 3 === 1 ? '#a78bfa' : '#34d399',
          }));
          setSlides(mapped);
        }
      })
      .catch(() => {});

    // Fetch dynamic services
    serviceApi.getServices()
      .then(res => {
        if (res && res.length > 0) {
          setServices(res);
        }
      })
      .catch(() => {});

    // Fetch dynamic products
    productApi.getProducts()
      .then(res => {
        if (res && res.length > 0) {
          setProducts(res);
        }
      })
      .catch(() => {});

    // Fetch dynamic posts
    postApi.getPosts()
      .then((res: PostDto[]) => {
        if (res && res.length > 0) {
          setPosts(res);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (paused || slides.length === 0) return;
    const t = setInterval(() => setSlideIndex(s => (s + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, [paused, slides.length]);

  const cur = slides[slideIndex] || slides[0] || DEFAULT_SLIDES[0];

  return (
    <UserLayout>
      {/* ── Hero Slider ── */}
      <section className="hero-section" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
        <div className="hero-bg" style={{ background: cur.bg }} />
        <div className="hero-img-wrap">
          <img key={slideIndex} src={cur.img} alt="" className="hero-img" />
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
          <button className="slide-arrow" onClick={() => setSlideIndex(s => (s - 1 + slides.length) % slides.length)}><FiChevronLeft /></button>
          <div className="slide-dots">
            {slides.map((_, i) => <button key={i} className={`slide-dot ${i === slideIndex ? 'active' : ''}`} onClick={() => setSlideIndex(i)} />)}
          </div>
          <button className="slide-arrow" onClick={() => setSlideIndex(s => (s + 1) % slides.length)}><FiChevronRight /></button>
        </div>
      </section>

      {/* ── Hot Services ── */}
      <section className="section-padded">
        <div className="container">
          <div className="section-header">
            <div>
              <h2 className="section-heading">Dịch Vụ Nổi Bật</h2>
              <p className="section-subheading">Các dịch vụ được khách hàng tin dùng nhất tại 61 Team</p>
            </div>
            <Link to="/services" className="see-all-link">Xem tất cả <FiArrowRight /></Link>
          </div>
          <div className="services-grid">
            {services.slice(0, 3).map(svc => (
              <Link to={`/services/${svc.slug}`} key={svc.id} className="service-card">
                <div className="service-card-img">
                  <img src={svc.images && svc.images.length > 0 ? svc.images[0] : 'https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=500'} alt={svc.name} />
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
            ))}
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
              {posts.slice(0, 3).map(post => (
                <Link to={`/posts/${post.slug}`} key={post.id} className="post-list-item">
                  <div className="post-list-img">
                    <img src={post.coverImage} alt={post.title} />
                  </div>
                  <div className="post-list-body">
                    <div className="post-list-tags">
                      {post.tags.slice(0, 2).map((t: string) => <span key={t} className="tag-chip">#{t}</span>)}
                    </div>
                    <div className="post-list-title">{post.title}</div>
                    <div className="post-list-meta">
                      <FiCalendar />
                      {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                      <span className="dot">•</span>
                      {post.likes || 0} lượt thích
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
            {products.length > 0 ? (
              products.slice(0, 3).map(p => (
                <Link to={`/products/${p.slug || p.id}`} key={p.id} className="product-mini-card">
                  <img src={p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300'} alt={p.name} />
                  <div className="product-mini-info">
                    <div className="product-mini-name">{p.name}</div>
                    <div className="product-mini-row">
                      <span className="product-mini-price">
                        {p.discountPrice ? (
                          <>
                            <strong>{p.discountPrice.toLocaleString('vi-VN')}₫</strong>
                            <span style={{ textDecoration: 'line-through', fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 4 }}>
                              {p.price.toLocaleString('vi-VN')}₫
                            </span>
                          </>
                        ) : (
                          `${p.price.toLocaleString('vi-VN')}₫`
                        )}
                      </span>
                      <span className="product-mini-rating"><FiStar /> {p.rating || 5.0}</span>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              [
                { name: 'Nhớt Honda Ultra Gold', price: '95.000₫', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=300', rating: 4.7, slug: 'nhot-honda-ultra-gold' },
                { name: 'Set Hóa Chất CarPro', price: '580.000₫', img: 'https://images.unsplash.com/photo-1607349913338-fca6f58f34cd?w=300', rating: 4.9, slug: 'hoa-chat-carpro' },
                { name: 'Lốp Michelin Pilot Street', price: '890.000₫', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300', rating: 4.8, slug: 'lop-michelin-pilot-street' },
              ].map((p, i) => (
                <Link to={`/products/${p.slug}`} key={i} className="product-mini-card">
                  <img src={p.img} alt={p.name} />
                  <div className="product-mini-info">
                    <div className="product-mini-name">{p.name}</div>
                    <div className="product-mini-row">
                      <span className="product-mini-price">{p.price}</span>
                      <span className="product-mini-rating"><FiStar /> {p.rating}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
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
