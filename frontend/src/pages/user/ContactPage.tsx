import React, { useState } from 'react';
import { useToast } from '@/context/ToastContext';
import { FiMapPin, FiPhone, FiMail, FiClock, FiFileText, FiSend } from 'react-icons/fi';
import UserLayout from '@/components/layout/UserLayout';
import { useAppSelector } from '@/hooks/useAppStore';
import './ContactPage.css';

const FALLBACK_INFO = {
  name: 'Detailing Store',
  address: '123 Nguyễn Văn Linh, Quận 7, TP.HCM',
  phone: '0901 234 567',
  email: 'contact@detailingstore.com',
  workingHours: 'Thứ 2 - Thứ 7: 8:00 - 18:00',
  taxId: '0123456789',
  mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.6740!2d106.6980!3d10.7627!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQ1JzQ1LjciTiAxMDbCsDQxJzUyLjgiRQ!5e0!3m2!1sen!2s!4v1234567890123'
};

const ContactPage: React.FC = () => {
  const shopInfo = useAppSelector(s => s.shop.info);
  const info = shopInfo || FALLBACK_INFO;
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';
      const res = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email: email || undefined, message }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.message || 'Không thể gửi lời nhắn. Vui lòng thử lại.');
      }
      // Clear form
      setName(''); setPhone(''); setEmail(''); setMessage('');
      showToast({ type: 'success', title: 'Đã gửi lời nhắn!', subtitle: 'Chúng tôi sẽ liên hệ lại với bạn sớm nhất.' });
    } catch (err: any) {
      showToast({ type: 'info', title: 'Lỗi gửi lời nhắn', subtitle: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <UserLayout>
      <div className="page-hero">
        <div className="container">
          <h1 className="page-hero-title">Liên Hệ & Địa Chỉ</h1>
          <p className="page-hero-sub">Thông tin chi tiết về {info.name}, bản đồ chỉ đường & gửi thắc mắc</p>
        </div>
      </div>

      <div className="container contact-layout">
        {/* Left: Info Cards */}
        <div className="contact-info-col">
          <div className="info-card">
            <div className="info-icon"><FiMapPin /></div>
            <div>
              <h3>Địa Chỉ Cửa Hàng</h3>
              <p>{info.address}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiPhone /></div>
            <div>
              <h3>Số Điện Thoại Hotline</h3>
              <p><a href={`tel:${(info.phone || '').replace(/\s/g, '')}`}>{info.phone}</a></p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiMail /></div>
            <div>
              <h3>Email Hỗ Trợ</h3>
              <p><a href={`mailto:${info.email}`}>{info.email}</a></p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiClock /></div>
            <div>
              <h3>Giờ Làm Việc</h3>
              <p>{info.workingHours}</p>
            </div>
          </div>

          <div className="info-card">
            <div className="info-icon"><FiFileText /></div>
            <div>
              <h3>Mã Số Thuế (Tax ID)</h3>
              <p><strong>{info.taxId}</strong> – {info.name}</p>
            </div>
          </div>
        </div>

        {/* Right: Map & Contact Form */}
        <div className="contact-form-col">
          {/* Map Embed */}
          <div className="map-wrapper">
            <iframe
              title={`${info.name} Google Map`}
              src={info.mapEmbedUrl}
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
                  <input
                    type="text"
                    id="c-name"
                    required
                    placeholder="Nguyễn Văn A"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="c-phone">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="c-phone"
                    required
                    placeholder="0901 234 567"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="c-email">Email</label>
                <input
                  type="email"
                  id="c-email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="c-msg">Nội dung thắc mắc / Đặt lịch *</label>
                <textarea
                  id="c-msg"
                  rows={4}
                  required
                  placeholder="Mô tả tình trạng xe hoặc dịch vụ bạn quan tâm..."
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-send-contact" id="contact-submit" disabled={submitting}>
                <FiSend /> {submitting ? 'Đang gửi...' : 'Gửi Ngay'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default ContactPage;
