import React from 'react';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFileText, FiSend } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { SHOP_INFO } from '@/data/sampleData';
import './ContactPage.css';

const ContactPage: React.FC = () => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Cảm ơn bạn! Lời nhắn của bạn đã được gửi đến MotoShine. Chúng tôi sẽ liên hệ lại sớm nhất.');
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Liên Hệ & Địa Chỉ</h1>
          <p className="page-hero-sub">Thông tin chi tiết về MotoShine, bản đồ chỉ đường & gửi thắc mắc</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Left: Info Cards */}
        <div className="contact-info-col">
          <div className="info-card">
            <div className="info-icon"><FiMapPin /></div>
            <div>
              <h3>Địa Chỉ Cửa Hàng</h3>
              <p>{SHOP_INFO.address}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiPhone /></div>
            <div>
              <h3>Số Điện Thoại Hotline</h3>
              <p><a href={`tel:${SHOP_INFO.phone}`}>{SHOP_INFO.phone}</a></p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiMail /></div>
            <div>
              <h3>Email Hỗ Trợ</h3>
              <p><a href={`mailto:${SHOP_INFO.email}`}>{SHOP_INFO.email}</a></p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiClock /></div>
            <div>
              <h3>Giờ Làm Việc</h3>
              <p>{SHOP_INFO.workingHours}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiFileText /></div>
            <div>
              <h3>Mã Số Thuế (Tax ID)</h3>
              <p><strong>{SHOP_INFO.taxId}</strong> – Công ty TNHH MotoShine Việt Nam</p>
            </div>
          </div>
        </div>

        {/* Right: Map & Contact Form */}
        <div className="contact-form-col">
          {/* Map Embed */}
          <div className="map-wrapper">
            <iframe
              title="MotoShine Google Map"
              src={SHOP_INFO.mapEmbedUrl}
              width="100%"
              height="280"
              style={{ border: 0, borderRadius: '16px' }}
              allowFullScreen
              loading="lazy"
            />
          </div>

          {/* Form */}
          <div className="contact-form-card">
            <h3>Gửi Lời Nhắn Cho Chúng Tôi</h3>
            <form onSubmit={handleSubmit} className="c-form">
              <div className="form-group-row">
                <div className="form-group">
                  <label htmlFor="c-name">Họ và tên *</label>
                  <input type="text" id="c-name" required placeholder="Nguyễn Văn A" />
                </div>
                <div className="form-group">
                  <label htmlFor="c-phone">Số điện thoại *</label>
                  <input type="tel" id="c-phone" required placeholder="0901 234 567" />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="c-email">Email</label>
                <input type="email" id="c-email" placeholder="name@example.com" />
              </div>
              <div className="form-group">
                <label htmlFor="c-msg">Nội dung thắc mắc / Đặt lịch *</label>
                <textarea id="c-msg" rows={4} required placeholder="Mô tả tình trạng xe hoặc dịch vụ bạn quan tâm..." />
              </div>
              <button type="submit" className="btn-send-contact" id="contact-submit">
                <FiSend /> Gửi Ngay
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ContactPage;
