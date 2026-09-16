import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiClock, FiFolder, FiAlertCircle, FiSearch } from 'react-icons/fi';
import AdminLayout from '@/components/layout/AdminLayout';
import ConfirmModal from '@/components/ui/ConfirmModal';
import Pagination from '@/components/ui/Pagination';
import { useAppDispatch, useAppSelector } from '@/hooks/useAppStore';
import {
  fetchServicesThunk,
  fetchServiceCategoriesThunk,
  createServiceThunk,
  updateServiceThunk,
  deleteServiceThunk,
  createServiceCategoryThunk,
  deleteServiceCategoryThunk
} from '@/features/servicesSlice';
import type { ServiceItem } from '@/types';

interface ToastState {
  type: 'success' | 'error';
  text: string;
}

const ServicesEditPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { items, categories } = useAppSelector(s => s.services);

  const [editingService, setEditingService] = useState<Partial<ServiceItem> | null>(null);
  const [imagesInput, setImagesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('✨');

  const [toastMsg, setToastMsg] = useState<ToastState | null>(null);
  const [catModalMsg, setCatModalMsg] = useState<ToastState | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; title: string } | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<{ id: string; name: string } | null>(null);

  // Search, Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 3000);
  };

  const showCatMsg = (text: string, type: 'success' | 'error' = 'success') => {
    setCatModalMsg({ text, type });
    setTimeout(() => setCatModalMsg(null), 3000);
  };

  useEffect(() => {
    dispatch(fetchServicesThunk());
    dispatch(fetchServiceCategoriesThunk());
  }, [dispatch]);

  const openNewModal = () => {
    const defaultImg = 'https://placehold.co/600x400/1e293b/94a3b8?text=Image+Placeholder';
    const defaultTags = ['detailing', 'rửa xe'];
    setEditingService({
      id: '',
      name: '',
      slug: '',
      categoryId: '',
      shortDescription: '',
      description: '',
      priceFrom: 0,
      priceTo: undefined,
      duration: '45 phút',
      images: [defaultImg],
      videoUrl: '',
      tags: defaultTags,
      isActive: true,
      createdAt: new Date().toISOString(),
    });
    setImagesInput(defaultImg);
    setTagsInput(defaultTags.join(', '));
    setIsModalOpen(true);
  };

  const openEditModal = (svc: ServiceItem) => {
    setEditingService({ ...svc });
    setImagesInput((svc.images || []).join(', '));
    setTagsInput((svc.tags || []).join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingService) return;

    if (!editingService.categoryId) {
      showToast('Vui lòng chọn danh mục cho dịch vụ!', 'error');
      return;
    }
    if (!editingService.name || !editingService.name.trim()) {
      showToast('Vui lòng nhập tên dịch vụ!', 'error');
      return;
    }
    if (!editingService.priceFrom || editingService.priceFrom <= 0) {
      showToast('Vui lòng nhập giá từ dịch vụ hợp lệ!', 'error');
      return;
    }

    const slug = editingService.slug || editingService.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    const finalImages = imagesInput.split(',').map(s => s.trim()).filter(Boolean);
    const finalTags = tagsInput.split(',').map(s => s.trim()).filter(Boolean);

    const isExisting = items.some(s => s.id === editingService.id);

    try {
      if (isExisting && editingService.id) {
        const finalSvc = { ...editingService, slug, images: finalImages, tags: finalTags } as ServiceItem;
        await dispatch(updateServiceThunk({ id: finalSvc.id, data: finalSvc })).unwrap();
        showToast('Đã cập nhật dịch vụ thành công!');
      } else {
        const createPayload = {
          categoryId: editingService.categoryId,
          name: editingService.name.trim(),
          slug,
          shortDescription: editingService.shortDescription || '',
          description: editingService.description || '',
          priceFrom: editingService.priceFrom,
          priceTo: editingService.priceTo,
          duration: editingService.duration,
          images: finalImages,
          tags: finalTags,
          isActive: editingService.isActive ?? true
        };
        await dispatch(createServiceThunk(createPayload)).unwrap();
        showToast('Đã thêm dịch vụ mới thành công!');
      }

      setIsModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Lưu dịch vụ thất bại!', 'error');
    }
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    const { id } = serviceToDelete;
    setServiceToDelete(null);
    try {
      await dispatch(deleteServiceThunk(id)).unwrap();
      showToast('Đã xóa dịch vụ.');
    } catch (err: any) {
      showToast(err.message || 'Xóa dịch vụ thất bại!', 'error');
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    try {
      const slug = newCatName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      await dispatch(createServiceCategoryThunk({ name: newCatName.trim(), icon: newCatIcon.trim() || '✨', slug })).unwrap();
      setNewCatName('');
      showCatMsg('Đã thêm danh mục mới thành công!');
      showToast('Đã thêm danh mục mới!');
    } catch (err: any) {
      showCatMsg(err.message || 'Lỗi khi thêm danh mục', 'error');
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    const { id } = categoryToDelete;
    setCategoryToDelete(null);
    try {
      await dispatch(deleteServiceCategoryThunk(id)).unwrap();
      showCatMsg('Đã xóa danh mục.');
      showToast('Đã xóa danh mục.');
    } catch (err: any) {
      showCatMsg(err.message || 'Lỗi khi xóa danh mục', 'error');
    }
  };

  return (
    <AdminLayout>
      {/* Floating Toast Notification on top of everything */}
      {toastMsg && (
        <div style={{
          position: 'fixed',
          top: '24px',
          right: '24px',
          zIndex: 99999,
          background: toastMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
          color: toastMsg.type === 'error' ? '#991b1b' : '#15803d',
          border: `1px solid ${toastMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
          padding: '0.85rem 1.35rem',
          borderRadius: '14px',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.3)',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.925rem'
        }}>
          {toastMsg.type === 'error' ? <FiAlertCircle style={{ fontSize: '1.2rem' }} /> : <FiCheck style={{ fontSize: '1.2rem' }} />}
          {toastMsg.text}
        </div>
      )}

      <div className="admin-page-header" style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h1 className="admin-page-title" style={{ fontSize: '1.5rem', fontWeight: 800 }}>Quản Lý Dịch Vụ Detailing & Sửa Chữa</h1>
          <p className="admin-page-sub" style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Chỉnh sửa thông tin, bảng giá tham khảo, hình ảnh, video & danh mục dịch vụ</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', width: '100%', maxWidth: 'max-content' }}>
          <button
            onClick={() => setIsCatModalOpen(true)}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1rem', borderRadius: 10, background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', fontWeight: 600, cursor: 'pointer', flex: 1, whiteSpace: 'nowrap' }}
            id="manage-service-cats-btn"
          >
            <FiFolder /> Quản Lý Danh Mục
          </button>
          <button
            onClick={openNewModal}
            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.625rem 1.25rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', flex: 1, whiteSpace: 'nowrap' }}
            id="add-new-service-btn"
          >
            <FiPlus /> Thêm Dịch Vụ Mới
          </button>
        </div>
      </div>

      {/* Toolbar: Search & Filters */}
      <div style={{ background: 'var(--bg-card)', padding: '1rem', borderRadius: 16, border: '1px solid var(--border-color)', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ position: 'relative', width: 280, maxWidth: '100%' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Tìm theo tên dịch vụ, slug..."
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2.2rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontSize: '0.875rem',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả danh mục</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.icon ? `${c.icon} ` : ''}{c.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            style={{
              padding: '0.5rem 0.75rem',
              borderRadius: 10,
              border: '1px solid var(--border-color)',
              background: 'var(--bg-secondary)',
              color: 'var(--text-primary)',
              fontWeight: 600,
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hiển Thị</option>
            <option value="hidden">Ẩn</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      <div style={{ background: 'var(--bg-card)', borderRadius: 16, border: '1px solid var(--border-color)', overflowX: 'auto' }}>
        <table className="admin-table" style={{ width: '100%', minWidth: 650 }}>
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
            {(() => {
              const filtered = items.filter(svc => {
                if (categoryFilter !== 'all' && svc.categoryId !== categoryFilter) return false;
                if (statusFilter === 'active' && !svc.isActive) return false;
                if (statusFilter === 'hidden' && svc.isActive) return false;
                if (searchQuery.trim()) {
                  const q = searchQuery.toLowerCase().trim();
                  return (
                    svc.name.toLowerCase().includes(q) ||
                    (svc.slug || '').toLowerCase().includes(q) ||
                    (svc.shortDescription || '').toLowerCase().includes(q)
                  );
                }
                return true;
              });

              const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

              if (filtered.length === 0) {
                return (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-muted)' }}>
                      Không tìm thấy dịch vụ nào phù hợp với bộ lọc.
                    </td>
                  </tr>
                );
              }

              return paginated.map(svc => {
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
                      <span style={{ fontSize: '0.8rem', background: 'var(--bg-tertiary)', padding: '0.2em 0.6em', borderRadius: 6, whiteSpace: 'nowrap' }}>
                        {cat?.name || 'Chưa phân loại'}
                      </span>
                    </td>
                    <td>
                      <strong style={{ color: 'var(--accent-primary)' }}>{svc.priceFrom.toLocaleString('vi-VN')}₫</strong>
                      {svc.priceTo && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}> – {svc.priceTo.toLocaleString('vi-VN')}₫</span>}
                    </td>
                    <td>{svc.duration || '—'}</td>
                    <td>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2em 0.6em', borderRadius: 9999, background: svc.isActive ? '#dcfce7' : '#fee2e2', color: svc.isActive ? '#15803d' : '#b91c1c' }}>
                        {svc.isActive ? 'Hiển Thị' : 'Ẩn'}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button onClick={() => openEditModal(svc)} className="btn-del-icon" title="Sửa"><FiEdit2 /></button>
                        <button onClick={() => setServiceToDelete({ id: svc.id, title: svc.name })} className="btn-del-icon" title="Xóa"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                );
              });
            })()}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {(() => {
        const filtered = items.filter(svc => {
          if (categoryFilter !== 'all' && svc.categoryId !== categoryFilter) return false;
          if (statusFilter === 'active' && !svc.isActive) return false;
          if (statusFilter === 'hidden' && svc.isActive) return false;
          if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            return (
              svc.name.toLowerCase().includes(q) ||
              (svc.slug || '').toLowerCase().includes(q) ||
              (svc.shortDescription || '').toLowerCase().includes(q)
            );
          }
          return true;
        });

        return (
          <Pagination
            currentPage={currentPage}
            totalPages={Math.ceil(filtered.length / pageSize) || 1}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={setCurrentPage}
            onPageSizeChange={ps => { setPageSize(ps); setCurrentPage(1); }}
          />
        );
      })()}

      {/* Category Management Modal */}
      {isCatModalOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '0.75rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 480, padding: '1.25rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>Quản Lý Danh Mục Dịch Vụ</h3>
              <button onClick={() => setIsCatModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer', padding: '0.25rem' }}><FiX /></button>
            </div>

            {/* Inline Notification inside Modal */}
            {catModalMsg && (
              <div style={{
                background: catModalMsg.type === 'error' ? '#fef2f2' : '#dcfce7',
                color: catModalMsg.type === 'error' ? '#991b1b' : '#15803d',
                border: `1px solid ${catModalMsg.type === 'error' ? '#fecaca' : '#bbf7d0'}`,
                padding: '0.5rem 0.75rem',
                borderRadius: 8,
                fontSize: '0.825rem',
                fontWeight: 600,
                marginBottom: '0.75rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                {catModalMsg.type === 'error' ? <FiAlertCircle /> : <FiCheck />}
                {catModalMsg.text}
              </div>
            )}

            {/* Form Add Category */}
            <form onSubmit={handleAddCategory} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  type="text"
                  placeholder="✨"
                  value={newCatIcon}
                  onChange={e => setNewCatIcon(e.target.value)}
                  style={{ width: '60px', padding: '0.625rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.1rem' }}
                  title="Biểu tượng Emoji"
                />
                <input
                  type="text"
                  required
                  placeholder="Tên danh mục mới..."
                  value={newCatName}
                  onChange={e => setNewCatName(e.target.value)}
                  style={{ flex: 1, padding: '0.625rem 0.875rem', borderRadius: 10, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}
                />
              </div>
              <button type="submit" style={{ width: '100%', padding: '0.65rem', borderRadius: 10, background: 'var(--accent-primary)', color: 'white', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.9rem' }}>
                + Thêm Danh Mục Dịch Vụ
              </button>
            </form>

            {/* List Existing Categories */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '260px', overflowY: 'auto', paddingRight: '0.25rem' }}>
              {categories.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Chưa có danh mục dịch vụ nào.</div>
              ) : categories.map(c => (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.625rem 0.75rem', background: 'var(--bg-secondary)', borderRadius: 10, border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, overflow: 'hidden' }}>
                    <span style={{ fontSize: '1.1rem', flexShrink: 0 }}>{c.icon || '✨'}</span>
                    <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      <strong style={{ color: 'var(--text-primary)', fontSize: '0.875rem', display: 'block' }}>{c.name}</strong>
                      <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{c.slug}</span>
                    </div>
                  </div>
                  <button onClick={() => setCategoryToDelete({ id: c.id, name: c.name })} style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.35rem', flexShrink: 0 }} title="Xóa danh mục">
                    <FiTrash2 />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {isModalOpen && editingService && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '0.75rem' }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 20, border: '1px solid var(--border-color)', width: '100%', maxWidth: 700, maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {items.some(s => s.id === editingService.id) ? 'Chỉnh Sửa Dịch Vụ' : 'Thêm Dịch Vụ Mới'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} style={{ border: 'none', background: 'none', color: 'var(--text-muted)', fontSize: '1.25rem', cursor: 'pointer' }}><FiX /></button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Tên Dịch Vụ *</label>
                  <input type="text" required value={editingService.name || ''} onChange={e => setEditingService({ ...editingService, name: e.target.value })} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Danh Mục *</label>
                  <select
                    required
                    value={editingService.categoryId || ''}
                    onChange={e => setEditingService({ ...editingService, categoryId: e.target.value })}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none' }}
                  >
                    <option value="" disabled style={{ background: '#1e293b', color: '#94a3b8' }}>-- Chọn danh mục dịch vụ * --</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} style={{ background: '#1e293b', color: '#ffffff' }}>
                        {c.icon ? `${c.icon} ` : ''}{c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Từ (VND) *</label>
                  <input
                    type="number"
                    required
                    step={5000}
                    min={0}
                    placeholder="50000..."
                    value={editingService.priceFrom === 0 || editingService.priceFrom === undefined ? '' : editingService.priceFrom}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingService({ ...editingService, priceFrom: val ? Number(val) : 0 });
                    }}
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Giá Đến (VND)</label>
                  <input
                    type="number"
                    step={5000}
                    min={0}
                    value={editingService.priceTo === undefined || editingService.priceTo === 0 ? '' : editingService.priceTo}
                    onChange={e => {
                      const val = e.target.value;
                      setEditingService({ ...editingService, priceTo: val ? Number(val) : undefined });
                    }}
                    placeholder="150000..."
                    style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                  />
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
                <input type="text" value={imagesInput} onChange={e => setImagesInput(e.target.value)} style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>URL Video Mô Tả (Youtube Embed / MP4)</label>
                  <input type="text" value={editingService.videoUrl || ''} onChange={e => setEditingService({ ...editingService, videoUrl: e.target.value })} placeholder="https://..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>Hashtag (Phân cách dấu phẩy)</label>
                  <input type="text" value={tagsInput} onChange={e => setTagsInput(e.target.value)} placeholder="ceramic, rua-xe..." style={{ width: '100%', padding: '0.625rem', borderRadius: 8, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)' }} />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '1rem' }}>
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
      {/* Confirm Delete Service Modal */}
      <ConfirmModal
        isOpen={!!serviceToDelete}
        title="Xác nhận xóa dịch vụ"
        message={serviceToDelete ? `Bạn có chắc chắn muốn xóa dịch vụ "${serviceToDelete.title}" khỏi cơ sở dữ liệu?` : ''}
        confirmText="Xóa Dịch Vụ"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteService}
        onCancel={() => setServiceToDelete(null)}
      />

      {/* Confirm Delete Category Modal */}
      <ConfirmModal
        isOpen={!!categoryToDelete}
        title="Xác nhận xóa danh mục dịch vụ"
        message={categoryToDelete ? `Bạn có chắc chắn muốn xóa danh mục "${categoryToDelete.name}"?` : ''}
        confirmText="Xóa Danh Mục"
        cancelText="Hủy"
        type="danger"
        onConfirm={handleConfirmDeleteCategory}
        onCancel={() => setCategoryToDelete(null)}
      />
    </AdminLayout>
  );
};

export default ServicesEditPage;
