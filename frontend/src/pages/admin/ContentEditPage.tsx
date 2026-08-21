import React, { useState, useEffect, useRef } from 'react';
import { FiSave, FiPlus, FiTrash2, FiImage, FiCheck, FiUpload, FiLoader, FiGlobe, FiSmile } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { updateShopContentThunk, HeroSlide } from '@/features/shopSlice';
import { contentApi } from '@/services/api/contentApi';

const ContentEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const shopState = useAppSelector(s => s.shop);
  const shopInfo = shopState.info;
  const initialSlides = shopState.heroSlides;

  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [shopName, setShopName] = useState(shopInfo.name || 'Detailing Store');
  const [tagline, setTagline] = useState(shopInfo.tagline || 'Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Sài Gòn');
  const [logoMode, setLogoMode] = useState<'url' | 'icon'>(shopInfo.logoUrl ? 'url' : 'icon');
  const [logoUrl, setLogoUrl] = useState<string>(shopInfo.logoUrl || '');
  const [logoIcon, setLogoIcon] = useState<string>(shopInfo.logoIcon || '🏍️');
  const [slides, setSlides] = useState<HeroSlide[]>(initialSlides);

  // Upload loading states
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingSlideId, setUploadingSlideId] = useState<string | number | null>(null);

  const logoFileInputRef = useRef<HTMLInputElement>(null);

  // Sync state when shopInfo changes
  useEffect(() => {
    if (shopInfo) {
      setShopName(shopInfo.name || 'Detailing Store');
      setTagline(shopInfo.tagline || 'Chăm Sóc Xe Máy Chuyên Nghiệp – Đẳng Cấp Sài Gòn');
      setLogoUrl(shopInfo.logoUrl || '');
      setLogoIcon(shopInfo.logoIcon || '🏍️');
      if (shopInfo.logoUrl) setLogoMode('url');
    }
  }, [shopInfo]);

  useEffect(() => {
    if (initialSlides && initialSlides.length > 0) {
      setSlides(initialSlides);
    }
  }, [initialSlides]);

  // Handle Logo Upload
  const handleLogoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    setError(null);
    try {
      const res = await contentApi.uploadImage(file);
      setLogoUrl(res.url);
      setLogoMode('url');
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh logo lên server.');
    } finally {
      setUploadingLogo(false);
    }
  };

  // Handle Slide Image Upload
  const handleSlideFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const slideId = slides[index].id;
    setUploadingSlideId(slideId);
    setError(null);
    try {
      const res = await contentApi.uploadImage(file);
      const updated = [...slides];
      updated[index].img = res.url;
      setSlides(updated);
    } catch (err: any) {
      setError(err.message || 'Lỗi khi tải ảnh banner lên server.');
    } finally {
      setUploadingSlideId(null);
    }
  };

  // Save changes
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const heroSlidesJson = JSON.stringify(slides);
      await dispatch(updateShopContentThunk({
        shopName,
        tagline,
        logoUrl: logoMode === 'url' ? logoUrl : null,
        logoIcon: logoMode === 'icon' ? logoIcon : (logoIcon || '🏍️'),
        heroSlidesJson,
      })).unwrap();

      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err || 'Không thể lưu thông tin website.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Quản Lý Nội Dung Trang Chủ & Logo</h1>
          <p className="admin-page-sub">Chỉnh sửa Tên Cửa Hàng, Logo, Tagline & Danh sách Slide Banner</p>
        </div>
      </div>

      <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 960 }}>
        {saved && (
          <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.875rem 1.25rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 12px rgba(22, 163, 74, 0.15)' }}>
            <FiCheck style={{ fontSize: '1.2rem' }} /> Đã cập nhật và lưu vĩnh viễn nội dung website vào Database thành công!
          </div>
        )}

        {error && (
          <div style={{ background: '#fee2e2', color: '#b91c1c', padding: '0.875rem 1.25rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── Branding Website Section ── */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FiGlobe style={{ color: 'var(--accent-primary)' }} /> Thương Hiệu & Logo Website
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Tên Cửa Hàng / Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={e => setShopName(e.target.value)}
                placeholder="VD: Detailing Store"
                required
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.95rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Khẩu Hiệu (Tagline)</label>
              <input
                type="text"
                value={tagline}
                onChange={e => setTagline(e.target.value)}
                placeholder="VD: Chăm Sóc Xe Máy Chuyên Nghiệp"
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.95rem' }}
              />
            </div>
          </div>

          {/* Logo Selection Block */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '1.25rem', border: '1px solid var(--border-color)', marginTop: '0.5rem' }}>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Logo Hiển Thị</label>

            {/* Mode Picker */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: logoMode === 'url' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                <input type="radio" name="logoMode" checked={logoMode === 'url'} onChange={() => setLogoMode('url')} />
                <FiImage /> Sử dụng Hình Ảnh (URL / File Local)
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: logoMode === 'icon' ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                <input type="radio" name="logoMode" checked={logoMode === 'icon'} onChange={() => setLogoMode('icon')} />
                <FiSmile /> Sử dụng Icon Emoji
              </label>
            </div>

            {logoMode === 'url' ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={logoUrl}
                    onChange={e => setLogoUrl(e.target.value)}
                    placeholder="Nhập đường dẫn URL ảnh Logo..."
                    style={{ flex: 1, padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.875rem' }}
                  />

                  {/* Local Upload Input */}
                  <input type="file" accept="image/*" ref={logoFileInputRef} onChange={handleLogoFileUpload} style={{ display: 'none' }} />
                  <button
                    type="button"
                    disabled={uploadingLogo}
                    onClick={() => logoFileInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem', border: '1px solid var(--accent-primary)', cursor: uploadingLogo ? 'not-allowed' : 'pointer', whiteSpace: 'nowrap' }}>
                    {uploadingLogo ? <><FiLoader className="spin" /> Đang tải...</> : <><FiUpload /> Chọn Ảnh Từ Máy</>}
                  </button>
                </div>

                {/* Live Logo Preview */}
                {logoUrl && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem', background: 'var(--bg-card)', padding: '0.75rem 1rem', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Xem trước Logo Header:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#0a1224', padding: '0.5rem 1rem', borderRadius: 8 }}>
                      <img src={logoUrl} alt="Logo Preview" style={{ height: 32, objectFit: 'contain' }} onError={e => (e.currentTarget.style.display = 'none')} />
                      <span style={{ fontWeight: 800, color: '#fff', fontSize: '1rem' }}>{shopName}</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="text"
                  value={logoIcon}
                  onChange={e => setLogoIcon(e.target.value)}
                  placeholder="Nhập Biểu tượng Emoji (VD: 🏍️, 🚗, ✨)"
                  style={{ width: 200, padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '1.1rem' }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── Hero Slides Section ── */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>Banner Hero Slides ({slides.length})</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>Quản lý hình ảnh và chữ hiển thị trên Slider trang chủ</p>
            </div>
            <button
              type="button"
              onClick={() => setSlides([...slides, { id: Date.now(), tag: '✨ Mới', title: 'Tiêu đề banner mới', desc: 'Mô tả banner...', img: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=700&q=80' }])}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 10, background: 'var(--accent-light)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
              <FiPlus /> Thêm Slide
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {slides.map((s, i) => (
              <div key={s.id || i} style={{ display: 'grid', gridTemplateColumns: '140px 1fr 40px', gap: '1.25rem', alignItems: 'flex-start', padding: '1.25rem', borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                {/* Image Thumbnail */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <img src={s.img} alt="" style={{ width: '100%', height: 95, borderRadius: 10, objectFit: 'cover', background: '#000', border: '1px solid var(--border-color)' }} />
                </div>

                {/* Input Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '0.75rem' }}>
                    <input
                      type="text"
                      value={s.tag}
                      onChange={e => { const copy = [...slides]; copy[i].tag = e.target.value; setSlides(copy); }}
                      placeholder="Tag (VD: ✨ Nổi Bật)"
                      style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8rem' }}
                    />
                    <input
                      type="text"
                      value={s.title}
                      onChange={e => { const copy = [...slides]; copy[i].title = e.target.value; setSlides(copy); }}
                      placeholder="Tiêu đề banner..."
                      style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.9rem' }}
                    />
                  </div>

                  <input
                    type="text"
                    value={s.desc}
                    onChange={e => { const copy = [...slides]; copy[i].desc = e.target.value; setSlides(copy); }}
                    placeholder="Mô tả..."
                    style={{ padding: '0.45rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                  />

                  {/* Image URL & Upload Button */}
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={s.img}
                      onChange={e => { const copy = [...slides]; copy[i].img = e.target.value; setSlides(copy); }}
                      placeholder="URL Hình ảnh..."
                      style={{ flex: 1, padding: '0.4rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.775rem' }}
                    />

                    {/* Local File Upload for Slide */}
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.75rem', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.775rem', border: '1px solid var(--border-color)', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                      {uploadingSlideId === s.id ? <FiLoader className="spin" /> : <FiUpload />}
                      Chọn Ảnh
                      <input
                        type="file"
                        accept="image/*"
                        style={{ display: 'none' }}
                        onChange={evt => handleSlideFileUpload(i, evt)}
                      />
                    </label>
                  </div>
                </div>

                {/* Delete Slide */}
                <button
                  type="button"
                  onClick={() => setSlides(slides.filter((_, idx) => idx !== i))}
                  style={{ border: 'none', background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', cursor: 'pointer', padding: '0.625rem', borderRadius: 10, alignSelf: 'center' }}
                  title="Xóa Slide">
                  <FiTrash2 style={{ fontSize: '1.1rem' }} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', padding: '0.9rem 2.25rem', borderRadius: 12, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: '1rem', border: 'none', cursor: isSubmitting ? 'not-allowed' : 'pointer', alignSelf: 'flex-start', boxShadow: '0 6px 20px rgba(26, 92, 255, 0.3)' }}
          id="save-content-btn">
          {isSubmitting ? <><FiLoader className="spin" /> Đang Lưu...</> : <><FiSave /> Lưu Cập Nhật Website</>}
        </button>
      </form>
    </AdminLayout>
  );
};

export default ContentEditPage;
