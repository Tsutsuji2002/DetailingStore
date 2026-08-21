import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiInstagram, FiYoutube, FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import { useAppSelector } from '@/hooks/useAppStore';
import { SHOP_INFO } from '@/data/sampleData';
import './Footer.css';

const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const shopInfo = useAppSelector(s => s.shop.info);
  const info = shopInfo || SHOP_INFO;
  return (
    <footer className="footer">
      <div className="footer-wave">
        <svg viewBox="0 0 1440 60" preserveAspectRatio="none"><path d="M0,0 C360,60 1080,0 1440,50 L1440,60 L0,60 Z" fill="var(--bg-tertiary)" /></svg>
      </div>
      <div className="footer-body">
        <div className="container footer-grid">
          {/* Brand */}
          <div className="footer-brand">
            <Link to="/" className="footer-logo">
              {info.logoUrl ? (
                <img src={info.logoUrl} alt={info.name} style={{ height: 32, objectFit: 'contain', marginRight: 8 }} />
              ) : (
                <span>{info.logoIcon || '🏍️'}</span>
              )}
              <span>{info.name}</span>
            </Link>
            <p className="footer-tagline">{info.tagline}</p>
            <div className="footer-socials">
              {info.socialLinks?.facebook && <a href={info.socialLinks.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><FiFacebook /></a>}
              {info.socialLinks?.instagram && <a href={info.socialLinks.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><FiInstagram /></a>}
              {info.socialLinks?.youtube && <a href={info.socialLinks.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><FiYoutube /></a>}
              {info.socialLinks?.zalo && <a href={info.socialLinks.zalo} target="_blank" rel="noreferrer" aria-label="Zalo" className="zalo-icon">Z</a>}
            </div>
          </div>

          {/* Quick Links */}
          <div className="footer-col">
            <h4 className="footer-heading">Khám Phá</h4>
            <ul className="footer-links">
              <li><Link to="/">Trang Chủ</Link></li>
              <li><Link to="/services">Dịch Vụ</Link></li>
              <li><Link to="/products">Cửa Hàng</Link></li>
              <li><Link to="/posts">Tin Tức</Link></li>
              <li><Link to="/recruitment">Tuyển Dụng</Link></li>
            </ul>
          </div>

          {/* Services */}
          <div className="footer-col">
            <h4 className="footer-heading">Dịch Vụ Chính</h4>
            <ul className="footer-links">
              <li><Link to="/services">✨ Detailing Cao Cấp</Link></li>
              <li><Link to="/services">🔧 Sửa Chữa Động Cơ</Link></li>
              <li><Link to="/services">⚙️ Bảo Dưỡng Định Kỳ</Link></li>
              <li><Link to="/services">🎨 Đồng Sơn Xe</Link></li>
              <li><Link to="/services">🚀 Nâng Cấp & Độ Xe</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="footer-col">
            <h4 className="footer-heading">Liên Hệ</h4>
            <ul className="footer-contact-list">
              <li><FiMapPin /><span>{info.address}</span></li>
              <li><FiPhone /><a href={`tel:${(info.phone || '').replace(/\s/g,'')}`}>{info.phone}</a></li>
              <li><FiMail /><a href={`mailto:${info.email}`}>{info.email}</a></li>
              <li className="hours">🕐 {info.workingHours}</li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="container footer-bottom-inner">
          <span>© {year} {info.name}. All rights reserved.</span>
          <span className="tax-id">MST: {info.taxId}</span>
          <div className="footer-bottom-links">
            <Link to="/contact">Chính Sách</Link>
            <Link to="/contact">Điều Khoản</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
