import React, { useState, useEffect } from 'react';
import { FiSave, FiCheck, FiUpload, FiX } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { updateShopInfoThunk, fetchShopInfoThunk } from '@/features/shopSlice';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

const ContactEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const shopInfo = useAppSelector(s => s.shop.info);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState(shopInfo);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchShopInfoThunk());
  }, [dispatch]);

  useEffect(() => {
    setInfo(shopInfo);
  }, [shopInfo]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      await dispatch(updateShopInfoThunk(info)).unwrap();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) {
      setError(err || 'Cập nhật thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Chỉ chấp nhận file ảnh (.jpg, .png, .webp, .svg, .gif)');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', file);

      const token = localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token');
      const response = await fetch(`${API_BASE_URL}/content/upload`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload thất bại');
      }

      // Update logo URL with uploaded file path
      setInfo({ ...info, logoUrl: data.url });
      setUploadError(null);
    } catch (err: any) {
      setUploadError(err.message || 'Có lỗi xảy ra khi tải lên');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setInfo({ ...info, logoUrl: '' });
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
          <div style={{ background: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 12, border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
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
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Hình Ảnh Logo (Thay thế icon nếu có)</label>
              
              {/* Logo Preview & Remove */}
              {info.logoUrl && (
                <div style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-color)' }}>
                  <img src={info.logoUrl} alt="Logo Preview" style={{ height: 50, maxWidth: 120, objectFit: 'contain', borderRadius: 6 }} />
                  <div style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{info.logoUrl}</div>
                  <button type="button" onClick={handleRemoveLogo} style={{ padding: '0.4rem', borderRadius: 6, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }} title="Xóa logo">
                    <FiX size={16} />
                  </button>
                </div>
              )}

              {/* Upload Button */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.625rem 1rem', borderRadius: 8, background: 'var(--bg-card)', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.85rem', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.6 : 1 }}>
                  <FiUpload /> {uploading ? 'Đang tải lên...' : 'Tải Lên Từ Máy'}
                  <input type="file" accept="image/jpeg,image/jpg,image/png,image/gif,image/webp,image/svg+xml" onChange={handleFileUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
                
                <div style={{ flex: 1 }}>
                  <input type="text" value={info.logoUrl || ''} onChange={e => setInfo({ ...info, logoUrl: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }} placeholder="hoặc nhập URL: https://example.com/logo.png" />
                </div>
              </div>

              {uploadError && (
                <p style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.4rem', fontWeight: 600 }}>⚠️ {uploadError}</p>
              )}
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.4rem', fontStyle: 'italic' }}>Nếu có URL logo, Header sẽ hiển thị hình ảnh thay vì icon. Để trống để dùng icon emoji.</p>
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
