import React, { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiClock, FiDollarSign, FiTag, FiCheck, FiVideo, FiImage } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import { addService, updateService, deleteService } from '@/features/servicesSlice';
import type { ServiceItem } from '@/types';

const ServicesEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories } = useAppSelector(s => s.services);

  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const openNewModal = () => {
    setEditingService({
      id: 'svc_' + Date.now(),
      name: '',
      slug: '',
      categoryId: categories[0]?.id || 'cat1',
      shortDescription: '',
      description: '',
      priceFrom: 100000,
      priceTo: 300000,
      duration: '45 phút',
      images: ['https://images.unsplash.com/photo-1607860108855-64acf2078ed9?w=600'],
      videoUrl: '',
      tags: ['detailing', 'gửa xe'],
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService({ ...svc });
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService || !editingService.name) return;

    const slug = editingService.slug || editingService.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalSvc = { ...editingService, slug } as ServiceItem;

    const exists = items.some(s => s.id === finalSvc.id);
    if (exists) {
      dispatch(updateService(finalSvc));
      setSuccessMsg('Đã cập nhật dịch vụ!');
    } else {
      dispatch(addService(finalSvc));
      setSuccessMsg('Đã thêm dịch vụ mới!');
    }

    setIsModalOpen(false);
    setTimeout(() => setSuccessMsg(''), 2500);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa dịch vụ này?')) {
      dispatch(deleteService(id));
      setSuccessMsg('Đã xóa dịch vụ.');
      setTimeout(() => setSuccessMsg(''), 2500);
    }
  };

  return (
    <AdminLayout>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 className="admin-page-title">Quản Lý Dịch Vụ Detailing & Sửa Chữa</h1>
          <p className="admin-page-sub">Chỉnh sửa thông tin, bảng giá tham khảo, hình ảnh, video & danh mục dịch vụ</p>
        </div>
        <button onClick={openNewModal} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="add-new-service-btn">
          <FiPlus /> Thêm Dịch Vụ Mới
        </button>
      </div>

      {successMsg && (
        <div style={{ background: '#dcfce7', color: '#15803d', padding: '0.75rem 1rem', borderRadius: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem' }}>
          <FiCheck /> {successMsg}
        </div>
      )}

      {/* Services Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflow: 'hidden' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hình ảnh</th>
              <th>Tên Dịch Vụ</th>
              <th>Danh Mục</th>
              <th>Bảng Giá Tham Khảo</th>
              <th>Thời Gian</th>
              <th>Trạng Thái</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {items.map(svc => {
              const cat = categories.find(c => c.id === svc.categoryId);
              return (
                <tr key={svc.id}>
                  <td>
                    <img src={svc.images[0]} alt="" style={{ width: 56, height: 42, borderRadius: 8, objectFit: 'cover' }} />
                  </td>
                  <td>
                    <strong>{svc.name}</strong>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>/{svc.slug}</div>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.6em', borderRadius: 6 }}>
                      {cat?.icon} {cat?.name}
                    </span>
                  </td>
                  <td>
                    <strong style={{ color: 'var(--accent-primary)' }}>{svc.priceFrom.toLocaleString('vi-VN')}₫</strong>
                    {svc.priceTo && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> – {svc.priceTo.toLocaleString('vi-VN')}₫</span>}
                  </td>
                  <td><FiClock style={{ verticalAlign: 'middle', marginRight: 4 }} />{svc.duration || '—'}</td>
                  <td>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: svc.isActive ? '#dcfce7' : '#fee2e2', color: svc.isActive ? '#15803d' : '#b91c1c' }}>
                      {svc.isActive ? 'Hiển Thị' : 'Ẩn'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button onClick={() => openEditModal(svc)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                      <button onClick={() => handleDelete(svc.id)} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor Modal */}
      {isModalOpen && editingService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 750, maxHeight: '90vh', overflowY: 'auto', padding: '1.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(s => s.id === editingService.id) ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Dịch Vụ *</label>
                  <input type="text" required value={editingService.name || ''} onChange={e => setEditingService({ ...editingService, name: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Danh Mục *</label>
                  <select value={editingService.categoryId} onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Từ (VND) *</label>
                  <input type="number" required value={editingService.priceFrom || 0} onChange={e => setEditingService({ ...editingService, priceFrom: Number(e.target.value) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Đến (VND)</label>
                  <input type="number" value={editingService.priceTo || ''} onChange={e => setEditingService({ ...editingService, priceTo: e.target.value ? Number(e.target.value) : undefined })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Thời Gian Thực Hiện</label>
                  <input type="text" value={editingService.duration || ''} onChange={e => setEditingService({ ...editingService, duration: e.target.value })} placeholder="45 phút..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Ngắn (Hiển thị ở trang danh sách)</label>
                <input type="text" value={editingService.shortDescription || ''} onChange={e => setEditingService({ ...editingService, shortDescription: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Mô Tả Chi Tiết / Quy Trình (HTML / Text)</label>
                <textarea rows={5} value={editingService.description || ''} onChange={e => setEditingService({ ...editingService, description: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontFamily: 'monospace', fontSize: '0.85rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Hình Ảnh (Phân cách bằng dấu phẩy)</label>
                <input type="text" value={(editingService.images || []).join(', ')} onChange={e => setEditingService({ ...editingService, images: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Video Mô Tả (Youtube Embed / MP4)</label>
                  <input type="text" value={editingService.videoUrl || ''} onChange={e => setEditingService({ ...editingService, videoUrl: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hashtag (Phân cách dấu phẩy)</label>
                  <input type="text" value={(editingService.tags || []).join(', ')} onChange={e => setEditingService({ ...editingService, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })} placeholder="ceramic, rua-xe..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 600 }}>
                  <input type="checkbox" checked={editingService.isActive ?? true} onChange={e => setEditingService({ ...editingService, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
                  Hiển thị trên website
                </label>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} style={{ padding: '0.625rem 1.25rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontWeight: 600, cursor: 'pointer' }}>Hủy</button>
                  <button type="submit" style={{ padding: '0.625rem 1.5rem', borderRadius: 10, background: 'var(--accent-gradient)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer' }} id="save-service-modal-btn">Lưu Dịch Vụ</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default ServicesEditPage;
