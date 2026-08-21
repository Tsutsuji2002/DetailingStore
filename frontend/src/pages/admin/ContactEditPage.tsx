import React, { useState } from 'react';
import { FiSave, FiCheck } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { updateShopInfo } from '@/features/shopSlice';

const ContactEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const shopInfo = useAppSelector(s => s.shop.info);
  const [saved, setSaved] = useState(false);
  const [info, setInfo] = useState(shopInfo);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(updateShopInfo(info));
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Cài Đặt Thương Hiệu, Logo, Liên Hệ & Bản Đồ</h1>
          <p className="admin-page-sub">Chỉnh sửa biểu tượng logo, tên thương hiệu hiển thị trên Header, địa chỉ, hotline, giờ mở cửa & MST</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 850 }}>
        {saved && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <FiCheck /> Đã lưu thông tin & thương hiệu mới! Header và toàn bộ website đã được cập nhật ngay lập tức.
          </div>
        )}

        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Logo & Brand Name Controls */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 3fr', gap: '1rem', background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--border-color)' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Biểu Tượng Logo (Icon / Emoji)</label>
              <input type="text" value={info.logoIcon || '🏍️'} onChange={e => setInfo({ ...info, logoIcon: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '1.2rem', textAlign: 'center' }} placeholder="🏍️ hoặc 🧼..." />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Thương Hiệu / Cửa Hàng (Hiển thị Header)</label>
              <input type="text" value={info.name} onChange={e => setInfo({ ...info, name: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '1.05rem' }} placeholder="Detailing Store" />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Khẩu Hiệu / Tagline</label>
            <input type="text" value={info.tagline} onChange={e => setInfo({ ...info, tagline: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Số Điện Thoại Hotline</label>
              <input type="text" value={info.phone} onChange={e => setInfo({ ...info, phone: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Email Liên Hệ</label>
              <input type="email" value={info.email} onChange={e => setInfo({ ...info, email: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Địa Chỉ Xưởng / Cửa Hàng</label>
              <input type="text" value={info.address} onChange={e => setInfo({ ...info, address: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mã Số Thuế (Tax ID) *</label>
              <input type="text" value={info.taxId} onChange={e => setInfo({ ...info, taxId: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 700 }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giờ Hoạt Động</label>
            <input type="text" value={info.workingHours} onChange={e => setInfo({ ...info, workingHours: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Link Google Maps Iframe Embed URL</label>
            <textarea rows={3} value={info.mapEmbedUrl} onChange={e => setInfo({ ...info, mapEmbedUrl: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.78rem' }} />
          </div>

          <button type="submit" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', borderRadius: 12, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: '0.95rem', border: 'none', cursor: 'pointer', alignSelf: 'flex-start', marginTop: '0.5rem' }} id="save-contact-btn">
            <FiSave /> Lưu Cập Nhật Thông Tin & Thương Hiệu
          </button>
        </div>
      </form>
    </AdminLayout>
  );
};

export default ContactEditPage;
