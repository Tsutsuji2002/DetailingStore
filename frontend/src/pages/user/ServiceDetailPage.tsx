import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiClock, FiPhone, FiCheckCircle } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppSelector } from '@/hooks/useAppStore';
import './ServiceDetailPage.css';

const ServiceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { items, categories } = useAppSelector(s => s.services);
  const service = items.find(s => s.slug === slug);
  const [selectedImg, setSelectedImg] = useState(0);

  if (!service) return (
    <UserLayout>
      <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <h2>Dịch vụ không tồn tại.</h2>
        <Link to="/services" className="btn-back">← Về danh sách dịch vụ</Link>
      </div>
    </UserLayout>
  );

  const category = categories.find(c => c.id === service.categoryId);

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <Link to="/services" className="back-link"><FiArrowLeft /> Dịch Vụ</Link>
          <h1 className="page-hero-title">{service.name}</h1>
        </div>
      </div>

      <div className="container svc-detail-layout">
        {/* Left: Images */}
        <div className="svc-images">
          <div className="svc-main-img">
            <img src={service.images[selectedImg] || service.images[0]} alt={service.name} />
          </div>
          {service.images.length > 1 && (
            <div className="svc-thumbs">
              {service.images.map((img, i) => (
                <button key={i} className={`svc-thumb ${selectedImg === i ? 'active' : ''}`} onClick={() => setSelectedImg(i)}>
                  <img src={img} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Info */}
        <div className="svc-info">
          {category && <div className="svc-cat">{category.icon} {category.name}</div>}
          <h2 className="svc-info-title">{service.name}</h2>
          <p className="svc-short-desc">{service.shortDescription}</p>

          <div className="svc-price-box">
            <div className="svc-price-row">
              <span className="price-label">Giá Dịch Vụ:</span>
              <div className="svc-price-value">
                <span className="price-main-lg">{service.priceFrom.toLocaleString('vi-VN')}₫</span>
                {service.priceTo && <span className="price-dash">–</span>}
                {service.priceTo && <span className="price-to-lg">{service.priceTo.toLocaleString('vi-VN')}₫</span>}
              </div>
            </div>
            {service.duration && (
              <div className="svc-duration"><FiClock /> Thời gian: <strong>{service.duration}</strong></div>
            )}
            <p className="price-note">* Giá cuối có thể thay đổi tùy tình trạng xe. Liên hệ để được báo giá chính xác.</p>
          </div>

          <div className="svc-tags">
            {service.tags.map(t => <span key={t} className="tag-chip">#{t}</span>)}
          </div>

          <div className="svc-contact-btns">
            <a href="tel:0901234567" className="btn-call"><FiPhone /> Gọi Ngay: 0901 234 567</a>
            <Link to="/contact" className="btn-book">Đặt Lịch Hẹn</Link>
          </div>
        </div>

        {/* Full description */}
        <div className="svc-description">
          <h3>Mô Tả Chi Tiết</h3>
          <div className="svc-desc-content" dangerouslySetInnerHTML={{ __html: service.description }} />
        </div>

        <div className="svc-guarantees">
          <h3>Cam Kết Dịch Vụ</h3>
          <div className="guarantee-list">
            {['Thợ lành nghề, được đào tạo chuyên nghiệp', 'Sử dụng sản phẩm/phụ tùng chính hãng', 'Bảo hành sau dịch vụ theo quy định', 'Báo giá trước khi thực hiện, không phát sinh ẩn', 'Hoàn tiền 100% nếu không đạt yêu cầu'].map(g => (
              <div key={g} className="guarantee-item"><FiCheckCircle className="check-icon" /> {g}</div>
            ))}
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ServiceDetailPage;
