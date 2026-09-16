import React, { useState, useEffect } from 'react';
import { FiSave, FiPlus, FiTrash2, FiCheck, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { serviceApi, BackendService } from '@/services/api/serviceApi';
import { productApi, BackendProduct } from '@/services/api/productApi';
import postApi, { PostDto } from '@/services/api/postApi';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5080/api';

interface HeroSlide {
  id: number;
  tag: string;
  title: string;
  description: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
  isNew?: boolean; // only for newly added slides not yet saved
  linkType: string;            // "none" | "service" | "post" | "product"
  linkedContentId?: string;
  linkedContentSlug?: string;
}

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const ContentEditPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shopName, setShopName] = useState('');
  const [tagline, setTagline] = useState('');
  const [logoIcon, setLogoIcon] = useState('🏍️');
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [slideToDelete, setSlideToDelete] = useState<HeroSlide | null>(null);

  // Content lists for link picker
  const [serviceList, setServiceList] = useState<BackendService[]>([]);
  const [postList, setPostList] = useState<PostDto[]>([]);
  const [productList, setProductList] = useState<BackendProduct[]>([]);
  const [contentLoading, setContentLoading] = useState(false);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 3000);
  };

  const getToken = () =>
    localStorage.getItem('auth_token') || localStorage.getItem('motoshine_token') || '';

  const apiFetch = (path: string, options?: RequestInit) =>
    fetch(`${API_BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
      ...options,
    });

  const fetchContentForLinkType = async (linkType: string) => {
    if (linkType === 'none') return;
    setContentLoading(true);
    try {
      if (linkType === 'service' && serviceList.length === 0) {
        const items = await serviceApi.getServices();
        setServiceList(items.filter(s => s.isActive));
      } else if (linkType === 'post' && postList.length === 0) {
        const items = await postApi.getPosts();
        setPostList(items);
      } else if (linkType === 'product' && productList.length === 0) {
        const items = await productApi.getProducts();
        setProductList(items.filter(p => p.isActive));
      }
    } catch {
      // silent fail — admin can still type manually
    } finally {
      setContentLoading(false);
    }
  };

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [contentRes, slidesRes] = await Promise.all([
        fetch(`${API_BASE_URL}/content`),
        fetch(`${API_BASE_URL}/content/slides`),
      ]);
      const [contentJson, slidesJson] = await Promise.all([
        contentRes.json(),
        slidesRes.json(),
      ]);

      if (contentJson.shopName) {
        setShopName(contentJson.shopName || '');
        setTagline(contentJson.tagline || '');
        setLogoIcon(contentJson.logoIcon || '🏍️');
      }
      setSlides(Array.isArray(slidesJson.data) ? slidesJson.data.map((s: any) => ({
        ...s,
        linkType: s.linkType || 'none',
        linkedContentId: s.linkedContentId || '',
        linkedContentSlug: s.linkedContentSlug || '',
      })) : []);

      // Pre-fetch content lists for already-linked slides
      const linkedTypes = new Set(
        (Array.isArray(slidesJson.data) ? slidesJson.data : [])
          .map((s: any) => (s.linkType || 'none').toLowerCase())
          .filter((t: string) => t !== 'none')
      );
      Array.from(linkedTypes).forEach((type) => fetchContentForLinkType(type as string));
    } catch (err: any) {
      showToast('Không thể tải dữ liệu từ server.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Save branding info only
  const handleSaveBranding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shopName.trim()) return;
    setIsSaving(true);
    try {
      const res = await apiFetch('/content', {
        method: 'PUT',
        body: JSON.stringify({ shopName, tagline, logoIcon }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.message || `Lỗi ${res.status}`);
      showToast('Đã cập nhật thông tin website thành công!');
    } catch (err: any) {
      showToast(err.message || 'Cập nhật thất bại.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const addSlide = () => {
    const tempId = -(Date.now()); // negative id marks "new, not saved"
    setSlides([...slides, {
      id: tempId,
      tag: '',
      title: '',
      description: '',
      imageUrl: 'https://placehold.co/700x400/1e293b/94a3b8?text=Banner+Placeholder',
      sortOrder: slides.length,
      isActive: true,
      isNew: true,
      linkType: 'none',
      linkedContentId: '',
      linkedContentSlug: '',
    }]);
  };

  const saveSlide = async (slide: HeroSlide) => {
    if (!slide.title.trim()) {
      showToast('Vui lòng nhập Tiêu đề Banner trước khi lưu!', 'error');
      return;
    }
    try {
      if (slide.isNew) {
        // POST
        const res = await apiFetch('/content/slides', {
          method: 'POST',
          body: JSON.stringify({
            tag: slide.tag,
            title: slide.title,
            description: slide.description,
            imageUrl: slide.imageUrl,
            sortOrder: slide.sortOrder,
            linkType: slide.linkType !== 'none' ? slide.linkType : undefined,
            linkedContentId: slide.linkedContentId ? slide.linkedContentId : undefined,
            linkedContentSlug: slide.linkedContentSlug ? slide.linkedContentSlug : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Tạo slide thất bại');
        // Replace temp slide with real saved slide
        setSlides(prev => prev.map(s => s.id === slide.id ? { ...json.data, isNew: false } : s));
        showToast('Đã lưu slide mới thành công!');
      } else {
        // PUT
        const res = await apiFetch(`/content/slides/${slide.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            tag: slide.tag,
            title: slide.title,
            description: slide.description,
            imageUrl: slide.imageUrl,
            sortOrder: slide.sortOrder,
            linkType: slide.linkType !== 'none' ? slide.linkType : undefined,
            linkedContentId: slide.linkedContentId ? slide.linkedContentId : undefined,
            linkedContentSlug: slide.linkedContentSlug ? slide.linkedContentSlug : undefined,
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || 'Cập nhật slide thất bại');
        showToast('Đã cập nhật slide thành công!');
      }
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi lưu slide.', 'error');
    }
  };

  const handleConfirmDeleteSlide = async () => {
    if (!slideToDelete) return;
    const slide = slideToDelete;
    setSlideToDelete(null);

    if (slide.isNew) {
      setSlides(prev => prev.filter(s => s.id !== slide.id));
      showToast('Đã hủy bỏ slide mới.');
      return;
    }
    try {
      const res = await apiFetch(`/content/slides/${slide.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Xóa slide thất bại');
      setSlides(prev => prev.filter(s => s.id !== slide.id));
      showToast('Đã xóa slide khỏi hệ thống.');
    } catch (err: any) {
      showToast(err.message || 'Lỗi khi xóa slide.', 'error');
    }
  };

  const updateLocalSlide = (id: number, field: keyof HeroSlide, value: string | number | boolean) => {
    setSlides(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  return (
    <AdminLayout>
      {/* Floating Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 99999,
          background: toast.type === 'error' ? '#fef2f2' : '#dcfce7',
          color: toast.type === 'error' ? '#991b1b' : '#15803d',
          border: `1px solid ${toast.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.85rem 1.35rem', borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.925rem'
        }}>
          {toast.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
          {toast.text}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản Lý Nội Dung Trang Chủ & Banner</h1>
          <p className="admin-page-sub" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Chỉnh sửa Slide Banner, Tên Cửa Hàng & Khẩu Hiệu Quảng Cáo</p>
        </div>
        <button onClick={fetchAll} disabled={isLoading} title="Tải lại từ Database" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 0.8rem', border: '1px solid var(--border-color)', borderRadius: 8, background: 'var(--bg-card)', color: 'var(--text-muted)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem' }}>
          <FiRefreshCw /> Làm mới
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Đang tải dữ liệu từ Database…</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: 900 }}>

          {/* Branding */}
          <form onSubmit={handleSaveBranding}>
            <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Branding Website</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Cửa Hàng</label>
                  <input type="text" required value={shopName} onChange={e => setShopName(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Khẩu Hiệu (Tagline)</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Logo Emoji Icon</label>
                  <input type="text" value={logoIcon} onChange={e => setLogoIcon(e.target.value)} style={{ width: '100%', padding: '0.625rem 0.875rem', borderRadius: 10, border: '1.5px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.2rem' }} />
                </div>
              </div>
              <button type="submit" disabled={isSaving} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, fontSize: '0.875rem', border: 'none', cursor: 'pointer' }}>
                <FiSave /> {isSaving ? 'Đang lưu...' : 'Lưu Thông Tin Website'}
              </button>
            </div>
          </form>

          {/* Hero Slides */}
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Banner Hero Slides ({slides.length})</h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--text-muted)' }}>Mỗi slide được lưu riêng vào database. Nhấn "Lưu Slide" để cập nhật từng slide.</p>
              </div>
              <button type="button" onClick={addSlide} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'var(--accent-light)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.85rem', border: 'none', cursor: 'pointer' }}>
                <FiPlus /> Thêm Slide
              </button>
            </div>

            {slides.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', borderRadius: 12, background: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
                Chưa có slide nào. Nhấn "+ Thêm Slide" để tạo slide banner đầu tiên.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {slides.map((s, idx) => (
                  <div key={s.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', padding: '1.25rem', borderRadius: 14, background: 'var(--bg-secondary)', border: `1px solid ${s.isNew ? 'var(--accent-primary)' : 'var(--border-color)'}` }}>
                    {/* Header line with thumbnail & status */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem', flexWrap: 'wrap' }}>
                      <div style={{ position: 'relative', width: 90, height: 60, borderRadius: 8, overflow: 'hidden', background: 'var(--bg-card)', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <img src={s.imageUrl} alt="" onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/120x80/1e293b/94a3b8?text=No+Image'; }} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 150 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Banner #{idx + 1}</strong>
                          {s.isNew ? (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#fef3c7', color: '#b45309', padding: '0.15em 0.5em', borderRadius: 999 }}>Chưa lưu DB</span>
                          ) : (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#dcfce7', color: '#15803d', padding: '0.15em 0.5em', borderRadius: 999 }}>Đã kết nối DB</span>
                          )}
                          {s.linkType && s.linkType !== 'none' && (
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, background: '#dbeafe', color: '#1d4ed8', padding: '0.15em 0.5em', borderRadius: 999 }}>
                              → {s.linkType === 'service' ? 'Dịch vụ' : s.linkType === 'post' ? 'Bài viết' : 'Sản phẩm'}
                              {s.linkedContentSlug ? `: ${s.linkedContentSlug}` : ''}
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.15rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '280px' }}>
                          {s.title || 'Chưa có tiêu đề'}
                        </div>
                      </div>
                    </div>

                    {/* Inputs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem' }}>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tag / Huy hiệu</label>
                        <input type="text" value={s.tag} onChange={e => updateLocalSlide(s.id, 'tag', e.target.value)} placeholder="Tag (✨ Dịch Vụ...)" style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.825rem' }} />
                      </div>
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Tiêu đề Banner *</label>
                        <input type="text" value={s.title} onChange={e => updateLocalSlide(s.id, 'title', e.target.value)} placeholder="Tiêu đề banner..." style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontWeight: 700, fontSize: '0.85rem' }} />
                      </div>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Mô tả nội dung</label>
                      <input type="text" value={s.description} onChange={e => updateLocalSlide(s.id, 'description', e.target.value)} placeholder="Mô tả..." style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }} />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>URL Hình ảnh Banner</label>
                      <input type="text" value={s.imageUrl} onChange={e => updateLocalSlide(s.id, 'imageUrl', e.target.value)} placeholder="https://..." style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.775rem' }} />
                    </div>

                    {/* Link Configuration */}
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                        Loại liên kết
                      </label>
                      <select
                        value={s.linkType}
                        onChange={e => {
                          const newType = e.target.value;
                          updateLocalSlide(s.id, 'linkType', newType);
                          // Clear previous selection when type changes
                          updateLocalSlide(s.id, 'linkedContentId', '');
                          updateLocalSlide(s.id, 'linkedContentSlug', '');
                          fetchContentForLinkType(newType);
                        }}
                        style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                      >
                        <option value="none">Không liên kết</option>
                        <option value="service">Dịch vụ (Service)</option>
                        <option value="post">Bài viết (Post)</option>
                        <option value="product">Sản phẩm (Product)</option>
                      </select>
                    </div>

                    {s.linkType !== 'none' && (
                      <div>
                        <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                          Chọn {s.linkType === 'service' ? 'dịch vụ' : s.linkType === 'post' ? 'bài viết' : 'sản phẩm'} liên kết
                        </label>
                        {contentLoading ? (
                          <div style={{ padding: '0.5rem 0.75rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-muted)', fontSize: '0.825rem' }}>
                            Đang tải danh sách...
                          </div>
                        ) : (
                          <select
                            value={s.linkedContentId || ''}
                            onChange={e => {
                              const selectedId = e.target.value;
                              // Find item to get its slug
                              let slug = '';
                              if (s.linkType === 'service') {
                                const item = serviceList.find(i => i.id === selectedId);
                                slug = item?.slug || '';
                              } else if (s.linkType === 'post') {
                                const item = postList.find(i => i.id === selectedId);
                                slug = item?.slug || '';
                              } else if (s.linkType === 'product') {
                                const item = productList.find(i => i.id === selectedId);
                                slug = item?.slug || '';
                              }
                              updateLocalSlide(s.id, 'linkedContentId', selectedId);
                              updateLocalSlide(s.id, 'linkedContentSlug', slug);
                            }}
                            style={{ width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: `1px solid ${s.linkedContentId ? 'var(--accent-primary)' : 'var(--border-color)'}`, background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem' }}
                          >
                            <option value="">-- Chọn {s.linkType === 'service' ? 'dịch vụ' : s.linkType === 'post' ? 'bài viết' : 'sản phẩm'} --</option>
                            {s.linkType === 'service' && serviceList.map(item => (
                              <option key={item.id} value={item.id}>{item.name} ({item.slug})</option>
                            ))}
                            {s.linkType === 'post' && postList.map(item => (
                              <option key={item.id} value={item.id}>{item.title} ({item.slug})</option>
                            ))}
                            {s.linkType === 'product' && productList.map(item => (
                              <option key={item.id} value={item.id}>{item.name} ({item.slug})</option>
                            ))}
                          </select>
                        )}
                        {/* Show selected slug as read-only confirmation */}
                        {s.linkedContentSlug && (
                          <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            Slug: <code style={{ background: 'var(--bg-secondary)', padding: '0.1em 0.4em', borderRadius: 4 }}>{s.linkedContentSlug}</code>
                            &nbsp;·&nbsp;ID: <code style={{ background: 'var(--bg-secondary)', padding: '0.1em 0.4em', borderRadius: 4, fontFamily: 'monospace', fontSize: '0.7rem' }}>{s.linkedContentId}</code>
                          </div>
                        )}
                        {/* Fallback: if list is empty (e.g. fetch failed), show manual input */}
                        {!contentLoading && s.linkType === 'service' && serviceList.length === 0 && (
                          <input
                            type="text"
                            value={s.linkedContentSlug || ''}
                            onChange={e => updateLocalSlide(s.id, 'linkedContentSlug', e.target.value)}
                            placeholder="Nhập slug thủ công..."
                            style={{ marginTop: '0.5rem', width: '100%', padding: '0.5rem 0.65rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.825rem', boxSizing: 'border-box' }}
                          />
                        )}
                      </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', paddingTop: '0.5rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap' }}>
                      <button type="button" onClick={() => saveSlide(s)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem 1.25rem', borderRadius: 8, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, fontSize: '0.825rem', border: 'none', cursor: 'pointer', flex: 1, minWidth: '120px' }}>
                        <FiSave /> {s.isNew ? 'Lưu Slide Mới' : 'Cập Nhật'}
                      </button>
                      <button type="button" onClick={() => setSlideToDelete(s)} style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.35rem', padding: '0.5rem 1rem', borderRadius: 8, background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', fontWeight: 600, fontSize: '0.825rem', cursor: 'pointer' }}>
                        <FiTrash2 /> Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Confirm Delete Slide Modal */}
      <ConfirmModal
        isOpen={!!slideToDelete}
        title="Xác nhận xóa Banner Slide"
        message={slideToDelete ? `Bạn có chắc chắn muốn xóa slide "${slideToDelete.title || 'Slide này'}"? Thao tác này không thể hoàn tác.` : ''}
        confirmText="Xóa Slide"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteSlide}
        onCancel={() => setSlideToDelete(null)}
      />
    </AdminLayout>
  );
};

export default ContentEditPage;
